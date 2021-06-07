import { rollup } from 'rollup';
import { ensureFile, ensureDir } from 'fs-extra';
import clean from '../src';

async function build(options) {
  await rollup({
    input: '__tests__/input.js',
    plugins: [clean(options)],
  });
}

let warnSpy;
let errorSpy;

beforeEach(() => {
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
    await ensureFile(path);
    await build(path);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a file when glob passed', async () => {
    const path = '__tests__/dist/bundle.js';
    await ensureFile(path);
    await build('__tests__/dist/*.js');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes multiple files', async () => {
    const file1 = '__tests__/dist/bundle.js';
    const file2 = '__tests__/dist/vendors.js';
    await ensureFile(file1);
    await ensureFile(file2);
    await build([file1, file2]);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns not found paths when mixed of valid and invalid paths passed', async () => {
    const file1 = '__tests__/dist/bundle.js';
    const file2 = '__tests__/dist/vendors.js';
    await ensureFile(file1);
    await ensureFile(file2);
    await build(['file0', file1, 'file3', file2]);
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder', async () => {
    await ensureDir('dist');
    await build('dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder with a sub folder', async () => {
    const dir = '__tests__/dist';
    await ensureDir(dir);
    await ensureFile(dir + '/file1.js');
    await ensureDir(dir + '/public');
    await build('__tests__/dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a folder with sub folders (multi level)', async () => {
    const dir = '__tests__/dist';
    await ensureDir(dir);
    await ensureFile(dir + '/bundle.js');
    await ensureDir(dir + '/public');
    await ensureFile(dir + '/public/images/logo.png');
    await build('__tests__/dist');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a subfolder but not parent', async () => {
    const dir = '__tests__/dist';
    await ensureDir(dir);
    await ensureFile(dir + '/bundle.js');
    await ensureDir(dir + '/public');
    await ensureFile(dir + '/public/images/logo.png');
    await build('__tests__/dist/public/*');
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes images subfolder files but not logo.png file', async () => {
    const dir = '__tests__/dist';
    await ensureDir(dir);
    await ensureFile(dir + '/bundle.js');
    await ensureDir(dir + '/public');
    await ensureFile(dir + '/public/images/logo.png');
    await ensureFile(dir + '/public/images/img1.png');
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

  it('removes a folder for start hook target object', async () => {
    const dir = '__tests__/dist';
    await ensureDir(dir);
    await build({ start: dir });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes folders from start hook target array', async () => {
    const dir1 = '__tests__/dist';
    const dir2 = '__tests__/dist2';
    await ensureDir(dir1);
    await ensureDir(dir2);
    await build({ start: [dir1, dir2] });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
