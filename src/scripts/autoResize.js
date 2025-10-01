export function initAutoResize(selector) {
  console.log('[autoResize] init', selector);
  const nodes = document.querySelectorAll(selector);
  console.log('[autoResize] found', nodes.length);

  nodes.forEach((el) => {
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };
    el.addEventListener('input', resize, { passive: true });
    requestAnimationFrame(resize); // 初期フィット
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAutoResize('.js-autoresize');
});