const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy public directory to .next/standalone/public
const publicSrc = path.resolve(__dirname, 'public');
const publicDest = path.resolve(__dirname, '.next/standalone/public');
console.log(`Copying public assets from ${publicSrc} to ${publicDest}...`);
copyDir(publicSrc, publicDest);

// Copy .next/static directory to .next/standalone/.next/static
const staticSrc = path.resolve(__dirname, '.next/static');
const staticDest = path.resolve(__dirname, '.next/standalone/.next/static');
console.log(`Copying static assets from ${staticSrc} to ${staticDest}...`);
copyDir(staticSrc, staticDest);

console.log('✅ Standalone static and public assets copied successfully!');
