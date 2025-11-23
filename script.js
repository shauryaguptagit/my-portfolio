document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. F1 START SEQUENCE (PRELOADER)
    // ==========================================
    const lights = document.querySelectorAll('.light');
    const preloader = document.getElementById('preloader');
    
    let lightIndex = 0;
    
    function startSequence() {
        if (lightIndex < 5) {
            lights[lightIndex].classList.add('active');
            lightIndex++;
            setTimeout(startSequence, 800); // 800ms between lights
        } else {
            setTimeout(lightsOut, 1500); // Wait 1.5s before lights out
        }
    }

    function lightsOut() {
        // Turn off all lights
        lights.forEach(l => l.classList.remove('active'));
        
        // Fly up animation
        setTimeout(() => {
            if(preloader) preloader.style.transform = "translateY(-100%)";
            // Trigger Chart Animation after site is revealed
            setTimeout(drawRadarChart, 500);
        }, 500);
    }
    
    // Start the sequence immediately
    startSequence();


    // ==========================================
    // 2. VANILLA JS RADAR CHART (CANVAS)
    // ==========================================
    function drawRadarChart() {
        const canvas = document.getElementById('radarChart');
        if(!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 120;

        // Skill Data (0.0 to 1.0)
        const data = {
            'JAVA': 0.95,
            'SPRING': 0.9,
            'PYTHON': 0.85,
            'SQL': 0.8,
            'JS': 0.75,
            'AI/ML': 0.8
        };
        const keys = Object.keys(data);
        const values = Object.values(data);
        const count = keys.length;
        const angleStep = (Math.PI * 2) / count;

        ctx.clearRect(0, 0, width, height);

        // A. Draw Background Hexagons (Grid)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        for (let r = 0.2; r <= 1; r += 0.2) {
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const angle = i * angleStep - Math.PI / 2; // Rotate to start at top
                const x = centerX + Math.cos(angle) * (radius * r);
                const y = centerY + Math.sin(angle) * (radius * r);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // B. Draw The Data Shape
        ctx.beginPath();
        const finalPoints = [];
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const value = values[i];
            const x = centerX + Math.cos(angle) * (radius * value);
            const y = centerY + Math.sin(angle) * (radius * value);
            finalPoints.push({x, y});
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Fill Style (Cyan Glow)
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // C. Draw Labels & Points
        ctx.fillStyle = '#fff';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';

        finalPoints.forEach((point, i) => {
            // Draw Dots
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff';
            ctx.fill();

            // Draw Text
            const angle = i * angleStep - Math.PI / 2;
            const labelX = centerX + Math.cos(angle) * (radius + 25);
            const labelY = centerY + Math.sin(angle) * (radius + 25);
            ctx.fillStyle = '#888';
            ctx.fillText(keys[i], labelX, labelY);
        });
    }


    // ==========================================
    // 3. AUDIO ENGINE (ELECTRIC TUNED)
    // ==========================================
    const audioBtn = document.getElementById('audio-btn');
    let audioCtx;
    let oscillator;
    let gainNode;
    let isEngineOn = false;

    if(audioBtn) {
        audioBtn.addEventListener('click', toggleEngine);
    }

    function toggleEngine() {
        if (!isEngineOn) {
            // Start Engine
            initAudio();
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>ENGINE ON</span>';
            audioBtn.classList.add('active');
            isEngineOn = true;
        } else {
            // Stop Engine
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>ENGINE OFF</span>';
            audioBtn.classList.remove('active');
            isEngineOn = false;
        }
    }

    function initAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Create Nodes
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        // --- NEW TUNING: ELECTRIC PRECISION ---
        oscillator.type = 'sine'; // Smooth and round (no buzz)
        oscillator.frequency.value = 120; // 120Hz = Pleasant low-mid hum
        
        // --- VOLUME: WHISPER QUIET ---
        // Ramp volume up smoothly to avoid clicking
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 1); 
        // 0.02 is 2% volume - very subtle background presence

        // Connect
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();

        // --- SMOOTHER ACCELERATION ON SCROLL ---
        window.addEventListener('scroll', () => {
            if (isEngineOn && audioCtx && audioCtx.state === 'running') {
                const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                
                // Map scroll to pitch: 120Hz -> 240Hz (One octave up)
                const newFreq = 120 + (scrollPct * 120); 
                
                // Use 'exponentialRamp' for a smooth, organic pitch glide
                oscillator.frequency.setTargetAtTime(newFreq, audioCtx.currentTime, 0.2);
            }
        });
    }

    // --- INTERACTION SOUNDS (TELEMETRY BLIPS) ---
    // Plays a futuristic chirp on hover
    const interactiveElements = document.querySelectorAll('a, button, .bento-card, .lap-row');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isEngineOn && audioCtx && audioCtx.state === 'running') {
                playBlip();
            }
        });
    });

    function playBlip() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        // Start high (800Hz) and drop quickly to 400Hz
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1); 
        
        // Short, sharp burst
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); 
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1); // Stop after 0.1 seconds
    }


    // ==========================================
    // 4. SCROLL ANIMATION FOR SKILL BARS
    // ==========================================
    const skillSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.rpm-fill');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal bars
                progressBars.forEach(bar => {
                    // Reset to 0 first to force animation
                    const targetWidth = bar.style.width;
                    bar.style.width = '0%'; 
                    setTimeout(() => {
                        bar.style.width = targetWidth;
                    }, 100);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% visible

    if (skillSection) {
        skillObserver.observe(skillSection);
    }
});