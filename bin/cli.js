#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  parseTreeDiagram,
  parseFlatPath,
  createFileStructure,
} = require('../lib/createStructure');
const pkg = require('../package.json');

function showHelp() {
  console.log(`
  ╭──────────────────────────────────────────────╮
  │  🗂  File Tree Creator (ftc) v${pkg.version.padEnd(10)} │
  ╰──────────────────────────────────────────────╯

  🌳  Create directory structures from:
  • Tree diagrams │ default
  • Flat path lists

  🛠️  Usage:
     ftc <input-file> [--mode=tree|flat] [--strict]

  ⚙️  Options:
     --mode=tree|flat   Input format (default: tree)
     --strict           Fail on errors (default: lenient mode)
     --help │ -h        Show this help
     --version │ -v     Show version

  💡 Examples:
     ftc structure.txt
     ftc paths.txt --mode=flat
     ftc large-structure.txt --strict

  ──────────────────────────────────
  ⚡️ Crafted by _festuscharles
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