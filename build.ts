import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildConfigs = [
  { name: 'main/preload', config: 'tsconfig.main.json' },
  { name: 'renderer ESM', config: 'tsconfig.renderer.json' }
];

buildConfigs.forEach(({ name, config }) => {
  console.log(`🔨 Building TypeScript (${name})...`);
  spawnSync('npx', ['tsc', '-p', config], { 
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  console.log('');
});

console.log('📦 Copying assets...');
const sourceDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'dist');

const staticExtensions = new Set(['.html', '.css']);

function copyAssetsRecursive(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyAssetsRecursive(srcPath, destPath);
    } else if (staticExtensions.has(path.extname(file))) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ ${path.relative(__dirname, destPath)}`);
    }
  });
}

copyAssetsRecursive(sourceDir, destDir);
console.log('\n✅ Build complete!');
