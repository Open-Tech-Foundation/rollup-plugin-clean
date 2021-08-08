import Os from 'os';
import Path from 'path';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';

function setup() {
  const tempDir = Path.join(Os.tmpdir(), 'my-app');
  const paths = [
    '.gitignore',
    '.git/branches/b1',
    '.git/branches/b2',
    'notes.txt',
    'config.json',
    'yarn.lock',
    'src/index.js',
    'node_modules/mod1/lib/index.js',
    'node_modules/mod2/lib/index.js',
    'node_modules/mod3/lib/index.js',
    'node_modules/mod4/lib/index.js',
    'node_modules/mod5/lib/index.js',
    'node_modules/mod6/lib/index.js',
    'node_modules/mod7/lib/index.js',
    'node_modules/mod8/lib/index.js',
    'node_modules/mod9/lib/index.js',
    'node_modules/mod10/lib/index.js',
    'build/public/assets/logo.svg',
    'build/public/assets/banner.png',
    'build/public/assets/banner(old).png',
    'build/public/assets/welcome.gif',
    'build/public/assets/img[01].jpg',
    'build/public/assets/img[02].jpg',
    'build/public/assets/img[03].jpg',
    'build/public/assets/pdfs/1.pdf',
    'build/public/assets/pdfs/2.pdf',
    'build/public/assets/pdfs/3.pdf',
    'build/public/robots.txt',
    'build/app.js',
    'build/vendors.js',
  ];

  if (existsSync(tempDir)) {
    rmdirSync(tempDir, { recursive: true });
  }

  mkdirSync(tempDir);

  paths.forEach((path) => {
    mkdirSync(Path.join(tempDir, Path.dirname(path)), { recursive: true });
    writeFileSync(Path.join(tempDir, path), path);
  });
}

export default setup;
