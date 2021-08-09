import { rmSync } from '@open-tech-world/node-rm';
import { Plugin } from 'rollup';

import { IOptions } from './IOptions';

export default function clean(
  patterns: string | string[],
  options?: Partial<IOptions>
): Plugin {
  const defaultOptions: IOptions = {
    dot: true,
    dry: false,
    hook: 'buildStart',
  };
  const currentOptions = Object.assign({}, defaultOptions, options);

  return {
    name: '@open-tech-world/rollup-plugin-clean',
    [currentOptions.hook]: async () => {
      rmSync(patterns, {
        cwd: process.cwd(),
        dot: currentOptions.dot,
        dry: currentOptions.dry,
      });
    },
  };
}
