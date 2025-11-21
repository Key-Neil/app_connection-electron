import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Building TypeScript...');

const tscResult = spawnSync('npx', ['tsc'], { 
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

console.log('\n📦 Copying assets...');
const sourceDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'dist');

interface FileExtension {
  [key: string]: boolean;
}

const staticExtensions: FileExtension = {
  '.html': true,
  '.css': true
};

function copyAssetsRecursive(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  
  files.forEach((file: string) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyAssetsRecursive(srcPath, destPath);
    } else if (staticExtensions[path.extname(file)]) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ ${path.relative(__dirname, destPath)}`);
    }
  });
}

copyAssetsRecursive(sourceDir, destDir);
console.log('\n✅ Build complete!');
