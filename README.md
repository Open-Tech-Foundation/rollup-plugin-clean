<div align="center">

# @open-tech-world/rollup-plugin-clean

[![Linux Build](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/linux_build.yml/badge.svg)](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/linux_build.yml) [![macOS Build](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/macos_build.yml/badge.svg)](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/macos_build.yml) [![Windows Build](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/windows_build.yml/badge.svg)](https://github.com/open-tech-world/rollup-plugin-clean/actions/workflows/windows_build.yml) [![CodeFactor](https://www.codefactor.io/repository/github/open-tech-world/rollup-plugin-clean/badge)](https://www.codefactor.io/repository/github/open-tech-world/rollup-plugin-clean) ![npm (scoped)](https://img.shields.io/npm/v/@open-tech-world/rollup-plugin-clean?color=blue)

</div>

> A Rollup Plugin to clean files and directories using [glob](https://en.wikipedia.org/wiki/Glob_(programming)) patterns.

Internally it uses [open-tech-word/node-rm](https://github.com/open-tech-world/node-rm) for removing files & directories. Refer it for supported glob patterns & more info.

### Instal

Using Yarn

```sh
yarn add --dev @open-tech-world/rollup-plugin-clean
```

Using npm

```sh
npm install --save-dev @open-tech-world/rollup-plugin-clean
```

### Usage

```ts
import { clean } from '@open-tech-world/rollup-plugin-clean';

clean(patterns: string | string[], options?: Partial<IOptions>)
```

Options: 

| Name | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| dot | boolean | true | If false, it disables removing files & directories that begin with a `"."`(dot) character.
| hook | string | 'buildStart' | A Rollup hook to run the plugin. Refer the [Rollup docs for available hooks](https://rollupjs.org/guide/en/#build-hooks).
| dry | boolean | false | If true, it does not remove anything, instead, it console logs what would be removed.|

## Examples

It removes all files & directories inside the `build` dir.

```js
// rollup.config.js
import { clean } from '@open-tech-world/rollup-plugin-clean';

export default {
  entry: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'esm'
  }
  plugins: [
    clean('build/*')
  ]
};
```

It removes the `dist` dir.

```js
// rollup.config.js
import { clean } from '@open-tech-world/rollup-plugin-clean';

export default {
  entry: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  }
  plugins: [
    clean('dist')
  ]
};
```

It supports multiple patterns.

It cleans the `build` dir & ignores the `logo.png` file inside the `assets` dir.

```js
// rollup.config.js
import { clean } from '@open-tech-world/rollup-plugin-clean';

export default {
  entry: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  }
  plugins: [
    clean(['build/*', '!**/assets/logo.png'])
  ]
};
```

It runs the plugin in the `buildEnd` Rollup Hook.


```js
// rollup.config.js
import { clean } from '@open-tech-world/rollup-plugin-clean';

export default {
  entry: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  }
  plugins: [
    clean('build/*', { hook: 'buildEnd' })
  ]
};
```

#### License

Copyright (c) 2021, [Thanga Ganapathy](https://thanga-ganapathy.github.io) ([MIT License](./LICENSE)).
