```markdown
# 📁 file-tree-creator [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Scaffold project structures in seconds from visual tree diagrams or path lists

---

## 🌟 Features

✅ **Dual Input Modes** - Tree diagrams or flat path lists  
✅ **Smart Detection** - Auto-recognizes files vs folders  
✅ **Mixed Indentation** - Handles spaces/tabs interchangeably  
✅ **Zero Config** - Works out of the box with minimal setup  
✅ **Safe Execution** - Never overwrites existing files  
✅ **Developer Friendly** - Clear errors and helpful warnings  

---

## 🚀 Quick Start

### One-Time Usage (no installation):

```bash
npx file-tree-creator <input-file> [mode]
```

**Modes**:  
- `tree` (default) for visual diagrams  
- `flat` for path lists  

### Global Installation:

```bash
npm install -g file-tree-creator
```

---

## 📖 Usage Examples

### 1. Tree Diagram Mode (Default)

**structure.txt**:
```text
├── src
│   ├── index.js
│   └── components
│       ├── Button.js
│       └── Header.js
├── public
│   └── favicon.ico
└── README.md
```

Generate structure:
```bash
npx file-tree-creator structure.txt
# or
ftc structure.txt
```

### 2. Flat Path Mode

**paths.txt**:
```text
src/utils/helpers.js
tests/unit/example.test.js
.config.json
```

Generate structure:
```bash
npx file-tree-creator paths.txt flat
```

---

## 🛠 Integration Guide

### Use in npm Scripts

1. Install locally:
```bash
npm install --save-dev file-tree-creator
```

2. Add to package.json:
```json
{
  "scripts": {
    "scaffold": "file-tree-creator structure.txt",
    "build:structure": "ftc paths.txt flat"
  }
}
```

3. Run with:
```bash
npm run scaffold
```

---

## 🚨 Error Handling & Validation

The tool will:
- Skip existing files/folders (no overwrites)
- Ignore empty lines and comments starting with `#`
- Validate these error cases:
  ```text
  [ERROR] Duplicate path detected: src/index.js
  [WARN]  Skipped existing file: public/favicon.ico
  [ERROR] Invalid tree syntax at line 3:
          ├── malformed-line
  ```

---

## 📚 FAQ

### **Q: How are files vs folders determined?**
A: Any path ending with `/` is treated as a folder. In tree mode, items without extensions are considered folders.

### **Q: Can I use variables or templates?**
A: Not directly, but you can pipe through other tools:
```bash
cat template.txt | envsubst | file-tree-creator
```

### **Q: What character encodings are supported?**
A: UTF-8 exclusively. Ensure your input files are properly encoded.

---

## 🧪 Real-World Example

**Create a React component library**:
```bash
mkdir my-library && cd my-library

cat > structure.txt <<EOF
├── src
│   ├── components
│   │   ├── Button
│   │   │   ├── index.jsx
│   │   │   └── style.css
│   │   └── Icon
│   │       ├── index.jsx
│   │       └── Icon.jsx
│   └── index.js
├── .npmignore
└── package.json
EOF

npx file-tree-creator structure.txt
```

---

## 👩💻 Contributing

PRs welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for any new functionality
4. Submit PR with detailed description

---

## 📜 License

MIT © [Festus Charles](https://github.com/festuscharles-n)

*Like this tool? Star the repo ⭐ and share with your team!*
```