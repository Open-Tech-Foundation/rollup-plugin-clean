import Os from 'os';
import Path from 'path';
import { rollup } from 'rollup';
import { globSync } from '@open-tech-world/node-glob';
import { jest } from '@jest/globals';

import { clean } from '../dist/index.esm.js';

import setup from './setup';

const tempDir = Path.join(Os.tmpdir(), 'my-app');
let consoleLogSpy;

beforeEach(() => {
  setup();
  const cwdSpy = jest.spyOn(process, 'cwd');
  cwdSpy.mockImplementation(() => tempDir);
  consoleLogSpy = jest.spyOn(console, 'log');
  consoleLogSpy.mockImplementation(() => undefined);
});

describe('Clean Plugin', () => {
  it('runs in a dry mode', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('*', { dry: true })],
    });
    expect(globSync('*', { cwd: tempDir })).toHaveLength(7);
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('cleans build dir', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('build/*')],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('multiple patterns', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean(['build/*', 'dist'])],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
  });

  it('cleans build dir with glob star', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('build/**')],
    });
    expect(globSync('build/**', { cwd: tempDir })).toHaveLength(0);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('cleans build dir with glob star & negation', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean(['build/**', '!**/assets/logo.svg'])],
    });
    expect(globSync(['build/**'], { cwd: tempDir })).toHaveLength(3);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('custom hook', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('build/*', { hook: 'buildEnd' })],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
  });

  it('does not removes dot files', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean(['*', '!src'], { dot: false })],
    });
    expect(globSync('*', { cwd: tempDir, dot: true })).toHaveLength(3);
  });
});
