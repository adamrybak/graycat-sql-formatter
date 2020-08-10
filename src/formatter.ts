import { TokenType, Token, TokenCollection } from './tokenizer';
import { Options, CaseType } from './options';

function adjust_case(tokens: TokenCollection, options: Options) {
    for (let i = 0; i < tokens.length; i++) {
        let transform = CaseType.Unchanged;

        switch (tokens[i].type) {
            case TokenType.LineComment:
                transform = options.case.line_comments;
                break;

            case TokenType.BlockComment:
                transform = options.case.block_comments;
                break;

            case TokenType.StringValue:
                transform = options.case.string_values;
                break;

            case TokenType.Literal:
                transform = options.case.literals;
                break;

            case TokenType.TopLevelKeyword:
            case TokenType.BlockOpenKeyword:
            case TokenType.BlockCloseKeyword:
            case TokenType.NewLineKeyword:
            case TokenType.IndentBlockOpenKeyword:
            case TokenType.Keyword:
                transform = options.case.keywords;
                break;

            case TokenType.Function:
                transform = options.case.functions;
                break;

            case TokenType.Identifier:
                transform = options.case.identifiers;
                break;
        }

        if (transform == CaseType.Lowercase) {
            tokens[i].text = tokens[i].text.toLowerCase();
        }

        else if (transform == CaseType.Uppercase) {
            tokens[i].text = tokens[i].text.toUpperCase();
        }

        adjust_case(tokens[i].children, options);
    }
}

function converge_blocks(tokens: TokenCollection, options: Options) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].children.length > 0
            && (tokens[i].type == TokenType.Function
                || tokens[i].type == TokenType.OpenParentheses
                || tokens[i].type == TokenType.BlockOpenKeyword)
        ) {
            let cancel = false;

            let block_text = tokens[i].text;
            let children = tokens[i].children.flatten();

            for (let j = 0; j < children.length; j++) {
                if (children[j].type == TokenType.NewLine) {
                    cancel = true;
                    break;
                }

                let parent = children[j].parent!;

                if ((parent.type == TokenType.Function
                    && (children[j].type == TokenType.OpenParentheses
                        || (j >= 1 && children[j - 1].type == TokenType.OpenParentheses)
                        || children[j].type == TokenType.CloseParentheses
                    ))
                    || (children[j].type == TokenType.Comma)
                    || (children[j].type == TokenType.EndOfStatement)
                ) { }

                else {
                    block_text += ' ';
                }

                block_text += children[j].text;

                if (block_text.length > options.blocks.max_width) {
                    cancel = true;
                    break;
                }
            }

            if (cancel == false) {
                tokens[i].type = TokenType.Block;
                tokens[i].text = block_text;
                tokens[i].children.clear();
            }
        }

        converge_blocks(tokens[i].children, options);
    }
}

function insert_new_lines(tokens: TokenCollection, options: Options) {
    tokens.insert((current_token, prev_token, _, prev_token2) => {
        if (
            prev_token !== undefined
            && prev_token.type != TokenType.NewLine
            && prev_token.type != TokenType.OpenParentheses
            && (current_token.type == TokenType.TopLevelKeyword
                || current_token.type == TokenType.BlockOpenKeyword
                || current_token.type == TokenType.BlockCloseKeyword
                || current_token.type == TokenType.NewLineKeyword)
        ) {
            return new Token(TokenType.NewLine, '\n', current_token.parent);
        }

        else if (
            prev_token !== undefined
            && (prev_token.type == TokenType.Comma || prev_token.type == TokenType.EndOfStatement)
            && current_token.type != TokenType.NewLine
            && current_token.type != TokenType.LineComment
            && current_token.type != TokenType.BlockComment
        ) {
            return new Token(TokenType.NewLine, '\n', current_token.parent);
        }

        else if (
            prev_token2 !== undefined
            && (prev_token2.type == TokenType.Comma || prev_token2.type == TokenType.EndOfStatement)
            && prev_token !== undefined
            && (prev_token.type == TokenType.LineComment
                || prev_token.type == TokenType.BlockComment)
            && current_token.type != TokenType.NewLine
        ) {
            return new Token(TokenType.NewLine, '\n', current_token.parent);
        }
    });
}

function insert_spaces(tokens: TokenCollection, options: Options) {
    tokens.insert((current_token, prev_token) => {
        if (prev_token !== undefined
            && prev_token.type != TokenType.NewLine
            && prev_token.type != TokenType.Whitespace
            && prev_token.type != TokenType.Function
            && current_token.type != TokenType.NewLine
            && current_token.type != TokenType.Whitespace
            && current_token.type != TokenType.Comma
            && current_token.type != TokenType.EndOfStatement
        ) {
            return new Token(TokenType.Whitespace, ' ', current_token.parent);
        }
    });
}

function insert_indents(tokens: TokenCollection, options: Options) {
    let line_length = options.initial_indent;
    let indents: number[] = [];

    const indent_length = (): number => {
        if (indents.length > 0) {
            return indents[indents.length - 1];
        }
        return options.initial_indent;
    };

    tokens.insert((current_token, prev_token) => {
        while (indents.length > current_token.level()) {
            indents.pop();
        }

        if (current_token.type == TokenType.CloseParentheses || current_token.type == TokenType.BlockCloseKeyword) {
            indents.pop();
        }

        let current_indent_length = indent_length();

        if (indents.length < current_token.level()
            && current_token.type != TokenType.CloseParentheses
            && current_token.type != TokenType.BlockCloseKeyword
        ) {
            let new_line_length = line_length + 1;

            if (prev_token.type == TokenType.Function && current_token.type == TokenType.OpenParentheses) {
                new_line_length += current_token.text.length;
            }

            else if (prev_token.type == TokenType.BlockOpenKeyword) {
                new_line_length += -prev_token.text.length + 3;
            }

            indents.push(new_line_length);
        }

        if (current_token.type == TokenType.NewLine) {
            line_length = 0;
        }
        else {
            line_length += current_token.text.length;
        }

        if (prev_token !== undefined
            && prev_token.type == TokenType.NewLine
            && current_token.type != TokenType.LineComment
            && current_token.type != TokenType.BlockComment
        ) {
            line_length += current_indent_length;
            return new Token(TokenType.Whitespace, ' '.repeat(current_indent_length), current_token.parent);
        }
    });
}

export const format = (content: string, options: Options): Promise<string> => {
    return new Promise((resolve) => {
        let tokens = new TokenCollection(content);

        adjust_case(tokens, options);
        converge_blocks(tokens, options);
        insert_new_lines(tokens, options);
        insert_spaces(tokens, options);
        insert_indents(tokens, options);

        resolve(tokens.flatten().map(x => x.text).join(''));
    });
}