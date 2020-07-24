import * as vscode from 'vscode';
import * as formatter from './formatter';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('sql', {
		provideDocumentFormattingEdits: async (document, options) => {
			let start = new vscode.Position(0, 0);
			let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
			let range = new vscode.Range(start, end);

			let content = document.getText(range);
			let formatted = await formatter.format(content, options);

			return [new vscode.TextEdit(range, formatted)];
		}
	}));

	context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider('sql', {
		provideDocumentRangeFormattingEdits: async (document, range, options) => {
			let content = document.getText(range);
			let formatted = await formatter.format(content, options);

			return [new vscode.TextEdit(range, formatted)];
		}
	}));

}

export function deactivate() { }
