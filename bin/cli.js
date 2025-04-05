#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  parseTreeDiagram,
  parseFlatPath,
  createFileStructure,
} = require('../lib/createStructure');

function showHelp() {
    console.log(`
  ❗️Usage:
    npx file-tree-creator <input-file> [--mode=tree|flat]
    ftc <input-file> [--mode=tree|flat]
  
  Examples:
    npx file-tree-creator structure.txt
    ftc paths.txt --mode=flat
  `);
    process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
}
if (args.includes('--version') || args.includes('-v')) {
  console.log(`File Tree Creator v`+ require('../package.json').version);
  process.exit(0);
}
if (args.length === 0) {
  console.error('❗ No input file provided.');
  showHelp();
}
let inputFile, mode = 'tree';

for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
      if (!['tree', 'flat'].includes(mode)) {
        console.error('❌ Invalid mode. Use "tree" or "flat"');
        process.exit(1);
      }
    } else if (!arg.startsWith('--')) {
      inputFile = arg;
    }
  }
  
  if (!inputFile) {
    console.error('❌ Missing input file');
    showHelp();
  }

try {
  const filePath = path.resolve(process.cwd(), inputFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  let paths;

  if (mode === 'flat') {
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
