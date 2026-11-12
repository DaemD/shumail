import { BlurScrollEffect as BlurScrollEffect1 } from './effect-1/blurScrollEffect.js';
import { BlurScrollEffect as BlurScrollEffect2 } from './effect-2/blurScrollEffect.js';
import { BlurScrollEffect as BlurScrollEffect3 } from './effect-3/blurScrollEffect.js';
import { BlurScrollEffect as BlurScrollEffect4 } from './effect-4/blurScrollEffect.js';
import { initNight } from './night.js';

gsap.registerPlugin(ScrollTrigger);

const init = () => {
  const effects = [
    { selector: '[data-effect-1]', effect: BlurScrollEffect1 },
    { selector: '[data-effect-2]', effect: BlurScrollEffect2 },
    { selector: '[data-effect-3]', effect: BlurScrollEffect3 },
    { selector: '[data-effect-4]', effect: BlurScrollEffect4 },
  ];

  effects.forEach(({ selector, effect }) => {
    document.querySelectorAll(selector).forEach(el => {
      new effect(el);
    });
  });

  initNight();

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
};

let started = false;
const start = () => {
  if (started) return;
  started = true;
  document.body.classList.remove('loading');
  init();
};

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(start);
} else {
  window.addEventListener('load', start);
}
setTimeout(start, 1200);