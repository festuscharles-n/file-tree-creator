// lib/createStructure.js
const fs = require('fs');
const path = require('path');

function parseTreeDiagram(treeText) {
  const lines = treeText.trim().split('\n')
    .filter(line => !line.startsWith('#') && line.trim());
  
  const result = [];
  const pathStack = [];
  const levelStack = [-1]; // Start with -1 so first item at level 0 works properly
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Calculate indentation level by finding the first non-whitespace, non-tree character
    const indent = line.search(/[^\s│├└─]/);
    if (indent === -1) continue; // Skip lines that don't have valid content
    
    const level = Math.floor(indent / 2); // Assuming 2 spaces per level
    
    // Manage the path stack based on indentation level
    while (levelStack[levelStack.length - 1] >= level) {
      levelStack.pop();
      pathStack.pop();
    }
    
    // For complex lines like "docs ── README.md", we need special handling
    if (line.includes('──') && line.indexOf('──') !== line.lastIndexOf('──')) {
      // This is a line with multiple items separated by ──
      // First, determine the initial path segment before any ──
      const segments = parseComplexLine(line.substring(indent));
      
      // Add each segment appropriately
      if (segments.length > 0) {
        // First segment is at current level and is always a directory
        const dirName = segments[0];
        levelStack.push(level);
        pathStack.push(dirName);
        
        result.push({
          path: pathStack.join('/'),
          isFile: false // First segment in multi-item line is always a directory
        });
        
        // If there are additional segments, they're at the next level
        // And the last one is likely a file
        if (segments.length > 1) {
          const fileName = segments[segments.length - 1];
          levelStack.push(level + 1);
          pathStack.push(fileName);
          
          result.push({
            path: pathStack.join('/'),
            isFile: isFileByName(fileName) // Last segment might be a file
          });
          
          // Remove the file entry from the stack
          levelStack.pop();
          pathStack.pop();
        }
      }
    } else {
      // Standard line with a single item
      const entryName = extractEntryName(line.substring(indent));
      if (!entryName) continue;
      
      levelStack.push(level);
      pathStack.push(entryName);
      
      // For standard lines, use file name heuristics
      const fullPath = pathStack.join('/');
      result.push({
        path: fullPath,
        isFile: isFileByName(entryName)
      });
    }
  }
  
  return result;
}

function parseComplexLine(lineContent) {
  // Handle complex lines like "docs ── README.md"
  // First clean up the tree characters
  const cleanedLine = lineContent
    .replace(/├──/g, '')
    .replace(/└──/g, '')
    .replace(/│/g, '')
    .trim();
  
  // Split by ── or similar separators
  return cleanedLine
    .split(/\s*──\s*|\s*--\s*/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);
}

function extractEntryName(lineContent) {
  // Extract the name from a line with tree characters
  const match = lineContent.match(/(?:├──|└──|│|\s*)\s*(.*)/);
  return match && match[1] ? match[1].trim() : null;
}

function parseFlatPath(flatText) {
  return flatText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => ({
      path: line.replace(/^\/+/, ''),
      isFile: isFileByName(line)
    }));
}

function isFileByName(name) {
  // Remove any path components to get just the basename
  const basename = name.split('/').pop();
  
  // If it ends with a slash, it's definitely a directory
  if (name.endsWith('/')) {
    return false;
  }
  
  // Common file extensions
  if (path.extname(basename)) {
    return true;
  }
  
  // Special files like README, LICENSE, etc.
  const commonFiles = ['README', 'LICENSE', 'CHANGELOG', '.gitignore', '.env', '.npmrc'];
  if (commonFiles.some(common => basename === common || basename.startsWith(common + '.'))) {
    return true;
  }
  
  // For entries with dots in the name but no standard extension
  // We need to be more careful - "dir.with.dots" is a directory
  // Unless we have a known file pattern, assume it's a directory if no standard extension
  if (basename.includes('.')) {
    // Check if it's a hidden file (but not a hidden directory)
    if (basename.startsWith('.') && !basename.includes('/')) {
      // Common hidden files
      const commonHiddenFiles = ['.gitignore', '.env', '.editorconfig', '.npmrc'];
      if (commonHiddenFiles.includes(basename)) {
        return true;
      }
      // If it has both dot and extension, likely a hidden file
      if (basename.substring(1).includes('.')) {
        return true;
      }
      // Otherwise, might be a hidden directory
      return false;
    }
  }
  
  // No clear indicators, assume it's a directory
  return false;
}

function isInsecurePath(p) {
  const normalized = p.replace(/^\/+/, '');
  
  if (path.isAbsolute(normalized)) return true;
  
  if (normalized.startsWith('root/') || 
      normalized.startsWith('etc/') || 
      normalized.startsWith('~/')) {
    return true;
  }
  
  const fullyNormalized = path.normalize(normalized);
  if (fullyNormalized.includes('..'+path.sep)) return true;
  
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1'];
  const upperName = path.basename(normalized).toUpperCase();
  if (reservedNames.includes(upperName)) return true;
  
  return false;
}

function createFileStructure(paths, baseDir = process.cwd(), options = {}) {
  const { strict = false, verbose = false } = options;
  let createdCount = 0;
  let errorCount = 0;

  // Validate paths
  for (const {path: p} of paths) {
    if (isInsecurePath(p)) {
      console.error(`❌ Insecure path detected: ${p}`);
      errorCount++;
      if (strict) return { createdCount, errorCount };
    }
  }
  
  // Create directories first
  paths.filter(p => !p.isFile).forEach(({path: p}) => {
    if (isInsecurePath(p)) return;
    
    const fullPath = path.join(baseDir, p);
    
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        if (verbose) console.log(`⏩ Directory exists: ${p}`);
        return;
      }
      errorCount++;
      console.error(`❌ Path exists but is not a directory: ${p}`);
      return;
    }

    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${p}`);
      createdCount++;
    } catch (err) {
      console.error(`❌ Failed to create directory: ${p}\n   Error: ${err.message}`);
      errorCount++;
    }
  });

  // Then create files
  paths.filter(p => p.isFile).forEach(({path: p}) => {
    if (isInsecurePath(p)) return;
    
    const fullPath = path.join(baseDir, p);
    const dirPath = path.dirname(fullPath);

    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isFile()) {
        console.log(`⏩ File exists: ${p}`);
        return;
      }
      errorCount++;
      console.error(`❌ Path exists but is not a file: ${p}`);
      return;
    }

    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, '', 'utf8');
      console.log(`📄 Created file: ${p}`);
      createdCount++;
    } catch (err) {
      console.error(`❌ Failed to create file: ${p}\n   Error: ${err.message}`);
      errorCount++;
    }
  });

  if (errorCount > 0 && strict) {
    throw new Error(`Failed with ${errorCount} errors (strict mode)`);
  }

  return { createdCount, errorCount };
}

module.exports = { parseTreeDiagram, parseFlatPath, createFileStructure };