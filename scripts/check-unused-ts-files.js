#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const IGNORED = ['index.ts', 'index.tsx'];

function getAllTSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTSFiles(filePath));
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !IGNORED.includes(file)) {
      results.push(filePath);
    }
  });
  return results;
}

function isFileUsed(filePath, allFiles) {
  const relPath = path.relative(SRC_DIR, filePath).replace(/\\/g, '/');
  // Check if this file is imported anywhere else
  for (const otherFile of allFiles) {
    if (otherFile === filePath) continue;
    const content = fs.readFileSync(otherFile, 'utf8');
    // Check for import or require
    if (
      content.includes(`./${relPath}`) ||
      content.includes(`../${relPath}`) ||
      content.includes(relPath)
    ) {
      return true;
    }
  }
  return false;
}

const allFiles = getAllTSFiles(SRC_DIR);
const unusedFiles = allFiles.filter(f => !isFileUsed(f, allFiles));

if (unusedFiles.length > 0) {
  console.log('Unused .ts/.tsx files detected:');
  unusedFiles.forEach(f => console.log('  ' + path.relative(process.cwd(), f)));
  process.exit(1);
} else {
  process.exit(0);
} 