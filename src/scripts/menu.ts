const menu = document.querySelector<HTMLDetailsElement>('[data-menu]');

if (menu) {
  const closeMenu = (): void => {
    menu.open = false;
  };

  for (const link of menu.querySelectorAll('a')) {
    link.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    closeMenu();
    menu.querySelector('summary')?.focus();
  });

  document.addEventListener('click', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) closeMenu();
  });
}
