import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (dir === '/' && (file === 'dev' || file === 'proc' || file === 'sys' || file === 'run')) return;
        walk(fullPath);
      } else {
        if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')) {
             console.log(fullPath);
        }
      }
    });
  } catch (e) {}
}

const roots = ['/', '/app', '/home', '/tmp', '/workspace'];
roots.forEach(r => {
    console.log(`--- Checking ${r} ---`);
    walk(r);
});
