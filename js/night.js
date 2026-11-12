// The night sky, and a wordless tale told in the background as the letter scrolls:
// a tired bird, a murky pond, a mockingbird, two reflections, a song, a nest.

const FLY_SVG = `
<svg class="bird-fly" viewBox="0 0 48 24" aria-hidden="true">
  <path d="M6 15c6-7 12-8 18-1 6-9 16-7 22-2-8 0-12 4-20 4S10 16 6 15z"/>
</svg>`;

const PERCH_SVG = `
<svg class="bird-perch" viewBox="0 0 48 32" aria-hidden="true">
  <path d="M11 18 L1 12.5 L3.5 21 Z"/>
  <ellipse cx="22" cy="20" rx="12" ry="7.5"/>
  <circle cx="33" cy="12" r="5.8"/>
  <path d="M38 10.6 L44.5 12.4 L38 14.2 Z"/>
  <path d="M19 26.5v4.5M25 26.5v4.5" stroke-width="1.4" stroke="currentColor" fill="none"/>
</svg>`;

const NOTE_SVG = `
<svg viewBox="0 0 16 22" aria-hidden="true">
  <ellipse cx="5.5" cy="17.5" rx="4.5" ry="3.4" transform="rotate(-18 5.5 17.5)"/>
  <path d="M9 17V2.5c2.5 1.6 5 3 5.6 6.4" stroke="currentColor" stroke-width="1.6" fill="none"/>
</svg>`;

const NEST_SVG = `
<svg viewBox="0 0 64 28" aria-hidden="true">
  <path class="nest-bowl" d="M3 9C10 27 54 27 61 9 50 15 14 15 3 9Z"/>
  <g class="nest-twigs">
    <path d="M5 11c14 9 38 10 54 1"/>
    <path d="M8 15c14 8 36 8 50 0"/>
    <path d="M11 9l19 10M53 9 33 20M20 10l21 10M44 10 24 20"/>
  </g>
</svg>`;

const BRANCH_SVG = `
<svg viewBox="0 0 200 60" aria-hidden="true">
  <path class="branch-wood" d="M0 36C40 34 90 30 150 24c20-2 35-4 46-6-10 6-28 9-46 11-50 5-100 11-150 15Z"/>
  <path class="branch-twig" d="M118 28c10-9 20-15 34-20M168 22c6-4 12-6 20-6"/>
  <ellipse class="branch-leaf" cx="154" cy="7" rx="7" ry="3" transform="rotate(-24 154 7)"/>
  <ellipse class="branch-leaf" cx="190" cy="15" rx="6" ry="2.6" transform="rotate(10 190 15)"/>
  <ellipse class="branch-leaf" cx="70" cy="28" rx="6" ry="2.4" transform="rotate(-30 70 28)"/>
</svg>`;

