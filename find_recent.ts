import fs from 'fs';
import path from 'path';

function walk(dir: string, depth: number = 0) {
  if (depth > 5) return;
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        const now = Date.now();
        const tenMins = 10 * 60 * 1000;
        if (now - stat.mtimeMs < tenMins) {
           console.log(`${fullPath} (Modified: ${stat.mtime})`);
        }
        if (stat.isDirectory()) {
             if (file === 'node_modules' || file === '.git') return;
             walk(fullPath, depth + 1);
        }
      } catch (e) {}
    });
  } catch (e) {}
}

console.log("Searching for recently modified files...");
walk('.');
