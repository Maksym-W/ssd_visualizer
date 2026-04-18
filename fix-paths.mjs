// For use with npm build out, to ensure file paths are properly referenced

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outDir = './out';

function processDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = readFileSync(fullPath, 'utf8');
      content = content.replaceAll('/_next/', '_next/');
      content = content.replaceAll('href="./"', 'href="./index.html"');
      content = content.replaceAll('href="./faq"', 'href="./faq.html"');
      writeFileSync(fullPath, content);
      console.log(`Patched: ${fullPath}`);
    }
  }
}

processDir(outDir);
