import { Plugin, PluginContext } from 'rollup';
import del from 'del';
import Path from 'path';
import { hasMagic } from 'globby';
import { statSync } from 'fs';
import merge from 'lodash.merge';

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

async function deleteTarget(
  target: TargetStringType,
  options: IOptions
): Promise<void> {
  await del(target, { dot: options.dot });
}

async function cleanStrTarget(
  this: PluginContext,
  target: string,
  options: IOptions
) {
  if (!isValidPath(target)) {
    warn.call(this, `Target path "${target}" is not found`, options);
  }
  await deleteTarget(target, options);
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
  await deleteTarget(target, options);
}

async function dryRun(
  this: PluginContext,
  target: TargetStringType,
  options: IOptions
): Promise<void> {
  warn.call(this, `Running in dry mode`, options);
  const dryPaths = await del(target, {
    dryRun: options.dryRun,
    dot: options.dot,
  });
  if (dryPaths.length === 0) {
    warn.call(this, 'No paths matched!', options);
    return;
  }
  log.call(this, '\nThe following relative paths can be cleaned:', options);
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

function isValidTargetObj(
  this: PluginContext,
  obj: ITarget,
  options: IOptions
): boolean {
  if (!isPlainObject(obj)) return false;
  const isEmpty = Object.keys(obj).length === 0;
  const hasValidProp = Object.keys(obj).some((key) =>
    ['start', 'end'].includes(key)
  );
  if (isEmpty || !hasValidProp) {
    warn.call(
      this,
      'Invalid object passed!, the object must contain "start" or "end" prop',
      options
    );

    return false;
  }
  return true;
}

export default function clean(target: TargetType, options: IOptions): Plugin {
  const defaultOptions: IOptions = {
    dot: true,
    dryRun: false,
    silent: false,
  };
  merge(defaultOptions, options);
  const doneHooks: string[] = [];

  return {
    name: '@open-tech-world/rollup-plugin-clean',
    async buildStart() {
      if (doneHooks.includes('start')) {
        return;
      }
      if (isValidTargetObj.call(this, target as ITarget, defaultOptions)) {
        if (hasProp(target, 'start')) {
          await cleanTargets.call(
            this,
            (target as ITarget).start as TargetStringType,
            defaultOptions
          );
        }
        doneHooks.push('start');
        return;
      }
      await cleanTargets.call(this, target as TargetStringType, defaultOptions);
      doneHooks.push('start');
    },
    async buildEnd() {
      if (doneHooks.includes('end')) {
        return;
      }
      if (isValidTargetObj.call(this, target as ITarget, defaultOptions)) {
        if (hasProp(target, 'end')) {
          await cleanTargets.call(
            this,
            (target as ITarget).end as TargetStringType,
            defaultOptions
          );
          doneHooks.push('end');
          return;
        }
      }
    },
  };
}
