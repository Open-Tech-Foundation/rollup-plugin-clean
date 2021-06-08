import { Plugin, PluginContext } from 'rollup';
import del from 'del';
import Path from 'path';
import { hasMagic } from 'globby';
import { statSync } from 'fs';

import { ITarget, TargetStringType, TargetType } from './TargetType';
import { hasProp, isArray, isPlainObject } from './utils';
import { IOptions } from './IOptions';

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

async function cleanStrTarget(
  this: PluginContext,
  target: string,
  options: IOptions
) {
  if (!isValidPath(target)) {
    warn.call(this, '`Target path "${target}" is not found`', options);
  }
  await deleteTarget(target);
}

async function cleanArrTargets(
  this: PluginContext,
  target: string[],
  options: IOptions
) {
  const unknownPaths = target.filter((path) => !isValidPath(path));
  if (unknownPaths.length > 0) {
    warn.call(
      this,
      `The following target paths are not found: \n\n${formatUnknownPaths(
        unknownPaths
      )}`,
      options
    );
  }
  await deleteTarget(target);
}

async function dryRun(
  this: PluginContext,
  target: TargetStringType,
  options: IOptions
): Promise<void> {
  warn.call(this, `Running in dry mode`, options);
  const dryPaths = await del(target, { dryRun: true });
  if (dryPaths.length === 0) {
    warn.call(this, 'No paths matched!', options);
    return;
  }
  log.call(this, 'The follwoing relative paths can be cleaned:', options);
  dryPaths.forEach((path, index) =>
    log.call(this, `${index + 1}. ${removeCWDFromPath(path)}`, options)
  );
}

function warn(this: PluginContext, msg: string, options: IOptions) {
  if (options?.silent) {
    return;
  }
  this.warn({ message: msg });
}

function log(this: PluginContext, msg: string, options: IOptions) {
  if (options?.silent) {
    return;
  }
  console.log(msg);
}

async function cleanTargets(
  this: PluginContext,
  target: TargetStringType,
  options: IOptions
) {
  if (options?.dryRun) {
    await dryRun.call(this, target, options);
    return;
  }

  if (typeof target === 'string' && target.length > 0) {
    await cleanStrTarget.call(this, target, options);
    return;
  }

  if (isArray(target)) {
    await cleanArrTargets.call(this, target as string[], options);
    return;
  }

  warn.call(this, 'Nothing to clean!', options);
}

function isValidTargetObj(obj: ITarget): boolean {
  if (Object.keys(obj).length === 0) return false;
  return Object.keys(obj).some((key) => ['start', 'end'].includes(key));
}

export default function clean(target: TargetType, options: IOptions): Plugin {
  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      if (isPlainObject(target)) {
        if (!isValidTargetObj(target as ITarget)) {
          warn.call(
            this,
            'Invalid object passed!, the object must contain "start" or "end" prop',
            options
          );
          return;
        }

        if (hasProp(target, 'start')) {
          await cleanTargets.call(
            this,
            (target as ITarget).start as TargetStringType,
            options
          );
        }
      } else {
        await cleanTargets.call(this, target as TargetStringType, options);
      }
    },
    async buildEnd() {
      if (isPlainObject(target)) {
        if (!isValidTargetObj(target as ITarget)) {
          warn.call(
            this,
            'Invalid object passed!, the object must contain "start" or "end" prop',
            options
          );
          return;
        }

        if (hasProp(target, 'end')) {
          await cleanTargets.call(
            this,
            (target as ITarget).end as TargetStringType,
            options
          );
        }
      }
    },
  };
}
