export default {
  input: 'built/index.js',
  output: [
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/plugin.es.js',
      format: 'es',
    },
  ],
  external: ['del', 'path', 'globby', 'fs'],
};
