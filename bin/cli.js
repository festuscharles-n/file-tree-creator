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
  ❕Usage:
    npx file-tree-creator <input-file> [--mode=tree|flat] [--strict]
    ftc <input-file> [--mode=tree|flat] [--strict]

  Options:
    --mode=tree|flat   Specify input format (default: tree)
    --strict          Fail on any error (default: lenient mode)
    --help, -h       Show this help
    --version, -v    Show version

  Examples:
    ftc structure.txt
    ftc paths.txt --mode=flat --strict
`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) showHelp();
if (args.includes('--version') || args.includes('-v')) {
  console.log(`File Tree Creator v${require('../package.json').version}`);
  process.exit(0);
}

let inputFile, mode = 'tree', strict = false;

for (const arg of args) {
  if (arg === '--strict') {
    strict = true;
  } else if (arg.startsWith('--mode=')) {
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
  const paths = mode === 'flat' ? parseFlatPath(content) : parseTreeDiagram(content);
  
  const { createdCount, errorCount } = createFileStructure(paths, process.cwd(), { strict });

  if (errorCount > 0) {
    console.log(`\nℹ️  Summary: Created ${createdCount} paths, ${errorCount} errors`);
    if (strict) {
      console.error('❌ Failed due to errors (strict mode)');
      process.exit(1);
    } else {
      console.log('⚠️  Completed with warnings (lenient mode)');
    }
  } else {
    console.log(`\n✅ Successfully created ${createdCount} paths`);
  }
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}