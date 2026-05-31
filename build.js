const fs = require('fs');
const path = require('path');

const CONTRIBUTORS_DIR = path.join(__dirname, 'contributors');
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'contributors.json');

console.log('🚀 Starting directory scan for contributors...');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data directory:', DATA_DIR);
}

try {
  if (!fs.existsSync(CONTRIBUTORS_DIR)) {
    fs.mkdirSync(CONTRIBUTORS_DIR, { recursive: true });
    console.log('📁 Created contributors directory:', CONTRIBUTORS_DIR);
  }

  const items = fs.readdirSync(CONTRIBUTORS_DIR);
  const submissions = [];
  const allTags = new Set();

  items.forEach((item) => {
    const itemPath = path.join(CONTRIBUTORS_DIR, item);
    const stat = fs.statSync(itemPath);

    // Skip non-directories, templates, and hidden files/directories
    if (!stat.isDirectory()) return;
    if (item.startsWith('_') || item.startsWith('.')) return;

    console.log(`🔍 Scanning folder: ${item}`);

    const metadataPath = path.join(itemPath, 'metadata.json');
    const indexHtmlPath = path.join(itemPath, 'index.html');
    
    let metadata = {
      author: item,
      title: `${item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
      description: 'Custom contributor project page.',
      tags: [],
      github: ''
    };

    // If metadata.json exists, read and parse it
    if (fs.existsSync(metadataPath)) {
      try {
        const rawData = fs.readFileSync(metadataPath, 'utf8');
        const parsed = JSON.parse(rawData);
        
        // Merge with fallback defaults to ensure properties exist
        metadata = {
          author: parsed.author || metadata.author,
          title: parsed.title || metadata.title,
          description: parsed.description || metadata.description,
          tags: Array.isArray(parsed.tags) ? parsed.tags : metadata.tags,
          github: parsed.github || metadata.github
        };
      } catch (err) {
        console.error(`⚠️ Error parsing metadata.json in ${item}:`, err.message);
      }
    } else {
      console.log(`ℹ️ No metadata.json found in ${item}. Using fallback metadata.`);
    }

    // Verify index.html exists in this folder
    const hasIndex = fs.existsSync(indexHtmlPath);
    if (!hasIndex) {
      console.warn(`⚠️ Warning: No index.html found in folder ${item}. Users won't be able to view this page.`);
    }

    // Add tags to global set
    metadata.tags.forEach(tag => {
      if (tag && typeof tag === 'string') {
        allTags.add(tag.trim());
      }
    });

    submissions.push({
      folderName: item,
      path: `contributors/${item}/index.html`,
      hasIndex,
      ...metadata
    });
  });

  // Sort submissions alphabetically by title
  submissions.sort((a, b) => a.title.localeCompare(b.title));

  const result = {
    updatedAt: new Date().toISOString(),
    totalCount: submissions.length,
    tags: Array.from(allTags).sort(),
    submissions
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✅ Success! Generated registry at ${OUTPUT_FILE}`);
  console.log(`📈 Statistics: Found ${submissions.length} contributors and ${allTags.size} unique tags.`);

} catch (error) {
  console.error('❌ Critical failure scanning directories:', error.message);
  process.exit(1);
}
