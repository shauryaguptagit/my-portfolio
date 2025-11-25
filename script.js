document.addEventListener('DOMContentLoaded', () => {
    
    const lights = document.querySelectorAll('.light');
    const preloader = document.getElementById('preloader');
    let lightIndex = 0;
    
    function startSequence() {
        if (lightIndex < 5) {
            lights[lightIndex].classList.add('active');
            lightIndex++;
            setTimeout(startSequence, 600); 
        } else {
            setTimeout(lightsOut, 1000);
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

    // --- CHART LOGIC WITH THEME SUPPORT ---
    function drawRadarChart() {
        const canvas = document.getElementById('radarChart');
        if(!canvas) return;
        
        // Fetch current theme colors from CSS variables
        const styles = getComputedStyle(document.body);
        const gridColor = styles.getPropertyValue('--chart-grid').trim();
        const textColor = styles.getPropertyValue('--chart-text').trim();
        const accentColor = styles.getPropertyValue('--f1-cyan').trim();
        
        // Make canvas DPI crisp
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr); // Normalize scale
        
        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3; 

        const data = { 'JAVA': 0.95, 'SPRING': 0.9, 'PYTHON': 0.85, 'SQL': 0.8, 'JS': 0.75, 'AI/ML': 0.8 };
        const keys = Object.keys(data);
        const values = Object.values(data);
        const count = keys.length;
        const angleStep = (Math.PI * 2) / count;

        ctx.clearRect(0, 0, width, height);
        
        // Draw Grid with Theme Color
        ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
        
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

        // Draw Data Shape
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
        
        // Dynamic Fill Color based on accent
        // Parse hex to rgba for transparency
        ctx.fillStyle = hexToRgba(accentColor, 0.2); 
        ctx.fill();
        ctx.strokeStyle = accentColor; ctx.lineWidth = 2; ctx.stroke();

        // Draw Labels
        ctx.fillStyle = '#fff'; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'center';
        finalPoints.forEach((point, i) => {
            ctx.beginPath(); ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = accentColor; ctx.fill();
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 25; 
            const labelX = centerX + Math.cos(angle) * labelRadius;
            const labelY = centerY + Math.sin(angle) * labelRadius;
            ctx.fillStyle = textColor; ctx.fillText(keys[i], labelX, labelY);
        });
    }

    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6];
        }
        return "rgba(" + +r + "," + +g + "," + +b + "," + alpha + ")";
    }

    // Redraw chart on resize
    window.addEventListener('resize', drawRadarChart);


    // --- THEME TOGGLE LOGIC ---
    const themeBtn = document.getElementById('theme-btn');
    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeBtn.querySelector('i');
            
            if(document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            // Redraw chart to match new theme colors
            drawRadarChart();
            if (isEngineOn && audioCtx) playBlip();
        });
    }


    // --- AUDIO ENGINE ---
    const audioBtn = document.getElementById('audio-btn');
    let audioCtx; let oscillator; let gainNode; let isEngineOn = false;

    if(audioBtn) audioBtn.addEventListener('click', toggleEngine);

    function toggleEngine() {
        if (!isEngineOn) {
            initAudio();
            const span = audioBtn.querySelector('span');
            if(span) span.innerText = "ENGINE ON";
            audioBtn.querySelector('i').className = "fa-solid fa-volume-high";
            audioBtn.classList.add('active');
            isEngineOn = true;
        } else {
            if (audioCtx) { audioCtx.close(); audioCtx = null; }
            const span = audioBtn.querySelector('span');
            if(span) span.innerText = "ENGINE OFF";
            audioBtn.querySelector('i').className = "fa-solid fa-volume-xmark";
            audioBtn.classList.remove('active');
            isEngineOn = false;
        }
    }

    function initAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'triangle'; 
        oscillator.frequency.value = 60; 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 2); 

        oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
        oscillator.start();

        window.addEventListener('scroll', () => {
            if (isEngineOn && audioCtx && audioCtx.state === 'running') {
                const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                const newFreq = 60 + (scrollPct * 30); 
                oscillator.frequency.setTargetAtTime(newFreq, audioCtx.currentTime, 0.2);
            }
        });
    }

    const interactiveElements = document.querySelectorAll('a, button, .bento-card, .lap-row, .theme-control');
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
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); 
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }

    const lenis = new Lenis({
        duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical', smooth: true, mouseMultiplier: 1, smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0; let mouseY = 0; let outlineX = 0; let outlineY = 0;

    if(cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
            
            const hoveredEl = document.elementFromPoint(mouseX, mouseY);
            const isClickable = hoveredEl?.closest('a, button, input, textarea, .bento-card, .control-btn');
            if (isClickable) document.body.classList.add('hovering');
            else document.body.classList.remove('hovering');
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.2; 
            outlineY += (mouseY - outlineY) * 0.2;
            cursorOutline.style.left = `${outlineX}px`; cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#$";
    
    // CHANGED: Target .hack-text class to preserve <br> in headers
    document.querySelectorAll(".hack-text").forEach(target => {
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
                
                iteration += 1 / 2; 
            }, 20); 
        });
    });

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