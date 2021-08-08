import Os from 'os';
import Path from 'path';
import { rollup } from 'rollup';
import { globSync } from '@open-tech-world/node-glob';
import { jest } from '@jest/globals';

import { clean } from '../dist';

import setup from './setup';

const tempDir = Path.join(Os.tmpdir(), 'my-app');

beforeEach(() => {
  setup();
  const cwdSpy = jest.spyOn(process, 'cwd');
  cwdSpy.mockImplementation(() => tempDir);
});

describe('Clean Plugin', () => {
  it('runs in a dry mode', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('*', { dry: true })],
    });
    expect(globSync('*', { cwd: tempDir })).toHaveLength(6);
  });

  it('cleans build dir', async () => {
    await rollup({
      input: Path.join(tempDir, 'src', 'index.js'),
      plugins: [clean('build/*', { dry: false })],
    });
    expect(globSync('build/*', { cwd: tempDir })).toHaveLength(0);
  });
});
