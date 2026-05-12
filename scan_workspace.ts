import fs from 'fs';
import path from 'path';

function walk(dir: string) {
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      console.log(fullPath);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
             walk(fullPath);
        }
      } catch (e) {}
    });
  } catch (e) {}
}

console.log("Deep scan of /workspace:");
walk('/workspace');
