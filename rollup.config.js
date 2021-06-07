export default {
  input: 'built/index.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
    },
  ],
  plugins: [],
  external: ['del', 'path', 'globby', 'fs'],
};
