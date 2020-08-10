import { TopLevelKeywords, NewLineKeywords, BlockKeywords, IndentBlockKeywords, Keywords } from './language';

export enum TokenType {
    Undefined,
    Whitespace,
    NewLine,
    LineComment,
    BlockComment,
    StringValue,
    NumberValue,
    Literal,
    OpenParentheses,
    CloseParentheses,
    Comma,
    EndOfStatement,
    Operator,
    TopLevelKeyword,
    NewLineKeyword,
    BlockOpenKeyword,
    BlockCloseKeyword,
    IndentBlockOpenKeyword,
    Keyword,
    Function,
    Identifier,
    Block,
}

export class Token {
    type: TokenType;
    text: string;
    parent: Token | undefined;
    children: TokenCollection;

    constructor(type: TokenType, text: string, parent?: Token) {
        this.type = type;
        this.text = text;
        this.parent = parent;
        this.children = new TokenCollection();
    }

    level(): number {
        let result = 0;

        let token: Token = this;
        while (token.parent !== undefined) {
            result += 1;
            token = token.parent;
        }

        return result;
    }

    block_close_keywords(): string[] {
        let result: string[] = [];

        if (this.type == TokenType.BlockOpenKeyword) {
            result = BlockKeywords.filter(x => x.open == this.text.toLowerCase()).map(x => x.close);
        }

        return result;
    }

    indent_block_close_keywords(): string[] {
        let result: string[] = [];

        if (this.type == TokenType.IndentBlockOpenKeyword) {
            result = IndentBlockKeywords.filter(x => x.open == this.text.toLowerCase()).map(x => x.close);
        }

        return result;
    }
}

// working regexes
const re_escape_regex = /[\\^$.*+?()[\]{}|]/g
const re_spaces = /\s+/g;

// working functions
function escape_regex(text: string): string {
    text = text.replace(re_escape_regex, '\\$&');
    text = text.replace(re_spaces, '\\s+');
    return text;
}

function build_word_regex(words: string[]): string {
    let result = words.sort((a, b) => {
        return b.length - a.length;
    });

    result = result.filter((a, b) => {
        return result.indexOf(a) === b
    });

    result = result.map(word => {
        return escape_regex(word);
    });

    return result.join('|');
}

function normalize_spaces(text: string): string {
    return text.replace(re_spaces, ' ');
}

