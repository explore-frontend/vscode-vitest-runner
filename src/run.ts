import * as vscode from 'vscode';
import * as path from 'path';

function buildVitestArgs(text: string) {
    return ['vitest', 'run', '-t', text];
}

function buildCdArgs(path: string) {
    return ['cd', path];
}

export function runInTerminal(text: string, filename: string) {
    const casePath = path.dirname(filename);
    const terminal = vscode.window.createTerminal(`vitest - ${text}`);

    const casePathStr = JSON.stringify(casePath);
    const caseNameStr = JSON.stringify(text);

    const cdArgs = buildCdArgs(casePathStr);
    terminal.sendText(cdArgs.join(' '), true);

    const vitestArgs = buildVitestArgs(caseNameStr);
    const npxArgs = ['npx', ...vitestArgs];
    terminal.sendText(npxArgs.join(' '), true);
    terminal.show();
}

function buildDebugConfig(
    cwd: string,
    text: string
): vscode.DebugConfiguration {
    return {
        name: 'Debug vitest case',
        request: 'launch',
        runtimeArgs: buildVitestArgs(text),
        cwd,
        runtimeExecutable: 'npx',
        skipFiles: ['<node_internals>/**'],
        type: 'pwa-node',
        console: 'integratedTerminal',
        internalConsoleOptions: 'neverOpen'
    };
}

export function debugInTermial(text: string, filename: string) {
    const casePath = path.dirname(filename);
    const config = buildDebugConfig(casePath, text);
    vscode.debug.startDebugging(undefined, config);
}
