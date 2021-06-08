import dts from 'rollup-plugin-dts';

export default [
  {
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
  },
  {
    input: 'built/index.d.ts',
    output: [
      {
        file: 'dist/plugin.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
];
