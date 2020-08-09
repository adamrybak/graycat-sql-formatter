import * as vscode from 'vscode';
import * as formatter from './formatter';
import { Options, CaseType } from './options';

function get_options(range: vscode.Range): Options {
    let config = vscode.workspace.getConfiguration('graycat-sql-formatter');

    return {
        initial_indent: range.start.character,

        case: {
            line_comments: CaseType[config.get('case.lineComments')! as keyof typeof CaseType],
            block_comments: CaseType[config.get('case.blockComments')! as keyof typeof CaseType],
            string_values: CaseType[config.get('case.stringValues')! as keyof typeof CaseType],
            literals: CaseType[config.get('case.literals')! as keyof typeof CaseType],
            keywords: CaseType[config.get('case.keywords')! as keyof typeof CaseType],
            functions: CaseType[config.get('case.functions')! as keyof typeof CaseType],
            identifiers: CaseType[config.get('case.identifiers')! as keyof typeof CaseType],
        }
    };
}

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('sql', {
        provideDocumentFormattingEdits: async (document) => {
            let start = new vscode.Position(0, 0);
            let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
            let range = new vscode.Range(start, end);

            let content = document.getText(range);
            let options = get_options(range);
            let formatted = await formatter.format(content, options);

            return [new vscode.TextEdit(range, formatted)];
        }
    }));

    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider('sql', {
        provideDocumentRangeFormattingEdits: async (document, range) => {
            let content = document.getText(range);
            let options = get_options(range);
            let formatted = await formatter.format(content, options);

            return [new vscode.TextEdit(range, formatted)];
        }
    }));

}

export function deactivate() { }
