import { Plugin } from 'rollup';
import del from 'del';
import difference from 'lodash.difference';
import Path from 'path';

import InputOptionsType from './InputOptionsType';

function pathWithCWD(params: string[]): string[] {
  return params.map((path) => Path.join(process.cwd(), path));
}

function removeCWDFromPath(path: string): string {
  return path.replace(process.cwd(), '');
}

function formatUnknownPaths(paths: string[]): string {
  const pathsArr = paths.map(
    (path, index) => `${index + 1}. ${removeCWDFromPath(path)}`
  );
  return pathsArr.join('\n');
}

export default function clean(options: InputOptionsType): Plugin {
  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      console.log('Options: ', options);
      if (!options) {
        this.warn({ message: 'Nothing to clean!' });
      }
      if (typeof options === 'string') {
        const deletedPaths = await del(options);
        console.log('Deleted Paths: ', deletedPaths);
        if (deletedPaths.length === 0) {
          this.warn('Target path not found!');
        }
      }
      if (typeof options === 'object' && Array.isArray(options)) {
        const deletedPaths = await del(options);
        console.log('Deleted Paths: ', deletedPaths);
        const inputPaths = pathWithCWD(options);
        console.log('inputPaths: ', inputPaths);
        const unknownPaths = difference(inputPaths, deletedPaths);
        console.log('unknownPaths: ', unknownPaths);
        if (unknownPaths.length > 0) {
          this.warn(
            `The following target paths not found: \n\n${formatUnknownPaths(
              unknownPaths
            )}`
          );
        }
      }
    },
  };
}
