/**
 * Co-Lab Showcase Portal Logic
 * Dynamic list parsing, search, tag filters, and theme control.
 */

// State Management
let submissions = [];
let availableTags = [];
let activeTag = 'all';
let searchQuery = '';
let currentTheme = 'dark';

// DOM Element Selectors
const elements = {
  grid: document.getElementById('contributions-grid'),
  searchInput: document.getElementById('search-input'),
  clearSearch: document.getElementById('clear-search'),
  tagsContainer: document.getElementById('tags-pills-container'),
  
  // Stats Elements
  statsPages: document.querySelector('#stat-pages .stat-value'),
  statsContributors: document.querySelector('#stat-contributors .stat-value'),
  statsTags: document.querySelector('#stat-tags .stat-value'),
  
  // Results / Layout Status
  resultsCount: document.getElementById('results-count'),
  gridTitle: document.getElementById('grid-title'),
  loading: document.getElementById('loading-placeholder'),
  noResults: document.getElementById('no-results-placeholder'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  
  // Theme & Modal Toggle
  themeToggle: document.getElementById('theme-toggle'),
  modal: document.getElementById('contribute-modal'),
  modalLink: document.getElementById('contribute-rules-link'),
  modalClose: document.getElementById('close-modal-btn')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupEventListeners();
  fetchRegistry();
});

// ----------------------------------------------------
// THEME CONFIGURATION
// ----------------------------------------------------
function setupTheme() {
  const savedTheme = localStorage.getItem('co-lab-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    currentTheme = prefersDark ? 'dark' : 'light';
  }
  
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  localStorage.setItem('co-lab-theme', theme);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
}

