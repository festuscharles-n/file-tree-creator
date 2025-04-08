const fs = require('fs');
const path = require('path');

function parseTreeDiagram(treeText) {
  const lines = treeText.trim().split('\n')
    .filter(line => !line.startsWith('#') && line.trim());
  
  const result = [];
  const pathStack = [];
  const levelStack = [-1]; // Start with -1 so first item at level 0 works properly
  
  // First pass: collect all entries and their indentation levels
  const entries = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Calculate indentation level by finding the first non-whitespace, non-tree character
    const indent = line.search(/[^\s│├└─]/);
    if (indent === -1) continue; // Skip lines that don't have valid content
    
    const level = Math.floor(indent / 2); // Assuming 2 spaces per level
    
    // For complex lines like "docs ── README.md", we need special handling
    if (line.includes('──') && line.indexOf('──') !== line.lastIndexOf('──')) {
      // This is a line with multiple items separated by ──
      const segments = parseComplexLine(line.substring(indent));
      
      if (segments.length > 0) {
        // First segment is at current level and is always a directory
        entries.push({
          name: segments[0].name,
          comment: segments[0].comment,
          level: level,
          isFile: false, // First segment in multi-item line is always a directory
          hasChildren: segments.length > 1
        });
        
        // If there are additional segments, they're children
        if (segments.length > 1) {
          const lastSegment = segments[segments.length - 1];
          entries.push({
            name: lastSegment.name,
            comment: lastSegment.comment,
            level: level + 1,
            isFile: isFileByName(lastSegment.name),
            hasChildren: false
          });
        }
      }
    } else {
      // Standard line with a single item
      const extracted = extractEntryName(line.substring(indent));
      if (!extracted) continue;
      
      // Check next line to see if this has children
      const hasChildren = (i + 1 < lines.length) && 
                          (lines[i + 1].search(/[^\s│├└─]/) > indent);
      
      entries.push({
        name: extracted.name,
        comment: extracted.comment,
        level: level,
        isFile: !hasChildren && isFileByName(extracted.name),
        hasChildren: hasChildren
      });
    }
  }
  
  // Second pass: use the entries to build paths
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Manage the path stack based on level
    while (levelStack[levelStack.length - 1] >= entry.level) {
      levelStack.pop();
      pathStack.pop();
    }
    
    levelStack.push(entry.level);
    pathStack.push(entry.name);
    
    const fullPath = pathStack.join('/');
    
    // If this entry has children, it's definitely a directory
    // Otherwise, use our best guess based on the name
    result.push({
      path: fullPath,
      isFile: entry.isFile,
      comment: entry.comment
    });
  }
  
  return result;
}

function parseComplexLine(lineContent) {
  // Handle complex lines like "docs ── README.md # Some comment"
  // First clean up the tree characters
  const cleanedLine = lineContent
    .replace(/├──/g, '')
    .replace(/└──/g, '')
    .replace(/│/g, '')
    .trim();
  
  // Check if there's a comment
  const commentMatch = cleanedLine.match(/(.*?)(?:\s+#\s*(.*)|$)/);
  const content = commentMatch[1];
  const comment = commentMatch[2] || null;
  
  // Split by ── or similar separators
  const segments = content
    .split(/\s*──\s*|\s*--\s*/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);
  
  // Add comment to the last segment if it exists
  if (segments.length > 0 && comment) {
    return segments.map((segment, index) => {
      if (index === segments.length - 1) {
        return { name: segment, comment };
      }
      return { name: segment, comment: null };
    });
  }
  
  return segments.map(segment => ({ name: segment, comment: null }));
}

function extractEntryName(lineContent) {
  // Extract the name and any comment from a line with tree characters
  const match = lineContent.match(/(?:├──|└──|│|\s*)\s*(.*?)(?:\s+#\s*(.*)|$)/);
  if (!match || !match[1]) return null;
  
  return {
    name: match[1].trim(),
    comment: match[2] ? match[2].trim() : null
  };
}

function parseFlatPath(flatText) {
  return flatText
    .split('\n')
    .map(line => {
      const match = line.trim().match(/(.*?)(?:\s+#\s*(.*)|$)/);
      if (!match || !match[1]) return null;
      
      return {
        path: match[1].replace(/^\/+/, ''),
        isFile: isFileByName(match[1]),
        comment: match[2] ? match[2].trim() : null
      };
    })
    .filter(item => item && !item.path.startsWith('#'));
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
  
  // Hidden files with specific patterns
  if (basename.startsWith('.') && !basename.includes('/')) {
    const hiddenFileWithExt = basename.substring(1).includes('.');
    if (hiddenFileWithExt) {
      return true;
    }
    
    // Common hidden files
    const commonHiddenFiles = ['.gitignore', '.env', '.editorconfig', '.npmrc', '.hidden.file'];
    if (commonHiddenFiles.includes(basename)) {
      return true;
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
  const { strict = false, verbose = false, writeComments = false } = options;
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
  paths.filter(p => !p.isFile).forEach(({path: p, comment}) => {
    if (isInsecurePath(p)) return;
    
    const fullPath = path.join(baseDir, p);
    
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        if (verbose) console.log(`⏩ Directory exists: ${p}${comment ? ` # ${comment}` : ''}`);
        return;
      }
      errorCount++;
      console.error(`❌ Path exists but is not a directory: ${p}`);
      return;
    }

    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${p}${comment ? ` # ${comment}` : ''}`);
      createdCount++;
    } catch (err) {
      console.error(`❌ Failed to create directory: ${p}\n   Error: ${err.message}`);
      errorCount++;
    }
  });

  // Then create files
  paths.filter(p => p.isFile).forEach(({path: p, comment}) => {
    if (isInsecurePath(p)) return;
    
    const fullPath = path.join(baseDir, p);
    const dirPath = path.dirname(fullPath);

    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isFile()) {
        console.log(`⏩ File exists: ${p}${comment ? ` # ${comment}` : ''}`);
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
      
      // If writeComments is true and we have a comment, add it to the file as a header
      let initialContent = '';
      if (writeComments && comment) {
        const ext = path.extname(p);
        // Choose comment style based on file extension
        if (['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.java', '.c', '.cpp'].includes(ext)) {
          initialContent = `/* ${comment} */\n\n`;
        } else if (['.py', '.sh', '.bash', '.yml', '.yaml', '.rb'].includes(ext)) {
          initialContent = `# ${comment}\n\n`;
        } else if (['.html', '.xml', '.svg'].includes(ext)) {
          initialContent = `<!-- ${comment} -->\n\n`;
        } else {
          initialContent = `// ${comment}\n\n`;
        }
      }
      
      fs.writeFileSync(fullPath, initialContent, 'utf8');
      console.log(`📄 Created file: ${p}${comment ? ` # ${comment}` : ''}`);
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