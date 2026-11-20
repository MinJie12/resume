(function () {
  var dutyDetails = Array.prototype.slice.call(document.querySelectorAll('.duties'));
  var toggleButton = document.getElementById('toggleDetails');
  var printButton = document.getElementById('printBtn');
  var toTopButton = document.getElementById('toTop');
  var year = document.getElementById('year');
  var savedPrintStates = null;

  function updateToggleLabel() {
    if (!toggleButton) return;
    var allOpen = dutyDetails.every(function (detail) {
      return detail.open;
    });
    toggleButton.textContent = allOpen ? '收起全部职责' : '展开全部职责';
    toggleButton.setAttribute('aria-expanded', String(allOpen));
  }

  if (toggleButton) {
    toggleButton.addEventListener('click', function () {
      var allOpen = dutyDetails.every(function (detail) {
        return detail.open;
      });
      dutyDetails.forEach(function (detail) {
        detail.open = !allOpen;
      });
      updateToggleLabel();
    });
  }

  dutyDetails.forEach(function (detail) {
    detail.addEventListener('toggle', updateToggleLabel);
  });

  function preparePrint() {
    if (savedPrintStates) return;
    savedPrintStates = dutyDetails.map(function (detail) {
      return detail.open;
    });
    dutyDetails.forEach(function (detail) {
      detail.open = true;
    });
  }

  function restoreAfterPrint() {
    if (!savedPrintStates) return;
    dutyDetails.forEach(function (detail, index) {
      detail.open = Boolean(savedPrintStates[index]);
    });
    savedPrintStates = null;
    updateToggleLabel();
  }

  if (printButton) {
    printButton.addEventListener('click', function () {
      preparePrint();
      window.print();
      window.setTimeout(restoreAfterPrint, 800);
    });
  }

  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', restoreAfterPrint);

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function setActiveSection() {
    var current = null;
    var offset = 120;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= offset) {
        current = section.id;
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setActiveSection();
      if (toTopButton) {
        toTopButton.classList.toggle('show', window.scrollY > 640);
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  setActiveSection();
  onScroll();

  if (toTopButton) {
    toTopButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('resume-theme', theme);
    } catch (error) {
      /* localStorage unavailable */
    }
    if (themeIcon) {
      var moon = themeIcon.querySelector('.moon');
      var sun = themeIcon.querySelector('.sun');
      if (moon) moon.style.display = theme === 'dark' ? 'block' : 'none';
      if (sun) sun.style.display = theme === 'light' ? 'block' : 'none';
    }
  }

  function currentTheme() {
    var stored = null;
    try {
      stored = window.localStorage.getItem('resume-theme');
    } catch (error) {
      stored = null;
    }
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

  var canvas = document.getElementById('particleCanvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var particleLoopHandle = null;
  var particleReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paintParticles() {
    if (!ctx || !canvas) return;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    var count = Math.min(140, Math.max(40, Math.floor((width * height) / 14000)));
    particles = [];
    var colors = ['#8fe8c4', '#00f2ff', '#cec4ef'];
    for (var i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00028 + Math.random() * 0.00042
      });
    }
  }

  function drawParticles() {
    if (!ctx || !canvas) return;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (!width || !height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    var t = Date.now() / 1000;
    var count = particles.length;
    for (var i = 0; i < count; i += 1) {
      var p = particles[i];
      p.x = (p.x + p.vx + Math.sin(t * p.speed + p.phase) * 0.22) % (width + 20) - 10;
      p.y = (p.y + Math.cos(t * p.speed * 0.9 + p.phase) * 0.22) % (height + 20) - 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      for (var j = i + 1; j < count; j += 1) {
        var q = particles[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(143, 232, 194, ' + (0.12 * (1 - dist / 130)) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function startParticleLoop() {
    if (particleLoopHandle) return;
    var loop = function () {
      drawParticles();
      particleLoopHandle = window.requestAnimationFrame(loop);
    };
    particleLoopHandle = window.requestAnimationFrame(loop);
  }

  function stopParticleLoop() {
    if (particleLoopHandle) {
      window.cancelAnimationFrame(particleLoopHandle);
      particleLoopHandle = null;
    }
  }

  if (canvas) {
    paintParticles();
    if (particleReduced) {
      drawParticles();
    } else {
      startParticleLoop();
    }
    window.addEventListener('resize', function () {
      paintParticles();
      if (!particleReduced) {
        stopParticleLoop();
        startParticleLoop();
      }
    });
  }

  applyTheme(currentTheme());

  updateToggleLabel();
})();
