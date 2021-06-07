import clean from '@open-tech-world/rollup-plugin-clean';

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
  plugins: [clean(['dist', 'dist2'])],
  external: ['del', 'path', 'globby', 'fs'],
};
