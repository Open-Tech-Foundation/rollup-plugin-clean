# @open-tech-world/rollup-plugin-clean

> A rollup plugin to remove files and folders.

### Instal

With Yarn:

```sh
yarn add --dev @open-tech-world/rollup-plugin-clean
```

With Npm:

```sh
npm i --save-dev @open-tech-world/rollup-plugin-clean
```

### Usage

```js
// rollup.config.js
import clean from '@open-tech-world/rollup-plugin-clean';

export default {
  entry: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
  plugins: [
    clean('build')
  ]
};
```

### API Overview

#### **clean**

A function to delete files and folders in before/after build hooks.

```ts
clean(target: string | string[] | { start, end })
```

Props:

| Name | Type   | Default | Description                              |
| ---- | ------ | ------- | ---------------------------------------- |
| Target | String \| String[] \| { start, end } | undefined    | The target paths to remove. <br> The target string matched using glob pattern.<br> When an object is passed as target, use "start" prop in object to delete paths before rollup building and use "end" prop to delete paths after rollup build. |

#### License

MIT © [Thanga Ganapathy](https://github.com/ganapathy888)