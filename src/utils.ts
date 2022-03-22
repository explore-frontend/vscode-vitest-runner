import * as path from 'path';

export function flatMap<T, U>(
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

export function getVscodeTypescriptPath(appRoot: string) {
    return path.join(
        appRoot,
        'extensions',
        'node_modules',
        'typescript',
        'lib',
        'typescript.js'
    );
}
