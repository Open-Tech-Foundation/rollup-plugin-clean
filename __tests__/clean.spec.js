import { rollup } from 'rollup';
// import { fs.ensureFile, fs.ensureDir, pathExists } from 'fs-extra';
import { default as fs } from 'fs-extra';
import { jest } from '@jest/globals';

import clean from '../dist/plugin.esm.js';

async function build(target, options) {
  await rollup({
    input: '__tests__/input.js',
    plugins: [clean(target, options)],
  });
}

let logSpy;
let warnSpy;
let errorSpy;

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log');
  warnSpy = jest.spyOn(console, 'warn');
  errorSpy = jest.spyOn(console, 'error');
});

describe('Clean', () => {
  it('warns when no valid options passed', async () => {
    await build();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    await build(undefined);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    await build(null);
    expect(warnSpy).toHaveBeenCalledTimes(3);
    await build(1);
    expect(warnSpy).toHaveBeenCalledTimes(4);
    await build(new RegExp());
    expect(warnSpy).toHaveBeenCalledTimes(5);
    await build(/dist/);
    expect(warnSpy).toHaveBeenCalledTimes(6);
    await build('');
    expect(warnSpy).toHaveBeenCalledTimes(7);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns when invalid file path passed', async () => {
    await build('out.js');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a file', async () => {
    const path = './__tests__/dist/bundle.js';
    await fs.ensureFile(path);
    await build(path);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a file when glob passed', async () => {
    const path = '__tests__/dist/bundle.js';
    await fs.ensureFile(path);
    await build('__tests__/dist/*.js');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes multiple files', async () => {
    const file1 = '__tests__/dist/bundle.js';
    const file2 = '__tests__/dist/vendors.js';
    await fs.ensureFile(file1);
    await fs.ensureFile(file2);
    await build([file1, file2]);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns not found paths when mixed of valid and invalid paths passed', async () => {
    const file1 = '__tests__/dist/bundle.js';
    const file2 = '__tests__/dist/vendors.js';
    await fs.ensureFile(file1);
    await fs.ensureFile(file2);
    await build(['file0', file1, 'file3', file2]);
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder', async () => {
    await fs.ensureDir('dist');
    await build('dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder with a sub folder', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureFile(dir + '/file1.js');
    await fs.ensureDir(dir + '/public');
    await build('__tests__/dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder with sub folders (multi level)', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureFile(dir + '/bundle.js');
    await fs.ensureDir(dir + '/public');
    await fs.ensureFile(dir + '/public/images/logo.png');
    await build('__tests__/dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a subfolder but not parent', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureFile(dir + '/bundle.js');
    await fs.ensureDir(dir + '/public');
    await fs.ensureFile(dir + '/public/images/logo.png');
    await build('__tests__/dist/public/*');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns for invalid path and removes a folder', async () => {
    await fs.ensureDir('dist');
    await build(['dist', 'dist2']);
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes images subfolder files but not logo.png file', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureFile(dir + '/bundle.js');
    await fs.ensureDir(dir + '/public');
    await fs.ensureFile(dir + '/public/images/logo.png');
    await fs.ensureFile(dir + '/public/images/img1.png');
    await build([
      '__tests__/dist/public/images/*',
      '!__tests__/dist/public/images/logo.png',
    ]);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns for empty target object', async () => {
    await build({});
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns for invalid hook target object', async () => {
    await build({ middle: 'dist' });
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder for start hook target string', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await build({ start: dir });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes folders from start hook target array', async () => {
    const dir1 = '__tests__/dist';
    const dir2 = '__tests__/dist2';
    await fs.ensureDir(dir1);
    await fs.ensureDir(dir2);
    await build({ start: [dir1, dir2] });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder for end hook target string', async () => {
    const dir = '__tests__/ts_built';
    await fs.ensureDir(dir);
    await build({ end: dir });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns for dry runs a invalid folder path', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await build('dist', { dryRun: true });
    expect(warnSpy).toBeCalledTimes(2);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('runs in dry mode for a folder path', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureDir(dir + '/public');
    await fs.ensureFile(dir + '/public/index.html');
    await build(dir + '/**', { dryRun: true });
    expect(warnSpy).toBeCalledTimes(1);
    expect(logSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('runs in a silent mode', async () => {
    const dir = '__tests__/dist';
    await fs.ensureDir(dir);
    await fs.ensureDir(dir + '/public');
    await fs.ensureFile(dir + '/public/index.html');
    await build(dir + '/**', { silent: true });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('remove dot files', async () => {
    const dir = '__tests__/dist';
    const dotFile = dir + '/.gitignore';
    await fs.ensureDir(dir);
    await fs.ensureFile(dotFile);
    await build(dir + '/*');
    const exists = await fs.pathExists(dotFile);
    expect(exists).toBeFalsy();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('does not remove dot files', async () => {
    const dir = '__tests__/dist';
    const dotFile = dir + '/.gitignore';
    await fs.ensureDir(dir);
    await fs.ensureFile(dotFile);
    await build(dir + '/*', { dot: false });
    const exists = await fs.pathExists(dotFile);
    expect(exists).toBeTruthy();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
