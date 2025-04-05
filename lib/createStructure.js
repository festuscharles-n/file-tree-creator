const fs = require('fs');
const path = require('path');

function parseTreeDiagram(treeText) {
  const lines = treeText.trim().split('\n')
  .filter(line => !line.startsWith('#') && line.trim()); //For comment lines
  const stack = [];
  const paths = [];

  lines.forEach(line => {
    if (!line.trim()) return;

    const depthMatch = line.match(/^[\t ]*(│?[\t ]*)*[├└]?──/); 
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
    .filter(line => line && !line.startsWith('#')) // For comment lines
    .filter(Boolean);
}

function createFileStructure(paths, baseDir = process.cwd()) {
  for (const p of paths) {
    const fullPath = path.join(baseDir, p);
    const isFile = path.extname(fullPath) !== '' && !fullPath.endsWith('/') && !/\/\.?[^\/.]+$/.test(fullPath);

    if (fs.existsSync(fullPath)) {
        console.log(`⏩ Skipping existing path: ${p}`);
        continue;
    }
    if (p.includes('//')) {
        console.error(`❌ Invalid path (double slashes): ${p}`);
        continue;
    }
    if (/[<>:"|?*]/.test(p)) {
        console.error(`❌ Invalid characters in path: ${p}`);
        continue;
    }
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
