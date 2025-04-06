# File Tree Creator 🌳📂

A powerful CLI tool and library to generate file and folder structures from both tree diagrams and flat path lists. Perfect for quickly scaffolding projects or creating complex directory structures with a single command.

## Features ✨

- **Dual Input Modes**: Supports both tree diagrams (`│ ├── └──`) and flat path lists
- **Smart Parsing**: Handles comments (lines starting with `#`) and validates paths
- **Safe Operations**: Skips existing files and validates path characters
- **Recursive Creation**: Automatically creates all necessary parent directories
- **CLI & Programmable**: Use via command line or import as a library

## Installation 💿

### Global Install (recommended for CLI usage)
```bash
npm install -g file-tree-creator
```

### Local Project Install
```bash
npm install file-tree-creator --save-dev
```

## Usage 🚀

### CLI Usage
```bash
ftc <input-file> [--mode=tree|flat]
```
or
```bash
npx file-tree-creator <input-file> [--mode=tree|flat]
```

#### Examples:
1. From a tree diagram:
```bash
ftc structure.txt
# or explicitly
ftc structure.txt --mode=tree
```

2. From flat paths:
```bash
ftc paths.txt --mode=flat
```

### Programmatic Usage
```javascript
const { parseTreeDiagram, parseFlatPath, createFileStructure } = require('file-tree-creator');

// Using tree diagram
const treeInput = `
├── src
│   ├── index.js
│   └── utils
│       └── helper.js
`;
const paths = parseTreeDiagram(treeInput);
createFileStructure(paths, './my-project');

// Using flat paths
const flatInput = `
src/index.js
src/utils/helper.js
README.md
`;
const flatPaths = parseFlatPath(flatInput);
createFileStructure(flatPaths, './my-project');
```

## Input Formats 📝

### Tree Diagram Format
```
├── src
│   ├── index.js
│   └── utils
│       └── helper.js
├── README.md
└── .gitignore
```

### Flat Path Format
```
src/index.js
src/utils/helper.js
README.md
.gitignore
```

### Comments
Both formats support comments (lines starting with `#`):
```
# This is a comment
src/index.js  # This part will be parsed
# Another comment
```

## API Reference 📚

### `parseTreeDiagram(treeText)`
Parses a tree diagram string into an array of paths.

**Parameters:**
- `treeText` (String): The tree diagram text

**Returns:**
- Array of path strings

### `parseFlatPath(flatText)`
Parses a flat path list into an array of paths.

**Parameters:**
- `flatText` (String): The flat path text

**Returns:**
- Array of path strings

### `createFileStructure(paths, baseDir = process.cwd())`
Creates the file structure from an array of paths.

**Parameters:**
- `paths` (Array): Array of path strings
- `baseDir` (String): Base directory to create structure in (defaults to current directory)

### Strict vs Lenient Modes

By default, the tool runs in **lenient mode**:
- Continues after errors
- Shows warnings for invalid paths
- Returns exit code 0 unless catastrophic failure occurs

Use `--strict` flag for **strict mode**:
- Fails immediately on first error
- Returns exit code 1 if any errors occur
- Recommended for CI/CD environments

Examples:
```bash
# Lenient mode (default)
ftc paths.txt

# Strict mode
ftc paths.txt --strict
```
## Error Handling 🛑

The tool handles several error cases gracefully:
- Skips existing files/folders with warning
- Rejects paths with invalid characters (`<>:"|?*`)
- Rejects paths with double slashes (`//`)
- Provides clear error messages for file system operations

## Examples 🏗️

See the `examples/` directory for sample input files:
- `tree.txt`: Tree diagram example
- `flat.txt`: Flat path example

## Roadmap & Suggestions for Improvement 🛣️

### Planned Features
1. **Interactive Mode**: Prompt for confirmation before creating each file/folder
2. **Template Support**: Support placeholders/variables in file contents
3. **Dry Run Option**: Show what would be created without actually making changes
4. **Visual Output**: Option to display the created structure as a tree
5. **Git Integration**: Automatically stage created files in git

### Potential Enhancements
1. **File Content Support**: Allow specifying initial file content in the input
2. **Permissions**: Support setting file permissions during creation
3. **Glob Patterns**: Support glob patterns in flat mode
4. **JSON/YAML Input**: Support structured input formats
5. **Progress Bar**: Visual feedback for large structures
6. **Undo Functionality**: Track created files for potential rollback
7. **Cross-Platform Testing**: Ensure consistent behavior across OSes

## Contributing 🤝

Contributions are welcome! Please open an issue or PR for any:
- Bug reports
- Feature requests
- Documentation improvements
- Test cases

## License 📄

MIT © Festus Charles

---

Enjoy creating file structures with ease! 🎯