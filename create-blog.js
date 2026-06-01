const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TEMPLATE_DIR = path.join(__dirname, 'contributors', '_template-blog');
const CONTRIBUTORS_DIR = path.join(__dirname, 'contributors');

// Check CLI Arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
📖 Co-Lab Markdown Blog Post Generator

Usage:
  node create-blog.js <path-to-markdown-file> [folder-name]

Format of Markdown File (Front-Matter is required):
  ---
  author: Jane Doe
  title: Title of My Blog Post
  description: A short description for the index card.
  tags: CSS, Grid, HTML
  github: janedoe
  ---
  # Post Header
  Your markdown content here...
  `);
  process.exit(1);
}

const mdFilePath = path.resolve(args[0]);
let customFolderName = args[1];

if (!fs.existsSync(mdFilePath)) {
  console.error(`❌ Error: Markdown file not found at ${mdFilePath}`);
  process.exit(1);
}

console.log('📖 Reading markdown file...');
const rawContent = fs.readFileSync(mdFilePath, 'utf8');

// Parse Front Matter
const { metadata, body } = parseFrontMatter(rawContent);

// Validate Metadata
const requiredFields = ['author', 'title', 'description', 'tags', 'github'];
const missingFields = requiredFields.filter(field => !metadata[field]);

if (missingFields.length > 0) {
  console.error(`❌ Error: Missing required front-matter fields: ${missingFields.join(', ')}`);
  console.error(`Please include them at the top of your markdown file between --- dashes.`);
  process.exit(1);
}

// Generate Target Folder Name
const folderName = customFolderName || metadata.github.toLowerCase().trim();
const targetDir = path.join(CONTRIBUTORS_DIR, folderName);

if (fs.existsSync(targetDir)) {
  console.warn(`⚠️ Warning: Directory already exists at contributors/${folderName}. Overwriting contents...`);
} else {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Compile Markdown to HTML
console.log('🛠️ Converting markdown body to HTML...');
const postBodyHtml = convertMarkdownToHtml(body);

// Load Template Layout
const templateHtmlPath = path.join(TEMPLATE_DIR, 'index.html');
if (!fs.existsSync(templateHtmlPath)) {
  console.error(`❌ Error: Template blog layout not found at ${templateHtmlPath}`);
  process.exit(1);
}

let templateHtml = fs.readFileSync(templateHtmlPath, 'utf8');

// Replace Placeholder Tokens
console.log('✍️ Injecting metadata and content into template...');
const formattedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Calculate reading time roughly (~200 words per minute)
const wordCount = body.split(/\s+/).length;
const readTimeMins = Math.max(1, Math.ceil(wordCount / 200));

// Replacements
templateHtml = templateHtml
  // Page Meta
  .replace(/<title>.*?<\/title>/, `<title>${metadata.title} - Co-Lab Blog</title>`)
  // Read Time
  .replace(/<span class="read-time">.*?<\/span>/, `<span class="read-time"><i data-lucide="clock"></i> ${readTimeMins} min read</span>`)
  // Titles
  .replace(/<h1 class="post-title">.*?<\/h1>/, `<h1 class="post-title">${metadata.title}</h1>`)
  // Cover Banner Text
  .replace(/<div class="cover-text">.*?<\/div>/, `<div class="cover-text">${metadata.title.toUpperCase().slice(0, 20)}...</div>`)
  // Author
  .replace(/<div class="avatar">.*?<\/div>/, `<div class="avatar">${getInitials(metadata.author)}</div>`)
  .replace(/<span class="author-name">.*?<\/span>/, `<span class="author-name">${metadata.author}</span>`)
  .replace(/<span class="publish-date">.*?<\/span>/, `<span class="publish-date">Published ${formattedDate}</span>`)
  .replace(/By <a href="https:\/\/github\.com\/.*?" target="_blank" rel="noopener noreferrer">.*?<\/a>/, `By <a href="https://github.com/${metadata.github}" target="_blank" rel="noopener noreferrer">${metadata.author}</a>`)
  // Github Follow
  .replace(/href="https:\/\/github\.com\/.*?" class="github-btn"/, `href="https://github.com/${metadata.github}" class="github-btn"`)
  .replace(/<span>Follow @.*?<\/span>/, `<span>Follow @${metadata.github}</span>`)
  // Main Body Content
  .replace(/<div class="post-body">[\s\S]*?<\/div>\s*<!--\s*Post Footer/, `<div class="post-body">\n${postBodyHtml}\n</div>\n\n        <!-- Post Footer`);

// Write files to target folder
fs.writeFileSync(path.join(targetDir, 'index.html'), templateHtml, 'utf8');

// Copy boilerplate CSS and JS
fs.copyFileSync(path.join(TEMPLATE_DIR, 'style.css'), path.join(targetDir, 'style.css'));
fs.copyFileSync(path.join(TEMPLATE_DIR, 'script.js'), path.join(targetDir, 'script.js'));

// Write metadata.json file
const metadataJson = {
  author: metadata.author,
  title: metadata.title,
  description: metadata.description,
  tags: Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags],
  github: metadata.github
};
fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify(metadataJson, null, 2), 'utf8');

console.log(`✅ Success! Created blog post at contributors/${folderName}/`);

// Run build.js to auto-index the new page
console.log('🔄 Re-building showcase index...');
try {
  const buildResult = execSync('node build.js').toString();
  console.log(buildResult);
} catch (buildError) {
  console.error('⚠️ Failed to run build.js automatically:', buildError.message);
}

// Helper Functions
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const yamlContent = match[1];
  const body = content.replace(frontMatterRegex, '');
  
  const metadata = {};
  const lines = yamlContent.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Strip outer quotes
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      
      if (key === 'tags') {
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata.tags = value.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, '')).filter(t => t);
        } else {
          metadata.tags = value.split(',').map(t => t.trim()).filter(t => t);
        }
      } else {
        metadata[key] = value;
      }
    }
  });
  
  return { metadata, body };
}

function convertMarkdownToHtml(markdown) {
  let html = markdown.replace(/\r\n/g, '\n');
  
  // Protect Code Blocks
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `<!--CODEBLOCK_${codeBlocks.length}-->`;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code class="language-${lang}">${escapedCode}</code></pre>`);
    return placeholder;
  });

  // Blockquotes
  html = html.replace(/(?:^|\n)>\s*(.*?)(?=\n\n|\n[^\s>])/g, (match, content) => {
    const cleanContent = content.replace(/(^|\n)>\s*/g, ' ').trim();
    return `\n<blockquote>${cleanContent}</blockquote>\n`;
  });

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Lists
  let listOpen = false;
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^[-*+]\s+(.*)$/.test(line)) {
      const match = line.match(/^[-*+]\s+(.*)$/);
      let content = match[1];
      if (!listOpen) {
        lines[i] = '<ul>\n<li>' + content + '</li>';
        listOpen = true;
      } else {
        lines[i] = '<li>' + content + '</li>';
      }
    } else {
      if (listOpen) {
        lines[i - 1] = lines[i - 1] + '\n</ul>';
        listOpen = false;
      }
    }
  }
  if (listOpen) {
    lines[lines.length - 1] = lines[lines.length - 1] + '\n</ul>';
  }
  html = lines.join('\n');

  // Inline styling
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Paragraphs
  html = html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return '';
    if (/^<(h\d|blockquote|ul|ol|pre|li)/.test(p)) return p;
    return `<p>${p}</p>`;
  }).filter(p => p).join('\n\n');

  // Restore Code Blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`<!--CODEBLOCK_${index}-->`, block);
  });

  return html;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

function getInitials(name) {
  const parts = name.split(/[\s-_]+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
