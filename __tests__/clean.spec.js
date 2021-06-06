import { rollup } from 'rollup';
import { ensureFile } from 'fs-extra';
import clean from '../src';

async function build(options) {
  await rollup({
    input: '__tests__/input.js',
    plugins: [clean(options)],
  });
}

let warnSpy = jest.spyOn(console, 'warn');
let errorSpy = jest.spyOn(console, 'error');

describe('Clean', () => {
  it('warns when no valid options passed', async () => {
    await build();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Nothing to clean!');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('warns when invalid file path passed', async () => {
    await build('out.js');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Target path not found!');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('removes a file', async () => {
    const path = '__tests__/dist/bundle.js';
    await ensureFile(path);
    await build(path);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it.only('removes multiple files', async () => {
    const file1 = '__tests__/dist/bundle.js';
    const file2 = '__tests__/dist/vendors.js';
    await ensureFile(file1);
    await ensureFile(file2);
    await build(['file3', file1, 'asdf', file2]);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
