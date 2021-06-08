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
    clean('build/**') // Removes all files & folders inside the path.
  ]
};
```

### API Overview

#### **clean**

A function to delete files and folders in start or end build hooks.

```ts
clean(target: string | string[] | { start: target, end: target }, options: {dryRun: boolean})
```

Props:

| Name   | Type                                 | Default   | Description                                                                                                                                                                                                                                                      |
| ------ | ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| target | String \| String[] \| { start, end } | undefined | The target paths to remove. <br> The target string matched using glob pattern.<br>The default hook is **start** when string or string array passed. <br> When an object is passed as target, use **start** or **end** prop to specify the target paths to clean. |
| options | object | undefined | The options to control the behaviour of clean function.<br>See below table for options properties.|

Options: 

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| dryRun | Boolean | false | Flag to disable clean function and it reports paths to be cleaned in the console.

#### License

MIT © [Thanga Ganapathy](https://github.com/ganapathy888)
