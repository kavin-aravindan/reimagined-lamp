document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Element Cache
  const themeToggle = document.getElementById('theme-toggle');
  const progressBar = document.getElementById('progress-bar');
  const likeBtn = document.getElementById('like-btn');
  const likeCountEl = document.getElementById('like-count');
  const shareBtn = document.getElementById('share-btn');
  const toast = document.getElementById('toast');

  let likesCount = parseInt(likeCountEl.textContent, 10) || 42;
  let isLiked = false;

  // ----------------------------------------------------
  // THEME SWITCHING
  // ----------------------------------------------------
  const savedTheme = localStorage.getItem('co-lab-blog-theme') || 'light';
  document.body.className = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.className = newTheme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('co-lab-blog-theme', newTheme);
  });

  // ----------------------------------------------------
  // READING PROGRESS BAR
  // ----------------------------------------------------
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });

  // ----------------------------------------------------
  // LIKE BUTTON INTERACTIVE
  // ----------------------------------------------------
  likeBtn.addEventListener('click', () => {
    isLiked = !isLiked;
    
    if (isLiked) {
      likesCount += 1;
      likeBtn.classList.add('liked');
      // Add subtle scale pop animation
      likeBtn.style.transform = 'scale(1.1)';
      setTimeout(() => likeBtn.style.transform = '', 200);
    } else {
      likesCount -= 1;
      likeBtn.classList.remove('liked');
    }
    
    likeCountEl.textContent = likesCount;
  });

  // ----------------------------------------------------
  // SHARE LINK & TOAST SYSTEM
  // ----------------------------------------------------
  shareBtn.addEventListener('click', async () => {
    const pageUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(pageUrl);
      showToast();
    } catch (err) {
      console.warn('❌ Clipboard API failed, falling back to document.execCommand', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = pageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast();
      } catch (copyErr) {
        console.error('❌ Failed to copy page URL:', copyErr);
      }
      document.body.removeChild(textArea);
    }
  });

  function showToast() {
    toast.classList.remove('hidden');
    toast.style.transform = 'translateY(0)';
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 300);
    }, 3000);
  }
});
