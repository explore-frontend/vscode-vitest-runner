import type * as ts from 'typescript';
import * as vscode from 'vscode';
import { CodeLensProvider } from './codelens';
import { getVscodeTypescriptPath } from './utils';

export function activate(context: vscode.ExtensionContext) {
    const tsPath = getVscodeTypescriptPath(vscode.env.appRoot);
    const typescript = require(tsPath) as typeof ts;

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
            new CodeLensProvider(typescript)
        )
    );
}
