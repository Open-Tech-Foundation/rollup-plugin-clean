import { Plugin, PluginContext } from 'rollup';
import del from 'del';
import Path from 'path';
import { hasMagic } from 'globby';
import { statSync } from 'fs';

import { InputOptionsType, IinputObject, TargeType } from './InputOptionsType';
import { hasProp, isPlainObject } from './utils';

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

function joinCWDToTarget(target: string): string {
  return Path.join(process.cwd(), target);
}

async function deleteTarget(target: TargeType): Promise<void> {
  if (typeof target === 'string') {
    await del(joinCWDToTarget(target));
  } else {
    const deleteTargets = target.map(joinCWDToTarget);
    console.log('deleteTargets', deleteTargets);
    console.log('Dry: ', await del(deleteTargets, { dryRun: true }));
    await del(deleteTargets);
  }
}

async function cleanStrTarget(this: PluginContext, target: string) {
  if (!isValidPath(target)) {
    this.warn({ message: `Target path "${target}" is not found` });
  }
  await deleteTarget(target);
}

async function cleanArrTargets(this: PluginContext, target: string[]) {
  const unknownPaths = target.filter((path) => !isValidPath(path));
  if (unknownPaths.length > 0) {
    this.warn({
      message: `The following target paths are not found: \n\n${formatUnknownPaths(
        unknownPaths
      )}`,
    });
  }
  await deleteTarget(target);
}

async function cleanTargets(this: PluginContext, target: TargeType) {
  if (typeof target === 'string' && target.length > 0) {
    await cleanStrTarget.call(this, target);
    return;
  }

  if (typeof target === 'object' && Array.isArray(target)) {
    await cleanArrTargets.call(this, target);
    return;
  }

  this.warn({ message: 'Nothing to clean!' });
}

function isValidOptionObj(obj: IinputObject): boolean {
  if (Object.keys(obj).length === 0) return false;
  return Object.keys(obj).some((key) => ['start', 'end'].includes(key));
}

export default function clean(options: InputOptionsType): Plugin {
  console.log('From Clean Plugin: CWD ', process.cwd());
  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      if (isPlainObject(options)) {
        if (!isValidOptionObj(options as IinputObject)) {
          this.warn({
            message:
              'Invalid object passed!, the object must contain "start" or "end" prop',
          });
          return;
        }
        if (hasProp(options, 'start')) {
          await cleanTargets.call(
            this,
            (options as IinputObject).start as TargeType
          );
        }
      } else {
        await cleanTargets.call(this, options as TargeType);
      }
    },
    async buildEnd() {
      if (isPlainObject(options)) {
        if (!isValidOptionObj(options as IinputObject)) {
          this.warn({
            message:
              'Invalid object passed!, the object must contain "start" or "end" prop',
          });
          return;
        }
        if (hasProp(options, 'end')) {
          await cleanTargets.call(
            this,
            (options as IinputObject).end as TargeType
          );
        }
      }
    },
  };
}
