const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const maxParticles = 60;

// Resize canvas to fill container
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const mouse = {
  x: null,
  y: null,
  radius: 80
};

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Spawn explosive burst of particles
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(clickX, clickY, true));
  }
});

class Particle {
  constructor(x, y, isExplosion = false) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;
    
    const speedMultiplier = isExplosion ? 3 : 1;
    this.vx = (Math.random() - 0.5) * 2 * speedMultiplier;
    this.vy = (Math.random() - 0.5) * 2 * speedMultiplier;
    
    this.radius = Math.random() * 3 + (isExplosion ? 1.5 : 1);
    this.baseRadius = this.radius;
    this.color = `hsla(${Math.random() * 40 + 190}, 90%, 65%, ${isExplosion ? '0.9' : '0.6'})`;
    this.alpha = 1;
    this.decay = isExplosion ? Math.random() * 0.02 + 0.01 : 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls if not part of an explosion decay
    if (this.decay === 0) {
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    } else {
      this.alpha -= this.decay;
    }

    // Interactive cursor push
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * 3;
        this.y += Math.sin(angle) * force * 3;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.decay > 0 ? Math.max(0, this.alpha) : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// Initial spawn
for (let i = 0; i < maxParticles; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Keep base particles populated
  const activeExplosions = particles.filter(p => p.decay > 0 && p.alpha > 0);
  const baseParticles = particles.filter(p => p.decay === 0);
  
  while (baseParticles.length < maxParticles) {
    baseParticles.push(new Particle());
  }
  
  particles = [...baseParticles, ...activeExplosions];

  particles.forEach((p, index) => {
    p.update();
    p.draw();
  });
  
  requestAnimationFrame(animate);
}

animate();
