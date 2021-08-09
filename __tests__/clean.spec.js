import Os from 'os';
import Path from 'path';
import { rollup } from 'rollup';
import { globSync } from '@open-tech-world/node-glob';
import { jest } from '@jest/globals';

import { clean } from '../dist';

import setup from './setup';

const tempDir = Path.join(Os.tmpdir(), 'my-app');
let consoleLogSpy;

beforeEach(() => {
  setup();
  const cwdSpy = jest.spyOn(process, 'cwd');
  cwdSpy.mockImplementation(() => tempDir);
  consoleLogSpy = jest.spyOn(console, 'log');
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
      plugins: [clean('build/*', { dry: false })],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('multiple patterns', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean(['build/*', 'dist'], { dry: false })],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
  });

  test('custom hook', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('build/*', { hook: 'buildEnd', dry: false })],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
  });

  it('does not removes dot files', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean(['*', '!src'], { dry: false, dot: false })],
    });
    expect(globSync('*', { cwd: tempDir, dot: true })).toHaveLength(3);
  });
});