// token regexes
const re_whitespace = /^[^\S\n]+/;
const re_line_comment = /^(\n)([^\S\n]*--.*?)([^\S\n]*)(\n|$)/;
const re_block_comment = /^(\n)([^\S\n]*\/\*.*?(\*\/|$))([^\S\n]*)(\n?)/s;
const re_new_line = /^\n/;
const re_line_comment_trailing = /^(--.*?)([^\S\n]*)(\n|$)/;
const re_block_comment_trailing = /^\/\*.*?(\*\/|$)/s;
const re_string_value = /^([nN]?'[^'\\]*(?:\\.[^'\\]*)*('|$))+/s;
const re_literal = /^((\[[^\]]*(\]|$))|(`[^`\\]*(?:\\.[^`\\]*)*(`|$))+|("[^"\\]*(?:\\.[^"\\]*)*("|$))+)/s;
const re_number_value = /^(-?[0-9]+(\.[0-9]*)?|-?\.[0-9]+|0x[0-9a-fA-F]+|0b[01]+)/;
const re_open_parentheses = /^\(/;
const re_close_parentheses = /^\)/;
const re_comma = /^,/;
const re_end_of_statement = /^;/;
const re_operator = /^[^\sa-zA-Z0-9\._@#\$,\(\)]+/;
const re_top_level_keyword = new RegExp(`^(${build_word_regex(TopLevelKeywords)})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_new_line_keyword = new RegExp(`^(${build_word_regex(NewLineKeywords)})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_block_open_keyword = new RegExp(`^(${build_word_regex(BlockKeywords.map(x => x.open))})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_block_close_keyword = new RegExp(`^(${build_word_regex(BlockKeywords.map(x => x.close))})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_indent_block_open_keyword = new RegExp(`^(${build_word_regex(IndentBlockKeywords.map(x => x.open))})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_keyword = new RegExp(`^(${build_word_regex(Keywords)})([^a-zA-Z0-9\._@#\$]|$)`, 'si');
const re_identifier = /^[a-zA-Z0-9\._@#\$\*]+/;

export class TokenCollection extends Array<Token> {
    constructor(content?: string) {
        super();

        if (content !== undefined) {
            this.parse(content);
        }
    }

    clear() {
        if (this.length > 0) {
            this.splice(0, this.length);
        }
    }

    parse(content: string) {
        this.clear();

        let last_token = new Token(TokenType.Undefined, '');
        let parents = new TokenCollection();

        const push_token = (type: TokenType, text: string, normalize: boolean = false) => {
            content = content!.substring(text.length);

            if (normalize) {
                text = normalize_spaces(text);
            }

            if (text.length > 0) {
                let token = new Token(type, text, parents[parents.length - 1]);

                if (parents.length == 0) {
                    this.push(token);
                }
                else {
                    parents[parents.length - 1].children.push(token);
                }

                if (token.type != TokenType.Whitespace && token.type != TokenType.NewLine) {
                    last_token = token;
                }
            }
        };

        const ignore_token = (text: string) => {
            content = content!.substring(text.length);
        };

        while (content.length > 0) {
            let token_match: string[] | null;

            token_match = content.match(re_whitespace);
            if (token_match) {
                ignore_token(token_match[0]);
                continue;
            }

            token_match = content.match(re_line_comment);
            if (token_match) {
                push_token(TokenType.NewLine, token_match[1]);
                push_token(TokenType.LineComment, token_match[2]);
                ignore_token(token_match[3]);
                push_token(TokenType.NewLine, token_match[4]);
                continue;
            }

            token_match = content.match(re_block_comment);
            if (token_match) {
                push_token(TokenType.NewLine, token_match[1]);
                push_token(TokenType.BlockComment, token_match[2]);
                ignore_token(token_match[4]);
                push_token(TokenType.NewLine, token_match[5]);
                continue;
            }

            token_match = content.match(re_new_line);
            if (token_match) {
                ignore_token(token_match[0]);
                continue;
            }

            token_match = content.match(re_line_comment_trailing);
            if (token_match) {
                push_token(TokenType.LineComment, token_match[1]);
                ignore_token(token_match[2]);
                push_token(TokenType.NewLine, token_match[3]);
                continue;
            }

            token_match = content.match(re_block_comment_trailing);
            if (token_match) {
                push_token(TokenType.BlockComment, token_match[0]);
                continue;
            }

            token_match = content.match(re_string_value);
            if (token_match) {
                push_token(TokenType.StringValue, token_match[0]);
                continue;
            }

            token_match = content.match(re_literal);
            if (token_match) {
                push_token(TokenType.Literal, token_match[0]);
                continue;
            }

            token_match = content.match(re_number_value);
            if (token_match) {
                push_token(TokenType.NumberValue, token_match[0]);
                continue;
            }

            token_match = content.match(re_open_parentheses);
            if (token_match) {
                let is_function = false;
                if (last_token.type == TokenType.Identifier) {
                    last_token.type = TokenType.Function;
                    parents.push(last_token);
                    is_function = true;
                }

                push_token(TokenType.OpenParentheses, token_match[0]);

                if (is_function == false) {
                    parents.push(last_token);
                }

                continue;
            }

            token_match = content.match(re_close_parentheses);
            if (token_match) {
                while (parents.length >= 1
                    && parents[parents.length - 1].type != TokenType.Function
                    && parents[parents.length - 1].type != TokenType.OpenParentheses
                    && parents[parents.length - 1].type != TokenType.BlockOpenKeyword
                ) {
                    parents.pop();
                }

                push_token(TokenType.CloseParentheses, token_match[0], false);

                if (parents.length >= 1
                    && (parents[parents.length - 1].type == TokenType.Function
                        || parents[parents.length - 1].type == TokenType.OpenParentheses)
                ) {
                    parents.pop();
                }

                continue;
            }

            token_match = content.match(re_comma);
            if (token_match) {
                push_token(TokenType.Comma, token_match[0]);
                continue;
            }

            token_match = content.match(re_end_of_statement);
            if (token_match) {
                push_token(TokenType.EndOfStatement, token_match[0]);
                continue;
            }

            token_match = content.match(re_operator);
            if (token_match) {
                push_token(TokenType.Operator, token_match[0]);
                continue;
            }

            token_match = content.match(re_top_level_keyword);
            if (token_match) {
                while (parents.length >= 1
                    && parents[parents.length - 1].type != TokenType.Function
                    && parents[parents.length - 1].type != TokenType.OpenParentheses
                    && parents[parents.length - 1].type != TokenType.BlockOpenKeyword
                ) {
                    parents.pop();
                }

                push_token(TokenType.TopLevelKeyword, token_match[1], true);

                parents.push(last_token);

                continue;
            }

            token_match = content.match(re_block_open_keyword);
            if (token_match) {
                push_token(TokenType.BlockOpenKeyword, token_match[1], true);

                parents.push(last_token);

                continue;
            }

            token_match = content.match(re_block_close_keyword);
            if (token_match) {
                while (parents.length >= 1
                    && parents[parents.length - 1].type != TokenType.Function
                    && parents[parents.length - 1].type != TokenType.OpenParentheses
                    && parents[parents.length - 1].type != TokenType.BlockOpenKeyword
                ) {
                    parents.pop();
                }

                push_token(TokenType.BlockCloseKeyword, token_match[1], true);

                if (parents.length >= 1
                    && parents[parents.length - 1].type == TokenType.BlockOpenKeyword
                    && parents[parents.length - 1].block_close_keywords().includes(last_token.text.toLowerCase())
                ) {
                    parents.pop();
                }

                continue;
            }

            token_match = content.match(re_new_line_keyword);
            if (token_match) {
                if (parents.length >= 1
                    && parents[parents.length - 1].type == TokenType.IndentBlockOpenKeyword
                    && parents[parents.length - 1].indent_block_close_keywords().includes(normalize_spaces(token_match[1]).toLowerCase())
                ) {
                    parents.pop();
                }

                push_token(TokenType.NewLineKeyword, token_match[1], true);

                continue;
            }

            token_match = content.match(re_indent_block_open_keyword);
            if (token_match) {
                push_token(TokenType.IndentBlockOpenKeyword, token_match[1], true);

                parents.push(last_token);

                continue;
            }

            token_match = content.match(re_keyword);
            if (token_match) {
                push_token(TokenType.Keyword, token_match[1], true);
                continue;
            }

            token_match = content.match(re_identifier);
            if (token_match) {
                push_token(TokenType.Identifier, token_match[0]);
                continue;
            }
        }
    }

    flatten(): TokenCollection {
        let tokens = new TokenCollection();

        for (let i = 0; i < this.length; i++) {
            tokens.push(this[i]);
            tokens.push(...this[i].children.flatten())
        }

        return tokens;
    }

    insert(callback: (current_token: Token, prev_token: Token, next_token: Token, prev_token2: Token, next_token2: Token) => Token | undefined) {
        let flat_collection = this.flatten();

        for (let i = 0; i < flat_collection.length; i++) {
            let result = callback(flat_collection[i], flat_collection[i - 1], flat_collection[i + 1], flat_collection[i - 2], flat_collection[i + 2]);

            if (result !== undefined) {
                if (flat_collection[i].parent === undefined) {
                    let index = this.indexOf(flat_collection[i]);
                    this.splice(index, 0, result);
                }
                else {
                    let parent = flat_collection[i].parent!;
                    let index = parent.children.indexOf(flat_collection[i]);
                    parent.children.splice(index, 0, result);
                }
            }
        }
    }
}