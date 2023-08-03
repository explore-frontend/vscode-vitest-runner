
const CONFIG_NAMES = [
  'vitest.config',
  'vite.config',
]

const CONFIG_EXTENSIONS = [
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
]

export const configFiles = CONFIG_NAMES.reduce((arr, name) => arr.concat(CONFIG_EXTENSIONS.map(ext => name + ext)), [] as string[]);