const makeStars = (root, count) => {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 70}%`;
    star.style.setProperty('--size', `${0.8 + Math.random() * 1.8}px`);
    star.style.setProperty('--delay', `${Math.random() * 4}s`);
    star.style.setProperty('--dur', `${2.4 + Math.random() * 3}s`);
    frag.appendChild(star);
  }
  root.appendChild(frag);
};

const buildTale = (tale) => {
  tale.querySelectorAll('.bird').forEach((bird) => {
    if (!bird.childElementCount) bird.innerHTML = FLY_SVG + PERCH_SVG;
  });
  tale.querySelectorAll('.reflection').forEach((r) => {
    if (!r.childElementCount) r.innerHTML = PERCH_SVG;
  });
  tale.querySelectorAll('.note').forEach((n) => {
    if (!n.childElementCount) n.innerHTML = NOTE_SVG;
  });

  const nest = tale.querySelector('.nest');
  if (nest && !nest.childElementCount) {
    nest.innerHTML = `<span class="nest-glow"></span>${NEST_SVG}`;
  }

  let branch = tale.querySelector('.branch');
  if (!branch) {
    branch = document.createElement('span');
    branch.className = 'branch';
    tale.insertBefore(branch, nest);
  }
  if (!branch.childElementCount) branch.innerHTML = BRANCH_SVG;

  const pond = tale.querySelector('.pond');
  if (pond && !pond.querySelector('.ripple')) {
    ['ripple ripple--meet', 'ripple ripple--meet', 'ripple ripple--drink'].forEach((cls) => {
      const ripple = document.createElement('span');
      ripple.className = cls;
      pond.appendChild(ripple);
    });
  }
};

const initTale = () => {
  const tale = document.querySelector('.tale');
  if (!tale) return;
  buildTale(tale);

  const q = (sel) => tale.querySelector(sel);
  const pond = q('.pond');
  const murk = q('.pond-surface');
  const clear = q('.pond-glow');
  const reflBirdy = q('.reflection--birdy');
  const reflMock = q('.reflection--mock');
  const birdy = q('.bird--birdy');
  const mock = q('.bird--mock');
  const notes = gsap.utils.toArray(tale.querySelectorAll('.note'));
  const nest = q('.nest');
  const nestGlow = q('.nest-glow');
  const branch = q('.branch');
  const meetRipples = tale.querySelectorAll('.ripple--meet');
  const drinkRipple = q('.ripple--drink');

  const fly = (bird) => bird.querySelector('.bird-fly');
  const perch = (bird) => bird.querySelector('.bird-perch');

  // Sit the nest on the branch tip; re-run whenever ScrollTrigger re-measures.
  const placeNest = () => {
    const bw = branch.offsetWidth;
    const bh = branch.offsetHeight;
    nest.style.left = `${branch.offsetLeft + bw * 0.65 - nest.offsetWidth / 2}px`;
    nest.style.top = `${branch.offsetTop + bh * 0.44 - nest.offsetHeight * 0.72}px`;
  };
  placeNest();
  ScrollTrigger.addEventListener('refreshInit', placeNest);

  // Layout-derived positions. offset* values ignore transforms, so these stay
  // correct while the pond and birds are mid-animation.
  const g = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pl = pond.offsetLeft;
    const pt = pond.offsetTop;
    const pw = pond.offsetWidth;
    const bw = birdy.offsetWidth;
    const bh = birdy.offsetHeight;
    return {
      vw,
      vh,
      bw,
      bh,
      birdyX: pl + pw * 0.3,
      mockX: pl + pw * 0.58,
      perchY: pt - bh * 0.84,
      nestX: nest.offsetLeft + nest.offsetWidth / 2 - bw / 2,
      nestY: nest.offsetTop - bh * 0.5,
    };
  };

  gsap.set(tale, { '--birdy-fill': '#7a6f63' });
  gsap.set(mock, { scaleX: -1 });
  gsap.set([...meetRipples, drinkRipple], { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });

  // I. She grew tired of flight. A heavy, sinking glide in from the left.
  tl.fromTo(birdy,
    { x: () => -0.12 * g().vw, y: () => 0.24 * g().vh, rotation: 4, opacity: 0 },
    { x: () => 0.16 * g().vw, y: () => 0.46 * g().vh, rotation: 16, opacity: 0.9, duration: 0.9, ease: 'sine.inOut' }, 0)
    .to(birdy, { x: () => g().birdyX, y: () => g().perchY, rotation: 0, duration: 0.8, ease: 'sine.out' }, 0.9);

  // II. A pond she hated. Dark, murky water rises out of the night.
  tl.fromTo(pond, { opacity: 0, scaleX: 0.6 }, { opacity: 1, scaleX: 1, duration: 1.1, ease: 'sine.out' }, 0.5)
    .to(fly(birdy), { opacity: 0, duration: 0.05 }, 1.66)
    .to(perch(birdy), { opacity: 1, duration: 0.05 }, 1.66)
    .fromTo(reflBirdy, { opacity: 0 }, { opacity: 0.24, duration: 0.4 }, 1.7);

  // III. The dirt hid her from herself. She sinks in; her reflection all but vanishes.
  tl.to(birdy, { y: () => g().perchY + g().bh * 0.12, scaleY: 0.88, duration: 0.7, ease: 'sine.inOut' }, 2.3)
    .to(reflBirdy, { opacity: 0.05, duration: 0.7 }, 2.3)
    .to(murk, { opacity: 1, filter: 'brightness(0.7)', duration: 0.7 }, 2.3);

  // IV. Then a mockingbird appeared, gliding in from the moonlit side.
  tl.fromTo(mock,
    { x: () => 1.08 * g().vw, y: () => 0.16 * g().vh, opacity: 0 },
    { x: () => 0.72 * g().vw, y: () => 0.38 * g().vh, opacity: 1, duration: 0.6, ease: 'sine.inOut' }, 3)
    .to(mock, { x: () => g().mockX, y: () => g().perchY, duration: 0.6, ease: 'sine.out' }, 3.6)
    .to(fly(mock), { opacity: 0, duration: 0.05 }, 4.18)
    .to(perch(mock), { opacity: 1, duration: 0.05 }, 4.18)
    .fromTo(reflMock, { opacity: 0 }, { opacity: 0.3, duration: 0.3 }, 4.2)
    // Still, he stayed. She lifts a little.
    .to(birdy, { y: () => g().perchY, scaleY: 1, duration: 0.5, ease: 'sine.inOut' }, 4.3);

  // V. In the water, their reflections met.
  tl.to(reflBirdy, { opacity: 0.55, filter: 'blur(1px)', xPercent: 22, duration: 0.8, ease: 'sine.inOut' }, 4.7)
    .to(reflMock, { opacity: 0.6, filter: 'blur(1px)', xPercent: -22, duration: 0.8, ease: 'sine.inOut' }, 4.7)
    .to(murk, { filter: 'brightness(0.85)', duration: 0.8 }, 4.7);
  meetRipples.forEach((ripple, i) => {
    tl.fromTo(ripple, { scale: 0.1, opacity: 0.6 }, { scale: 1.6, opacity: 0, duration: 0.8 }, 5 + i * 0.3);
  });

  // VI. He gave her a song. Notes rise from him and drift towards a nest not yet built.
  notes.forEach((note, i) => {
    const t = 5.7 + i * 0.28;
    tl.fromTo(note,
      { x: () => g().mockX + g().bw * 0.1, y: () => g().perchY, opacity: 0, scale: 0.6, rotation: -10 },
      { x: () => g().mockX - g().bw * (0.4 + i * 0.5), y: () => g().perchY - g().vh * (0.1 + i * 0.025), opacity: 0.9, scale: 1, rotation: 6, duration: 0.6, ease: 'sine.out' }, t)
      .to(note, {
        x: () => g().nestX + g().bw * 0.3,
        y: () => g().nestY - g().bh * 0.4,
        opacity: 0,
        rotation: -8,
        duration: 0.9,
        ease: 'sine.inOut',
      }, t + 0.6);
  });
  // A whisper of what a future could hold.
  tl.fromTo(branch, { opacity: 0 }, { opacity: 0.3, duration: 0.6 }, 6.5)
    .fromTo(nest, { opacity: 0 }, { opacity: 0.25, duration: 0.6 }, 6.7)
    .fromTo(nestGlow, { opacity: 0, scale: 0.6 }, { opacity: 0.35, scale: 0.9, duration: 0.6 }, 6.8)
    .to(tale, { '--birdy-fill': '#9a8b78', duration: 0.8 }, 6.2);

  // VII. The mockingbird returned to his nest.
  tl.to(perch(mock), { opacity: 0, duration: 0.05 }, 7.3)
    .to(fly(mock), { opacity: 1, duration: 0.05 }, 7.3)
    .to(mock, { x: () => 1.1 * g().vw, y: () => 0.12 * g().vh, duration: 0.8, ease: 'sine.in' }, 7.3)
    .to(mock, { opacity: 0, duration: 0.2 }, 7.9)
    .to(reflMock, { opacity: 0, duration: 0.4 }, 7.3);

  // VIII. She drank the dirty water. It wasn't so dirty, after all.
  tl.to(birdy, { rotation: 26, duration: 0.3, ease: 'sine.inOut' }, 7.9)
    .fromTo(drinkRipple, { scale: 0.1, opacity: 0.7 }, { scale: 1.8, opacity: 0, duration: 0.7 }, 8.1)
    .to(birdy, { rotation: 0, duration: 0.3, ease: 'sine.inOut' }, 8.35)
    .to(murk, { opacity: 0.18, filter: 'brightness(1)', duration: 0.8 }, 8.0)
    .fromTo(clear, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 8.0)
    .to(reflBirdy, { opacity: 0.7, filter: 'blur(0.4px)', xPercent: 0, duration: 0.6 }, 8.1)
    .to(tale, { '--birdy-fill': '#c9b79e', duration: 0.6 }, 8.1);

  // IX. A nest of her own, filled with melodies and light.
  tl.to(perch(birdy), { opacity: 0, duration: 0.05 }, 8.8)
    .to(fly(birdy), { opacity: 1, duration: 0.05 }, 8.8)
    .to(reflBirdy, { opacity: 0, duration: 0.3 }, 8.8)
    .to(birdy, {
      x: () => (g().birdyX + g().nestX) / 2,
      y: () => Math.min(g().perchY, g().nestY) - g().vh * 0.12,
      rotation: -10,
      duration: 0.45,
      ease: 'sine.out',
    }, 8.8)
    .to(birdy, { x: () => g().nestX, y: () => g().nestY, rotation: 0, duration: 0.45, ease: 'sine.inOut' }, 9.25)
    .to(fly(birdy), { opacity: 0, duration: 0.05 }, 9.68)
    .to(perch(birdy), { opacity: 1, duration: 0.05 }, 9.68)
    .to(branch, { opacity: 0.75, duration: 0.6 }, 9.0)
    .to(nest, { opacity: 1, duration: 0.6 }, 9.1)
    .to(nestGlow, { opacity: 1, scale: 1.15, duration: 0.7 }, 9.3)
    .to(tale, { '--birdy-fill': '#ecdcc2', duration: 0.7 }, 9.3);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // No motion: show the quiet ending as a still scene.
    tl.progress(1);
    return;
  }

  ScrollTrigger.create({
    trigger: '.letter',
    start: 'top 75%',
    end: 'bottom bottom',
    scrub: 1.2,
    animation: tl,
    invalidateOnRefresh: true,
  });
};

export const initNight = () => {
  const stars = document.querySelector('.stars');
  if (stars && !stars.childElementCount) {
    makeStars(stars, window.innerWidth < 700 ? 36 : 70);
  }
  initTale();
};
