import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
        file: 'dist/plugin.esm.js',
        format: 'esm',
      },
    external: ['del', 'path', 'globby', 'fs'],
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
  },
];
