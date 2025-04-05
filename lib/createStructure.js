const fs = require('fs');
const path = require('path');

function parseTreeDiagram(treeText) {
  const lines = treeText.trim().split('\n');
  const stack = [];
  const paths = [];

  lines.forEach(line => {
    if (!line.trim()) return;

    const depthMatch = line.match(/^(\s*│?)*[├└]?──/);
    const depth = depthMatch ? (depthMatch[0].match(/│|├──|└──/g) || []).length : 0;

    const clean = line.replace(/^(\s*│?)*[├└]?──\s*/, '').trim();
    stack[depth] = clean;

    const fullPath = stack.slice(0, depth + 1).join('/');
    if (fullPath) paths.push(fullPath);
  });

  return paths;
}

function parseFlatPath(flatText) {
  return flatText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function createFileStructure(paths, baseDir = process.cwd()) {
  for (const p of paths) {
    const fullPath = path.join(baseDir, p);
    const isFile = path.extname(fullPath) !== '';

    try {
      if (isFile) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, '', 'utf8');
      } else {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    } catch (err) {
      console.error(`❌ Failed to create: ${p}\n   Error: ${err.message}`);
    }
  }
}

module.exports = { parseTreeDiagram, parseFlatPath, createFileStructure };
