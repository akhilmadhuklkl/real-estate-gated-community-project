(() => {
  const slides = [...document.querySelectorAll('.vision-slide')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length < 2 || reduceMotion) return;

  let activeIndex = 0;
  window.setInterval(() => {
    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('active');
  }, 4800);
})();
