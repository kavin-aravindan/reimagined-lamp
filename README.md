# Co-Lab: Collaborative Web Experiment Hub

Welcome to **Co-Lab**! This is a collaborative space where developers can submit their own custom static landing pages, interactive widgets, frontend experiments, or portfolio items. 

The main landing page is a dynamic, modern dashboard built with a premium glassmorphic theme that automatically detects, indexes, and showcases all contributors' sub-folders.

---

## 🚀 How It Works

This codebase is **completely free of NPM package manager overhead** (no `node_modules`, no complex installations). It relies on:
1. **A Vanilla Node.js Builder (`build.js`):** Uses standard library filesystem modules to scan the `contributors/` directory and compile a registry in `data/contributors.json`.
2. **GitHub Actions Workflow:** Automatically runs this builder and deploys the entire website to **GitHub Pages** on every push to the `main` branch.

---

## 🛠️ How to Contribute

Adding your page to the showcase takes less than 5 minutes. Follow these simple steps:

### 1. Create Your Sub-folder
1. Clone this repository to your local machine.
2. In the `contributors/` directory, duplicate the template folder `_template/` and rename it to your preferred workspace name (e.g., `jane-doe` or `particles-effect`).
   > ⚠️ **Important:** Do not modify the original `_template/` folder directly.

### 2. Configure Your Metadata
Open your new folder and locate `metadata.json`. Fill out your project's properties:
```json
{
  "author": "Your Name",
  "title": "Your Project Title",
  "description": "A short, descriptive sentence highlighting what your page does.",
  "tags": ["Animation", "Interactive", "Canvas", "3D"],
  "github": "your-github-username"
}
```
* **author:** Displayed on the card as the page creator.
* **title:** The header title shown on your card and browser tab.
* **description:** Explains your page inside the card display.
* **tags:** Up to 3-5 short tags to allow users to filter your page on the main showcase page.
* **github:** Your username (used to display your GitHub profile link and fetch your profile avatar automatically).

### 3. Customize Your Code
Develop your custom page inside your folder using:
* `index.html` (Make sure your HTML includes a back link to the hub: `<a href="../../index.html">← Back to Hub</a>`)
* `style.css`
* `script.js`

You can add image assets, sub-folders, or standard assets directly within your own contributor directory.

---

## 💻 Local Development & Testing

To test your page and see how it displays on the main dashboard before making a Git commit:

1. **Build the Registry:**
   Run the standard Node.js scan script in the root directory:
   ```bash
   node build.js
   ```
   This will scan the folders, check if they have valid `index.html` files, and compile the updated list into `data/contributors.json`.

2. **Serve the Webpage:**
   Since the page uses standard JavaScript `fetch()` API to read the JSON file, opening `index.html` directly as a local file double-click may trigger CORS issues in some browsers. 
   
   To avoid this, serve the folder using any standard lightweight static server:
   * **Python:** Run `python -m http.server 8000` (then open `http://localhost:8000`)
   * **VS Code:** Click "Go Live" with the Live Server extension.
   * **Npx (if Node is installed):** Run `npx http-server` or `npx live-server`.

3. **Verify:**
   Open the site in your browser. Ensure your card is displayed in the grid, your tags filter correctly, your search matches, and the launch button successfully loads your sub-page.

---

## 🌐 Automatic Deployment

You don't need to commit the generated `data/contributors.json` to the repo! The GitHub Actions workflow in `.github/workflows/deploy.yml` takes care of running `node build.js` on the cloud runner and publishing the output directly to **GitHub Pages** whenever code is merged to `main`.
