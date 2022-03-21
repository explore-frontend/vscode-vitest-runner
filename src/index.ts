import * as ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode';
import * as path from 'path';

function flatMap<T, U>(
    items: readonly T[],
    map: (v: T) => U | readonly U[]
): U[] {
    const results: U[] = [];
    items.forEach(item => {
        const result = map(item);
        results.push(...(Array.isArray(result) ? result : [result]));
    });
    return results;
}

interface TextCase {
    start: number;
    end: number;
    text: string;
}

class RunVitestCommand implements vscode.Command {
    static ID = 'vitest.runTest';
    title = 'Run';
    command = RunVitestCommand.ID;
    arguments?: [string, string];

    constructor(text: string, filename: string) {
        this.arguments = [text, filename];
    }
}

class DevVitestCommand implements vscode.Command {
    static ID = 'vitest.devTest';
    title = 'Dev';
    command = DevVitestCommand.ID;
    arguments?: [string, string];

    constructor(text: string, filename: string) {
        this.arguments = [text, filename];
    }
}

function runInTerminal(text: string, filename: string, cmd: 'run' | 'dev') {
    const casePath = path.dirname(filename);

    const terminal = vscode.window.createTerminal(`vitest - ${cmd}`);

    const command = `cd ${JSON.stringify(
        casePath
    )} && npx vitest ${cmd} -t ${JSON.stringify(text)}`;
    terminal.sendText(command, true);
    terminal.show();
}

vscode.commands.registerCommand(
    RunVitestCommand.ID,
    (text: string, filename: string) => {
        runInTerminal(text, filename, 'run');
    }
);

vscode.commands.registerCommand(
    DevVitestCommand.ID,
    (text: string, filename: string) => {
        runInTerminal(text, filename, 'dev');
    }
);

const caseText = new Set(['it', 'describe']);

function tryGetVitestTestCase(
    callExpression: ts.CallExpression,
    file: ts.SourceFile
): TextCase | undefined {
    if (!ts.isIdentifier(callExpression.expression)) {
        return undefined;
    }

    if (!caseText.has(callExpression.expression.text)) {
        return undefined;
    }

    const args = callExpression.arguments;
    if (args.length < 2) {
        return undefined;
    }

    const [testName, body] = args;
    if (!ts.isStringLiteralLike(testName) || !ts.isFunctionLike(body)) {
        return undefined;
    }

    return {
        start: testName.getStart(file),
        end: testName.getEnd(),
        text: testName.text
    };
}

class CodeLensProvider implements vscode.CodeLensProvider {
    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
        const text = document.getText();
        const sourceFile = ts.createSourceFile(
            '',
            text,
            ts.ScriptTarget.Latest
        );
        const testCases: TextCase[] = [];

        visitor(sourceFile);

        return flatMap(testCases, x => {
            const start = document.positionAt(x.start);
            const end = document.positionAt(x.end);

            return [
                new vscode.CodeLens(
                    new vscode.Range(start, end),
                    new RunVitestCommand(x.text, document.fileName)
                )
                // new vscode.CodeLens(
                //     new vscode.Range(start, end),
                //     new DevVitestCommand(x.text, document.fileName)
                // )
            ];
        });

        function visitor(node: ts.Node) {
            if (token.isCancellationRequested) {
                return;
            }

            if (ts.isCallExpression(node)) {
                const testCase = tryGetVitestTestCase(node, sourceFile);
                if (testCase) {
                    testCases.push(testCase);
                }
            }
            ts.forEachChild(node, visitor);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            ['typescript', 'javascript'],
            new CodeLensProvider()
        )
    );
}
