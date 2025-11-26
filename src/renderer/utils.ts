export function ensureInputAccess() {
  document.querySelectorAll('input, textarea, select').forEach((input: HTMLElement) => {
    const style = input.style as any;
    Object.assign(style, {
      pointerEvents: 'auto',
      userSelect: 'text',
      webkitUserSelect: 'text',
      webkitAppRegion: 'no-drag'
    });
  });
  
  document.querySelectorAll('#restaurant-modal, #menu-modal, #restaurant-modal > div, #menu-modal > div')
    .forEach((modal: HTMLElement) => {
      (modal.style as any).webkitAppRegion = 'no-drag';
    });
}

export const forceInputInteractivity = ensureInputAccess;

export function initInputObserver() {
  const observer = new MutationObserver(ensureInputAccess);
  (window as any).forceInputInteractivity = ensureInputAccess;

  window.addEventListener('DOMContentLoaded', () => {
    ensureInputAccess();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  });

  window.addEventListener('focus', ensureInputAccess, true);
}
