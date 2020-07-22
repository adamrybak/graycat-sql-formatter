import * as vscode from 'vscode';
import * as formatter from './formatter';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('sql', {
		provideDocumentFormattingEdits: (document, options) => {
			let start = new vscode.Position(0, 0);
			let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
			let range = new vscode.Range(start, end);

			return formatter.format(document, range, options);
		}
	}));

	context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider('sql', {
		provideDocumentRangeFormattingEdits: (document, range, options) => {
			return formatter.format(document, range, options);
		}
	}));

}

export function deactivate() { }