// ----------------------------------------------------
// API / REGISTRY LOADING
// ----------------------------------------------------
async function fetchRegistry() {
  try {
    // Adding timestamp query parameter to bypass cache during development/testing
    const response = await fetch(`data/contributors.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    submissions = data.submissions || [];
    availableTags = data.tags || [];
    
    // Update Stats and Render Elements
    animateStats(submissions.length, getUniqueContributorsCount(submissions), availableTags.length);
    renderTagPills();
    filterAndRender();
    
  } catch (error) {
    console.error('❌ Failed to load contributors directory data:', error);
    showErrorState();
  } finally {
    if (elements.loading) {
      elements.loading.classList.add('hidden');
    }
  }
}

// Get unique authors count
function getUniqueContributorsCount(items) {
  const authors = items.map(item => item.author.toLowerCase().trim());
  return new Set(authors).size;
}

// ----------------------------------------------------
// CORE SHOWCASE RENDERING
// ----------------------------------------------------
function filterAndRender() {
  // Apply Search Query & Tag Filters
  const filtered = submissions.filter(item => {
    const matchesTag = activeTag === 'all' || item.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.title.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query));
      
    return matchesTag && matchesSearch;
  });

  // Update Counters & View Titles
  updateGridStatus(filtered.length);
  
  // Render Cards Grid
  if (filtered.length === 0) {
    elements.grid.innerHTML = '';
    elements.noResults.classList.remove('hidden');
  } else {
    elements.noResults.classList.add('hidden');
    renderCards(filtered);
  }

  // Refresh Lucide Icons for dynamically generated elements
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderCards(items) {
  elements.grid.innerHTML = items.map(item => {
    // Generate avatar layout
    let avatarHTML = '';
    if (item.github) {
      avatarHTML = `
        <img class="avatar-img" src="https://github.com/${item.github}.png" 
             alt="${item.author} Profile" onerror="this.outerHTML='<span class=\\'avatar-placeholder\\'>${getInitials(item.author)}</span>'">
      `;
    } else {
      avatarHTML = `<span class="avatar-placeholder">${getInitials(item.author)}</span>`;
    }

    // Generate tags list
    const tagsHTML = item.tags.map(tag => `
      <span class="card-tag" data-tag-value="${tag}">${tag}</span>
    `).join('');

    // Launch button or broken page status
    let actionHTML = '';
    if (item.hasIndex) {
      actionHTML = `
        <a href="${item.path}" class="launch-btn" target="_blank" rel="noopener noreferrer">
          <span>Launch Page</span>
          <i data-lucide="arrow-up-right"></i>
        </a>
      `;
    } else {
      actionHTML = `
        <span class="broken-badge" title="This subdirectory is missing an index.html file.">
          <i data-lucide="alert-circle"></i> Missing index.html
        </span>
      `;
    }

    const githubLinkHTML = item.github ? `
      <a href="https://github.com/${item.github}" target="_blank" rel="noopener noreferrer" class="github-handle">
        <i data-lucide="github"></i> @${item.github}
      </a>
    ` : '<span class="github-handle"><i data-lucide="user"></i> Contributor</span>';

    return `
      <article class="project-card" data-folder="${item.folderName}">
        <div class="card-header-row">
          <div class="author-profile">
            <div class="avatar-wrapper" style="background-color: ${getRandomColor(item.author)}">
              ${avatarHTML}
            </div>
            <div class="author-meta">
              <span class="author-name">${item.author}</span>
              ${githubLinkHTML}
            </div>
          </div>
        </div>
        <h4>${item.title}</h4>
        <p class="project-desc">${item.description}</p>
        <div class="card-tags">
          ${tagsHTML}
        </div>
        <div class="card-action">
          ${actionHTML}
        </div>
      </article>
    `;
  }).join('');

  // Add click listener to tags on cards
  elements.grid.querySelectorAll('.card-tag').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const clickedTag = pill.getAttribute('data-tag-value');
      selectTag(clickedTag);
    });
  });
}

function renderTagPills() {
  const currentActiveTag = activeTag;
  
  // Re-build tags row starting with "All"
  let pillsHTML = `
    <button class="tag-pill ${currentActiveTag === 'all' ? 'active' : ''}" data-tag="all">All Projects</button>
  `;

  availableTags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    const isActive = currentActiveTag.toLowerCase() === lowerTag;
    pillsHTML += `
      <button class="tag-pill ${isActive ? 'active' : ''}" data-tag="${tag}">${tag}</button>
    `;
  });

  elements.tagsContainer.innerHTML = pillsHTML;

  // Add click handlers
  elements.tagsContainer.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.getAttribute('data-tag');
      selectTag(tag);
    });
  });
}

function selectTag(tag) {
  activeTag = tag;
  renderTagPills();
  filterAndRender();
  
  // Smooth scroll down to grid on mobile when tag changes
  if (window.innerWidth <= 768) {
    elements.gridTitle.scrollIntoView({ behavior: 'smooth' });
  }
}

// ----------------------------------------------------
// UI UTILITIES & EVENTS
// ----------------------------------------------------
function setupEventListeners() {
  // Real-time Search Handler
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    
    // Toggle clear search button visibility
    if (searchQuery.length > 0) {
      elements.clearSearch.style.display = 'block';
    } else {
      elements.clearSearch.style.display = 'none';
    }
    
    filterAndRender();
  });

  // Clear search input button click
  elements.clearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    searchQuery = '';
    elements.clearSearch.style.display = 'none';
    filterAndRender();
    elements.searchInput.focus();
  });

  // Reset Filters Button
  elements.resetFiltersBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    searchQuery = '';
    elements.clearSearch.style.display = 'none';
    activeTag = 'all';
    renderTagPills();
    filterAndRender();
  });

  // Theme Toggle Button
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Guidelines Modal Event Listeners
  elements.modalLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  
  elements.modalClose.addEventListener('click', closeModal);
  
  // Close modal clicking outside container card
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeModal();
    }
  });

  // Close modal on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

function openModal() {
  elements.modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Stop page scrolling
}

function closeModal() {
  elements.modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Update counts & title text above the grid
function updateGridStatus(visibleCount) {
  const totalCount = submissions.length;
  elements.resultsCount.textContent = `Showing ${visibleCount} of ${totalCount} project${totalCount === 1 ? '' : 's'}`;
  
  if (searchQuery) {
    elements.gridTitle.textContent = `Search Results for "${searchQuery}"`;
  } else if (activeTag !== 'all') {
    elements.gridTitle.textContent = `Projects tagged with "${activeTag}"`;
  } else {
    elements.gridTitle.textContent = 'All Contributions';
  }
}

// Fallback error UI state
function showErrorState() {
  elements.grid.innerHTML = `
    <div class="no-results-state">
      <i data-lucide="alert-triangle" style="color: var(--accent-pink);"></i>
      <h4>Unable to load showcase data</h4>
      <p>The JSON registry file could not be fetched. Make sure to run <code>node build.js</code> locally or check the GitHub actions deployment.</p>
    </div>
  `;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Dynamic counter counting-up animation
function animateStats(targetPages, targetContributors, targetTags) {
  const duration = 1200; // Total animation ms
  
  animateCounter(elements.statsPages, targetPages, duration);
  animateCounter(elements.statsContributors, targetContributors, duration);
  animateCounter(elements.statsTags, targetTags, duration);
}

function animateCounter(element, target, duration) {
  let start = 0;
  const increment = target / (duration / 16); // ~60fps
  
  if (target === 0) {
    element.textContent = '0';
    return;
  }

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Extract Name Initials (e.g. "Jane Doe" -> "JD", "alex" -> "AL")
function getInitials(name) {
  const parts = name.split(/[\s-_]+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Helper to assign a consistent, appealing gradient background for name bubbles
function getRandomColor(name) {
  const colors = [
    'rgba(0, 240, 255, 0.15)', // cyan glow
    'rgba(168, 85, 247, 0.15)', // purple glow
    'rgba(244, 63, 94, 0.15)',  // pink glow
    'rgba(59, 130, 246, 0.15)', // blue glow
    'rgba(16, 185, 129, 0.15)', // green glow
    'rgba(245, 158, 11, 0.15)'  // amber glow
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
