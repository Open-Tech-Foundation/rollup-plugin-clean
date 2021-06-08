import { Plugin, PluginContext } from 'rollup';
import del from 'del';
import Path from 'path';
import { hasMagic } from 'globby';
import { statSync } from 'fs';

import { ITarget, TargetStringType, TargetType } from './TargetType';
import { hasProp, isArray, isPlainObject } from './utils';

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

async function deleteTarget(target: TargetStringType): Promise<void> {
  await del(target);
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

// Todo use isArray util
async function cleanTargets(this: PluginContext, target: TargetStringType) {
  if (typeof target === 'string' && target.length > 0) {
    await cleanStrTarget.call(this, target);
    return;
  }

  if (isArray(target)) {
    await cleanArrTargets.call(this, target as string[]);
    return;
  }

  this.warn({ message: 'Nothing to clean!' });
}

function isValidTargetObj(obj: ITarget): boolean {
  if (Object.keys(obj).length === 0) return false;
  return Object.keys(obj).some((key) => ['start', 'end'].includes(key));
}

export default function clean(target: TargetType): Plugin {
  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      if (isPlainObject(target)) {
        if (!isValidTargetObj(target as ITarget)) {
          this.warn({
            message:
              'Invalid object passed!, the object must contain "start" or "end" prop',
          });
          return;
        }
        if (hasProp(target, 'start')) {
          await cleanTargets.call(
            this,
            (target as ITarget).start as TargetStringType
          );
        }
      } else {
        await cleanTargets.call(this, target as TargetStringType);
      }
    },
    async buildEnd() {
      if (isPlainObject(target)) {
        if (!isValidTargetObj(target as ITarget)) {
          this.warn({
            message:
              'Invalid object passed!, the object must contain "start" or "end" prop',
          });
          return;
        }
        if (hasProp(target, 'end')) {
          await cleanTargets.call(
            this,
            (target as ITarget).end as TargetStringType
          );
        }
      }
    },
  };
}
