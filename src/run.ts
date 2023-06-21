import * as vscode from 'vscode';
import * as path from 'path';
import * as findUp from 'find-up';
import { configFiles } from './vitest-config-files';

function getCwd(testFile: string) {
    const configFilePath = findUp.sync(configFiles, { cwd: testFile });

    if (!configFilePath) {
        return;
    }
    return path.dirname(configFilePath);
}

function buildVitestArgs({ caseName, casePath, sanitize = true }: { caseName: string, casePath: string, sanitize?: boolean }) {
    let sanitizedCasePath = casePath;
    if (sanitize) {
        sanitizedCasePath = JSON.stringify(casePath);
        caseName = JSON.stringify(caseName);
    }

    const args = ['vitest', 'run', '-t', caseName, '--dir', sanitizedCasePath];

    const rootDir = getCwd(casePath);
    if (rootDir) {
        args.push('--root', rootDir);
    }

    return args;
}

let terminal: vscode.Terminal | undefined;

export function runInTerminal(text: string, filename: string) {
    const casePath = path.dirname(filename);
    let terminalAlreadyExists = true;
    if (!terminal || terminal.exitStatus) {
        terminalAlreadyExists = false;
        terminal?.dispose();
        terminal = vscode.window.createTerminal(`vscode-vitest-runner`);
    }

    const vitestArgs = buildVitestArgs({ caseName: text, casePath: casePath });
    const npxArgs = ['npx', ...vitestArgs];

    if (terminalAlreadyExists) {
        // CTRL-C to stop the previous run
        terminal.sendText('\x03');
    }

    terminal.sendText(npxArgs.join(' '), true);
    terminal.show();
}

function buildDebugConfig(
    casePath: string,
    text: string
): vscode.DebugConfiguration {
    return {
        name: 'Debug vitest case',
        request: 'launch',
        runtimeArgs: buildVitestArgs({ caseName: text, casePath: casePath, sanitize: false }),
        cwd: getCwd(casePath) || casePath,
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
