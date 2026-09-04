(() => {
  const progress = document.querySelector('.scroll-progress');
  const mobileMenu = document.querySelector('.mobile-menu');

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mobileMenu.removeAttribute('open'));
  });

  document.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  const copyButton = document.querySelector('[data-copy-template]');
  const template = document.querySelector('[data-template]');
  const toast = document.querySelector('.toast');
  let toastTimer;

  copyButton?.addEventListener('click', async () => {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.textContent.trim());
      if (toast) {
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
      }
    } catch (error) {
      window.prompt('ចម្លងអត្ថបទខាងក្រោម៖', template.textContent.trim());
    }
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
