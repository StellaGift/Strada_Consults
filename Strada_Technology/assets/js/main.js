(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      navigation.classList.remove('is-open');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
      navigation.classList.toggle('is-open', !isOpen);
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const themeToggle = document.querySelector('.theme-toggle');
  const themeLabel = document.querySelector('.theme-toggle-text');
  const themeIcon = document.querySelector('.theme-toggle-icon');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themeStorageKey = 'strada-technology-theme';

  const applyTheme = (theme) => {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';
    const nextTheme = selectedTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', selectedTheme);

    if (themeToggle) themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    if (themeLabel) themeLabel.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} mode`;
    if (themeIcon) themeIcon.textContent = selectedTheme === 'dark' ? '☼' : '☾';
    if (themeColor) themeColor.setAttribute('content', selectedTheme === 'dark' ? '#101b2b' : '#f4f3ed');
  };

  let savedTheme = 'dark';
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') savedTheme = storedTheme;
  } catch (error) {
    // Keep the default theme if storage is unavailable.
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        window.localStorage.setItem(themeStorageKey, nextTheme);
      } catch (error) {
        // The selected theme remains active for this page if storage is unavailable.
      }
    });
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
