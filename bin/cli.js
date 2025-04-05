#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  parseTreeDiagram,
  parseFlatPath,
  createFileStructure,
} = require('../lib/createStructure');

const args = process.argv.slice(2);
const [inputFile, mode = 'tree'] = args;

if (!inputFile) {
  console.error('❗ Usage: file-tree-creator <input-file> [--mode=tree|flat]');
  process.exit(1);
}

try {
  const filePath = path.resolve(process.cwd(), inputFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  let paths;

  if (mode.includes('flat')) {
    paths = parseFlatPath(content);
  } else {
    paths = parseTreeDiagram(content);
  }

  createFileStructure(paths);
  console.log('✅ File structure created successfully.');
} catch (err) {
  console.error(`❌ Error reading or parsing input: ${err.message}`);
  process.exit(1);
}
