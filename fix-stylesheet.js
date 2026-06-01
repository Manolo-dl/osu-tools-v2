const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist/osu-tools/browser/index.html');

let html = fs.readFileSync(indexPath, 'utf-8');

// Fix the lazy-loaded stylesheet: change media="print" with onload to just load normally
html = html.replace(
  /<link rel="stylesheet" href="([^"]+)" media="print" onload="this\.media='all'"><noscript><link rel="stylesheet" href="\1"><\/noscript>/g,
  '<link rel="stylesheet" href="$1">'
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('✓ Fixed stylesheet loading in index.html');
