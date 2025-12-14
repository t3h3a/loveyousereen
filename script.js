console.clear();

const COLOR = 0xee5282;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.z = 700;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionMedia.matches;

if (motionMedia.addEventListener) motionMedia.addEventListener('change', handleMotionChange);
else if (motionMedia.addListener) motionMedia.addListener(handleMotionChange);

const heroCard = document.getElementById('heroCard');
const quoteTextEl = document.getElementById('quoteText');
const questionOverlay = document.getElementById('questionOverlay');
const questionText = document.getElementById('questionText');
const questionActions = document.getElementById('questionActions');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const finalOverlay = document.getElementById('finalOverlay');
const nextQuoteBtn = document.getElementById('nextQuoteBtn');
const audio = document.getElementById('bgMusic');

const loveNotes = [
  'سيرين… وجودك لحاله راحة 💗',
  'إنتِ الحلو اللي بيخلّي يومي أحلى',
  'قلبك نضيف وهيك ناس نادرة',
  'ضحكتك بتعمل سلام جوّاتي',
  'إنتِ مش بس اسم… إنتِ إحساس',
  'كل مرة بحكي عنك بحس الكلام قليل',
  'وجودك بيخلّي الدنيا ألطف',
  'إنتِ الهدوء اللي كنت أدور عليه',
  'سيرين… إنتِ أحلى صدفة',
  'إذا الحب كلمة، إنتِ معناها'
];

const questionPrompt = 'Do you love me? 💗';

let slideIndex = 0;
let questionTimer;
let noAttempts = 0;
let questionActive = false;
let noChaseInterval;
let celebrationInterval;

if (audio) {
  audio.volume = 0.35;
  audio.loop = true;
  audio.play().catch(() => {});
  document.addEventListener('pointerdown', () => audio.play().catch(() => {}), { once: true });
}

nextQuoteBtn?.addEventListener('click', advanceQuote);
yesBtn?.addEventListener('click', handleYesClick);
noBtn?.addEventListener('click', handleNoClick);

function advanceQuote() {
  if (questionActive) return;
  if (slideIndex + 1 < loveNotes.length) {
    slideIndex++;
    revealQuote(loveNotes[slideIndex]);
  } else {
    nextQuoteBtn?.setAttribute('disabled', 'true');
    nextQuoteBtn?.classList.add('is-hidden');
    showQuestionCard();
  }
}

function revealQuote(text, instant = false) {
  if (!quoteTextEl) return;
  quoteTextEl.classList.remove('is-muted', 'is-active');

  if (instant) {
    gsap.set(quoteTextEl, { opacity: 0, y: 20 });
    quoteTextEl.textContent = text;
    gsap.to(quoteTextEl, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      onComplete: () => quoteTextEl.classList.add('is-active')
    });
    return;
  }

  const tl = gsap.timeline();
  tl.to(quoteTextEl, {
    opacity: 0,
    y: 20,
    duration: 0.45,
    ease: 'power1.in',
    onComplete: () => {
      quoteTextEl.textContent = text;
    }
  });
  tl.to(quoteTextEl, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    onComplete: () => quoteTextEl.classList.add('is-active')
  });
}

function startQuoteSequence() {
  slideIndex = 0;
  questionActive = false;
  nextQuoteBtn?.removeAttribute('disabled');
  nextQuoteBtn?.classList.remove('is-hidden');
  heroCard?.classList.remove('hero-card--hidden');
  questionOverlay?.classList.add('is-hidden');
  finalOverlay?.classList.add('is-hidden');
  document.body.classList.remove('celebration');
  clearInterval(celebrationInterval);
  revealQuote(loveNotes[slideIndex], true);
}

function showQuestionCard() {
  questionActive = true;
  heroCard?.classList.add('hero-card--hidden');
  questionOverlay?.classList.remove('is-hidden');
  questionText && (questionText.textContent = questionPrompt);
  questionActions?.classList.remove('is-hidden');
  quoteTextEl?.classList.add('is-muted');
  noAttempts = 0;
  if (noBtn) {
    noBtn.style.transform = 'translate(0, 0)';
    noBtn.style.removeProperty('position');
    noBtn.style.removeProperty('left');
    noBtn.style.removeProperty('top');
    noBtn.style.removeProperty('cursor');
    noBtn.disabled = false;
  }
}

function showTemporaryQuestionMessage(message, hideActions = true) {
  if (!questionText) return;
  clearTimeout(questionTimer);
  questionText.textContent = message;
  if (hideActions) questionActions?.classList.add('is-hidden');
  questionTimer = window.setTimeout(() => {
    questionText.textContent = questionPrompt;
    if (hideActions) questionActions?.classList.remove('is-hidden');
  }, 2100);
}

