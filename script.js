document.addEventListener('DOMContentLoaded', () => {
    
    // 1. PRELOADER
    const lights = document.querySelectorAll('.light');
    const preloader = document.getElementById('preloader');
    let lightIndex = 0;
    
    function startSequence() {
        if (lightIndex < 5) {
            lights[lightIndex].classList.add('active');
            lightIndex++;
            setTimeout(startSequence, 800); 
        } else {
            setTimeout(lightsOut, 1500);
        }
    }
    function lightsOut() {
        lights.forEach(l => l.classList.remove('active'));
        setTimeout(() => {
            if(preloader) preloader.style.transform = "translateY(-100%)";
            setTimeout(drawRadarChart, 500);
        }, 500);
    }
    startSequence();

    // 2. RADAR CHART
    function drawRadarChart() {
        const canvas = document.getElementById('radarChart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 120;
        const data = { 'JAVA': 0.95, 'SPRING': 0.9, 'PYTHON': 0.85, 'SQL': 0.8, 'JS': 0.75, 'AI/ML': 0.8 };
        const keys = Object.keys(data);
        const values = Object.values(data);
        const count = keys.length;
        const angleStep = (Math.PI * 2) / count;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        
        // Grid
        for (let r = 0.2; r <= 1; r += 0.2) {
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (radius * r);
                const y = centerY + Math.sin(angle) * (radius * r);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
        }

        // Data
        ctx.beginPath();
        const finalPoints = [];
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const value = values[i];
            const x = centerX + Math.cos(angle) * (radius * value);
            const y = centerY + Math.sin(angle) * (radius * value);
            finalPoints.push({x, y});
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)'; ctx.fill();
        ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.stroke();

        // Labels
        ctx.fillStyle = '#fff'; ctx.font = '12px JetBrains Mono'; ctx.textAlign = 'center';
        finalPoints.forEach((point, i) => {
            ctx.beginPath(); ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff'; ctx.fill();
            const angle = i * angleStep - Math.PI / 2;
            const labelX = centerX + Math.cos(angle) * (radius + 25);
            const labelY = centerY + Math.sin(angle) * (radius + 25);
            ctx.fillStyle = '#888'; ctx.fillText(keys[i], labelX, labelY);
        });
    }

    // 3. AUDIO ENGINE (SUBTLE)
    const audioBtn = document.getElementById('audio-btn');
    let audioCtx; let oscillator; let gainNode; let isEngineOn = false;

    if(audioBtn) audioBtn.addEventListener('click', toggleEngine);

    function toggleEngine() {
        if (!isEngineOn) {
            initAudio();
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>ENGINE ON</span>';
            audioBtn.classList.add('active');
            isEngineOn = true;
        } else {
            if (audioCtx) { audioCtx.close(); audioCtx = null; }
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>ENGINE OFF</span>';
            audioBtn.classList.remove('active');
            isEngineOn = false;
        }
    }

    function initAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        // SUBTLE AUDIO SETTINGS
        oscillator.type = 'triangle'; // Softer than sine
        oscillator.frequency.value = 60; // 60Hz Sub-bass rumble
        
        // VOLUME: 0.8% (Barely there)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 2); 

        oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
        oscillator.start();

        window.addEventListener('scroll', () => {
            if (isEngineOn && audioCtx && audioCtx.state === 'running') {
                const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                // Pitch shift 60Hz -> 90Hz (Very subtle rev)
                const newFreq = 60 + (scrollPct * 30); 
                oscillator.frequency.setTargetAtTime(newFreq, audioCtx.currentTime, 0.2);
            }
        });
    }

    // Blips (Slightly quieter too)
    const interactiveElements = document.querySelectorAll('a, button, .bento-card, .lap-row');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isEngineOn && audioCtx && audioCtx.state === 'running') playBlip();
        });
    });

    function playBlip() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // 2% volume
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); 
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }

    // 4. UX (LENIS & CURSOR)
    const lenis = new Lenis({
        duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical', smooth: true, mouseMultiplier: 1, smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0; let mouseY = 0; let outlineX = 0; let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if(cursorDot) { cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`; }
        const hoveredEl = document.elementFromPoint(mouseX, mouseY);
        const isClickable = hoveredEl?.closest('a, button, input, textarea, .bento-card');
        if (isClickable) document.body.classList.add('hovering');
        else document.body.classList.remove('hovering');
    });

    function animateCursor() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        if(cursorOutline) { cursorOutline.style.left = `${outlineX}px`; cursorOutline.style.top = `${outlineY}px`; }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#$";
    document.querySelectorAll("h1, h2, h3, .nav-items a").forEach(target => {
        if(!target.dataset.value) target.dataset.value = target.innerText;
        target.addEventListener("mouseover", event => {
            let iteration = 0;
            clearInterval(event.target.interval);
            event.target.interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                    .split("").map((letter, index) => {
                        if(index < iteration) return event.target.dataset.value[index];
                        return letters[Math.floor(Math.random() * 26)];
                    }).join("");
                if(iteration >= event.target.dataset.value.length) clearInterval(event.target.interval);
                iteration += 1 / 3;
            }, 30);
        });
    });

    // 5. MOBILE & ANIMATIONS
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if(menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark');
                if (isEngineOn && audioCtx) playBlip();
            } else {
                icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
            }
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuBtn.querySelector('i').classList.add('fa-bars');
                menuBtn.querySelector('i').classList.remove('fa-xmark');
            });
        });
    }

    const skillSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.rpm-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => {
                    const targetWidth = bar.style.width;
                    bar.style.width = '0%'; 
                    setTimeout(() => { bar.style.width = targetWidth; }, 100);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    if (skillSection) skillObserver.observe(skillSection);
});