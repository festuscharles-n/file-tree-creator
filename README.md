Sure! Here's a fully polished, developer-friendly, and easy-to-follow `README.md` for your **`file-tree-creator`** NPM package:

---

```markdown
# 📁 file-tree-creator

> Easily generate file and folder structures from visual tree diagrams or flat path listings. Perfect for project bootstrapping!

---

## 🚀 What is it?

`file-tree-creator` is a CLI tool that helps you **create files and directories** from either:

- a **tree-style diagram** (like the ones you paste in docs or GitHub), or  
- a **flat path-style list** (like `src/index.js`, `src/components/Header.js`)

Use it to scaffold out your project in seconds!

---

## 📦 Features

✅ Tree-style diagram support  
✅ Flat path-style list support  
✅ Mixed indentation handling  
✅ File & folder auto-detection  
✅ CLI usage (no setup needed)  
✅ Helpful error messages

---

## 📥 Installation

### Use without installing (recommended for one-time usage):

```bash
npx file-tree-creator <input.txt> [flat]
```

### Or install globally:

```bash
npm install -g file-tree-creator
```

---

## ✨ Usage Guide

### 📂 1. Tree-style input (default mode)

Create a file like `structure.txt` with this content:

```
├── src
│   ├── index.js
│   └── utils
│       └── helper.js
├── .gitignore
└── README.md
```

Then run:

```bash
npx file-tree-creator structure.txt
```

This will automatically create:

```
src/
├── index.js
└── utils/
    └── helper.js
.gitignore
README.md
```

---

### 📄 2. Flat path-style input

Create `flat.txt`:

```
src/index.js
src/utils/helper.js
.gitignore
README.md
```

Run it like this:

```bash
npx file-tree-creator flat.txt flat
```

---

## 🧪 Example Project Setup

```bash
mkdir my-new-project && cd my-new-project
echo "├── src\n│   └── index.js\n└── README.md" > structure.txt
npx file-tree-creator structure.txt
```

Done! ✨ Now `my-new-project` has:

```
src/
└── index.js
README.md
```

---

## 🧱 Use Inside Scripts

Install it locally:

```bash
npm install --save-dev file-tree-creator
```

In `package.json`:

```json
"scripts": {
  "scaffold": "file-tree-creator structure.txt"
}
```

Run with:

```bash
npm run scaffold
```

---

## ❗ Error Handling

- If your input contains malformed tree lines or invalid paths, you'll get a clear error message.
- It will not overwrite existing files.
- Empty lines or comments (`# ...`) are ignored.

---

## 🙋 FAQ

**Q: Does it create empty folders?**  
Yes, as long as you list them in the tree or path format.

**Q: Does it overwrite files?**  
No, it will skip files that already exist.

**Q: Can I use this for code generators?**  
Absolutely! Combine it with templates or starter files for a powerful custom scaffolding tool.

---

## 👤 Author

Made with ❤️ by [Festus Charles](https://github.com/festuscharles-n)

---

## 📜 License

MIT

---