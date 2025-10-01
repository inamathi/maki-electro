export function initAutoResize(selector: string) {
  document.querySelectorAll<HTMLTextAreaElement>(selector).forEach((el) => {
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    el.addEventListener('input', resize);
    requestAnimationFrame(resize);
  });
}