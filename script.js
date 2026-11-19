/* ========================================
   PARTICLE BACKGROUND
   ======================================== */
(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animId = requestAnimationFrame(animate);
  }

  init();
  animate();

  // Reinitialize on significant resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 300);
  });
})();

/* ========================================
   NAVIGATION
   ======================================== */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Scroll state
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close menu on link click
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Active nav highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}
window.addEventListener('scroll', highlightNav);

/* ========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ======================================== */
const animEls = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay) || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

animEls.forEach(el => observer.observe(el));

/* ========================================
   TERMINAL TYPING EFFECT
   ======================================== */
const typedEl = document.getElementById('typedText');
const outputEl = document.getElementById('termOutput');

const commands = [
  {
    cmd: 'cat profile.json',
    output: `{
  <span class="output-key">"name"</span>: <span class="output-str">"Kasi Naga Sai Lakshmi Borra"</span>,
  <span class="output-key">"role"</span>: <span class="output-str">"Software Developer"</span>,
  <span class="output-key">"focus"</span>: <span class="output-arr">["Python", "AI/ML", "Backend"]</span>,
  <span class="output-key">"status"</span>: <span class="output-str">"Open to opportunities"</span>,
  <span class="output-key">"location"</span>: <span class="output-str">"India 🇮🇳"</span>
}`
  },
  {
    cmd: 'ls projects/',
    output: `<span class="output-str">codeguard-ai/</span>        <span class="output-val">AI code review platform</span>
<span class="output-str">ai-monitoring/</span>       <span class="output-val">Classroom attention CV</span>
<span class="output-str">paypilot-ai/</span>         <span class="output-val">Fintech payment app</span>`
  },
  {
    cmd: 'echo $SKILLS',
    output: `<span class="output-arr">Python · FastAPI · React · TypeScript · PostgreSQL
OpenCV · MediaPipe · LangChain · Docker · Git</span>`
  }
];

let cmdIndex = 0;
let charIndex = 0;
let isTyping = false;

function typeCommand() {
  if (isTyping) return;
  isTyping = true;

  const { cmd, output } = commands[cmdIndex];
  typedEl.textContent = '';
  outputEl.innerHTML = '';

  function typeChar() {
    if (charIndex < cmd.length) {
      typedEl.textContent += cmd[charIndex];
      charIndex++;
      setTimeout(typeChar, 40 + Math.random() * 40);
    } else {
      // Show output after typing
      setTimeout(() => {
        outputEl.innerHTML = `<pre>${output}</pre>`;
        charIndex = 0;
        isTyping = false;

        // Next command after pause
        setTimeout(() => {
          cmdIndex = (cmdIndex + 1) % commands.length;
          typeCommand();
        }, 3500);
      }, 400);
    }
  }

  typeChar();
}

// Start typing after a short delay
setTimeout(typeCommand, 1200);

/* ========================================
   FOOTER YEAR
   ======================================== */
document.getElementById('year').textContent = new Date().getFullYear();
