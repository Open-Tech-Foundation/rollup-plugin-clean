import { Plugin, PluginContext } from 'rollup';
import del from 'del';
import Path from 'path';
import { hasMagic } from 'globby';
import { statSync } from 'fs';

import { InputOptionsType, IinputObject, TargeType } from './InputOptionsType';

function removeCWDFromPath(path: string): string {
  return path.replace(process.cwd(), '');
}

function formatUnknownPaths(paths: string[]): string {
  const pathsArr = paths.map(
    (path, index) => `${index + 1}. ${removeCWDFromPath(path)}`
  );
  return pathsArr.join('\n');
}

function isValidPath(target: string) {
  if (!hasMagic(target)) {
    try {
      statSync(Path.join(process.cwd(), target));
      return true;
    } catch (error) {
      return false;
    }
  }

  return true;
}

async function cleanStrTarget(this: PluginContext, target: string) {
  if (!isValidPath(target)) {
    this.warn({ message: `Target path "${target}" not found` });
  }
  await del(target);
}

async function cleanArrTargets(this: PluginContext, target: string[]) {
  const unknownPaths = target.filter((path) => !isValidPath(path));
  if (unknownPaths.length > 0) {
    this.warn({
      message: `The following target paths not found: \n\n${formatUnknownPaths(
        unknownPaths
      )}`,
    });
  }
  await del(target);
}

async function cleanTargets(this: PluginContext, target: TargeType) {
  if (typeof target === 'string' && target.length > 0) {
    cleanStrTarget.call(this, target);
    return;
  }

  if (typeof target === 'object' && Array.isArray(target)) {
    cleanArrTargets.call(this, target);
    return;
  }

  this.warn({ message: 'Nothing to clean!' });
}

export default function clean(options: InputOptionsType): Plugin {
  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      if (typeof options === 'object' && options?.constructor === Object) {
        await cleanTargets.call(
          this,
          (options as IinputObject).start as TargeType
        );
      } else {
        await cleanTargets.call(this, options as TargeType);
      }
    },
  };
}