function handleNoClick() {
  if (!questionActive) return;
  noAttempts++;
  if (noAttempts === 1) {
    showTemporaryQuestionMessage('ليشششش؟ 😭');
  } else {
    showTemporaryQuestionMessage('يعني ما في فرصة؟', false);
    startNoButtonChase();
  }
}

function startNoButtonChase() {
  if (!noBtn || noChaseInterval) return;
  noBtn.disabled = true;
  noBtn.style.position = 'fixed';
  noBtn.style.zIndex = '999';
  noBtn.style.cursor = 'not-allowed';
  setNoButtonPosition();
  noChaseInterval = window.setInterval(setNoButtonPosition, 380);
}

function setNoButtonPosition() {
  if (!noBtn) return;
  const maxX = window.innerWidth - noBtn.offsetWidth;
  const maxY = window.innerHeight - noBtn.offsetHeight;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function handleYesClick() {
  if (!questionActive) return;
  questionActive = false;
  clearTimeout(questionTimer);
  nextQuoteBtn?.classList.add('is-hidden');
  questionOverlay?.classList.add('is-hidden');
  finalOverlay?.classList.remove('is-hidden');
  quoteTextEl?.classList.add('is-muted');
  clearInterval(noChaseInterval);
  noBtn?.style.removeProperty('position');
  noBtn?.style.removeProperty('left');
  noBtn?.style.removeProperty('top');
  noBtn?.style.removeProperty('cursor');
  startCelebration();
}

function startCelebration() {
  document.body.classList.add('celebration');
  clearInterval(celebrationInterval);
  celebrationInterval = window.setInterval(createFloatingLove, 600);
}

function createFloatingLove() {
  const heart = document.createElement('span');
  heart.className = 'ascending-heart';
  heart.style.left = `${10 + Math.random() * 80}%`;
  heart.style.animationDuration = `${3 + Math.random() * 2}s`;
  document.body.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

function handleMotionChange(event) {
  prefersReducedMotion = event?.matches ?? motionMedia.matches;
  refreshParticles();
  if (prefersReducedMotion && heroCard) heroCard.classList.add('is-visible');
}

function computeParticleSettings() {
  const isMobile = window.innerWidth < 768;
  const count = prefersReducedMotion ? 600 : isMobile ? 900 : 1400;
  const size = isMobile ? 1.4 : 2.4;
  const motionMultiplier = prefersReducedMotion ? 1.6 : isMobile ? 1.25 : 1;
  return { count, size, motionMultiplier };
}

function scaledDuration(value) {
  return value * particleSettings.motionMultiplier;
}

let particleSettings = computeParticleSettings();
let currentParticleCount = 0;
const particlesVerts = [];
let pointsMesh;
let positions;
let targets;
let tl;
let rotationTween;

function refreshParticles() {
  if (tl) tl.kill();
  if (rotationTween) rotationTween.kill();
  particleSettings = computeParticleSettings();
  buildParticles();
  targets = computeTargets();
  startSequence();
  startRotation();
}

function buildParticles() {
  if (pointsMesh) {
    scene.remove(pointsMesh);
    pointsMesh.geometry.dispose();
    pointsMesh.material.dispose();
  }

  particlesVerts.length = 0;
  currentParticleCount = particleSettings.count;

  for (let i = 0; i < currentParticleCount; i++) {
    const vx = (Math.random() - 0.5) * window.innerWidth;
    const vy = (Math.random() - 0.5) * window.innerHeight;
    const vz = (Math.random() - 0.5) * 400;
    particlesVerts.push(new THREE.Vector3(vx, vy, vz));
  }

  positions = new Float32Array(currentParticleCount * 3);
  for (let i = 0; i < currentParticleCount; i++) {
    positions[i * 3] = particlesVerts[i].x;
    positions[i * 3 + 1] = particlesVerts[i].y;
    positions[i * 3 + 2] = particlesVerts[i].z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: particleSettings.size,
    color: COLOR,
    transparent: true,
    opacity: prefersReducedMotion ? 0.6 : 0.9,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });

  pointsMesh = new THREE.Points(geometry, material);
  scene.add(pointsMesh);
}

function sampleTextPoints(text, w, h, step = 4, fontScale = 0.6) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  octx.clearRect(0, 0, w, h);
  octx.fillStyle = '#fff';
  const fontSize = Math.floor(h * fontScale);
  octx.font = `bold ${fontSize}px "Cairo", "Segoe UI", sans-serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillText(text, w / 2, h / 2);
  const img = octx.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      if (img[idx + 3] > 150) pts.push({ x: x - w / 2, y: h / 2 - y });
    }
  }
  return pts;
}

function sampleHeartPoints(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push({ x, y });
  }
  return pts;
}

function computeTargets() {
  const heartRaw = sampleHeartPoints(currentParticleCount);

  let scaleBase = Math.min(window.innerWidth, window.innerHeight);
  let scaleFactor = 1.3;
  if (window.innerWidth < 600) scaleFactor = 0.6;
  else if (window.innerWidth < 1000) scaleFactor = 0.9;

  const scale = (scaleBase / 36) * scaleFactor * 0.8;

  const heartTargets = heartRaw.map((p) => new THREE.Vector3(p.x * scale, p.y * scale - 100, (Math.random() - 0.5) * 80));

  const nameW = Math.max(380, Math.floor(window.innerWidth * 0.7));
  let nameH = Math.max(120, Math.floor(window.innerHeight * 0.18));
  const phraseW = Math.max(500, Math.floor(window.innerWidth * 0.9));
  let phraseH = Math.max(120, Math.floor(window.innerHeight * 0.18));

  if (window.innerWidth < 800) {
    nameH *= 0.6;
    phraseH *= 0.6;
  }

  const nameRaw = sampleTextPoints('Sereen', nameW, nameH, 4, 0.72);
  const messageRaw = sampleTextPoints('You are the light', phraseW, phraseH, 4, 0.5);

  const nameTargets = nameRaw.map((r) => new THREE.Vector3(r.x, r.y - 40, (Math.random() - 0.5) * 40));
  const messageTargets = messageRaw.map((r) => new THREE.Vector3(r.x, r.y - 25, (Math.random() - 0.5) * 40));

  return { heartTargets, nameTargets, messageTargets };
}

function startSequence() {
  if (tl) tl.kill();
  tl = gsap.timeline({ repeat: -1, repeatDelay: scaledDuration(0.9) });

  tl.to(particlesVerts, {
    duration: scaledDuration(1.2),
    ease: 'power1.out',
    onStart: () => {
      for (let v of particlesVerts) {
        v.x = (Math.random() - 0.5) * window.innerWidth;
        v.y = (Math.random() - 0.5) * window.innerHeight;
        v.z = (Math.random() - 0.5) * 400;
      }
    },
    onUpdate: updatePositions
  });

  tl.to({}, { duration: scaledDuration(0.6) });

  tl.to(particlesVerts, {
    duration: scaledDuration(3),
    ease: 'power2.inOut',
    onStart: () => {
      for (let i = 0; i < currentParticleCount; i++) {
        particlesVerts[i].target = targets.heartTargets[i % targets.heartTargets.length];
      }
    },
    onUpdate: moveToTargets
  });

  tl.to({}, { duration: scaledDuration(1) });

  tl.to(particlesVerts, {
    duration: scaledDuration(0.6),
    ease: 'power2.out',
    onStart: () => {
      for (let v of particlesVerts) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * 400;
        v.target = new THREE.Vector3(v.x + Math.cos(ang) * dist, v.y + Math.sin(ang) * dist, (Math.random() - 0.5) * 600);
      }
    },
    onUpdate: moveToTargets
  });

  tl.to({}, { duration: scaledDuration(0.5) });

  tl.to(particlesVerts, {
    duration: scaledDuration(2.4),
    ease: 'power2.inOut',
    onStart: () => {
      for (let i = 0; i < currentParticleCount; i++) {
        const t = targets.nameTargets[i % targets.nameTargets.length];
        particlesVerts[i].target = new THREE.Vector3(t.x, t.y - 60, t.z);
      }
    },
    onUpdate: moveToTargets
  });

  tl.to({}, { duration: scaledDuration(1) });

  tl.to(particlesVerts, {
    duration: scaledDuration(2.6),
    ease: 'power2.inOut',
    onStart: () => {
      for (let i = 0; i < currentParticleCount; i++) {
        const pt = targets.messageTargets[i % targets.messageTargets.length];
        particlesVerts[i].target = new THREE.Vector3(pt.x + 120, pt.y - 50, pt.z);
      }
    },
    onUpdate: moveToTargets
  });

  tl.to({}, { duration: scaledDuration(1.6) });
}

function moveToTargets() {
  for (let i = 0; i < currentParticleCount; i++) {
    const v = particlesVerts[i];
    if (!v.target) continue;
    v.x += (v.target.x - v.x) * 0.08;
    v.y += (v.target.y - v.y) * 0.08;
    v.z += (v.target.z - v.z) * 0.08;
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }
  pointsMesh.geometry.attributes.position.needsUpdate = true;
}

function updatePositions() {
  for (let i = 0; i < currentParticleCount; i++) {
    positions[i * 3] = particlesVerts[i].x;
    positions[i * 3 + 1] = particlesVerts[i].y;
    positions[i * 3 + 2] = particlesVerts[i].z;
  }
  pointsMesh.geometry.attributes.position.needsUpdate = true;
}

function startRotation() {
  rotationTween = gsap.to(scene.rotation, {
    y: 0.35,
    duration: scaledDuration(6),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  refreshParticles();
}

window.addEventListener('resize', handleResize);

if (heroCard) requestAnimationFrame(() => heroCard.classList.add('is-visible'));

startQuoteSequence();
refreshParticles();
animate();
