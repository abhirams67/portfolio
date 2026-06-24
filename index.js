/* ==========================================================================
   MILES MORALES SUIT HUD LOGIC & INTERACTION (index.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILITIES & CONFIG ---
    let systemStartTime = Date.now();
    setInterval(updateSystemTimer, 1000);

    function updateSystemTimer() {
        const diff = Date.now() - systemStartTime;
        const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        const timerElem = document.getElementById('telemetry-timer');
        if (timerElem) {
            timerElem.textContent = `SYSTEM UP: ${hrs}:${mins}:${secs}`;
        }
    }

    // --- CUSTOM CURSOR & DUST TRAIL ---
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let cursorDotX = 0, cursorDotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Spawn particle trail
        if (Math.random() < 0.15) {
            createCursorTrailParticle(mouseX, mouseY);
        }
    });

    // Lerp cursor movement for smoothness
    function animateCursor() {
        // Outer ring Lerp (slightly slower for drag effect)
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        // Center dot Lerp (faster)
        cursorDotX += (mouseX - cursorDotX) * 0.35;
        cursorDotY += (mouseY - cursorDotY) * 0.35;

        if (cursor) {
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }
        if (cursorDot) {
            cursorDot.style.left = `${cursorDotX}px`;
            cursorDot.style.top = `${cursorDotY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover listeners for cursor
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .skill-card, .mission-card, .color-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('cursor-hovering');
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('cursor-hovering');
        });
    });

    // Particle Trail Generator
    function createCursorTrailParticle(x, y) {
        const p = document.createElement('div');
        p.className = 'trail-particle';
        document.body.appendChild(p);
        
        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        
        const isRed = Math.random() > 0.4;
        p.style.backgroundColor = isRed ? 'var(--spider-red)' : 'var(--venom-yellow)';
        p.style.boxShadow = isRed ? '0 0 6px var(--spider-red-glow)' : '0 0 6px var(--venom-glow)';
        p.style.position = 'fixed';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '9998';
        p.style.borderRadius = '50%';
        p.style.transform = 'translate(-50%, -50%)';
        p.style.opacity = '0.8';
        
        // Animation path
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        let op = 0.8;
        let px = x;
        let py = y;
        
        const pAnim = setInterval(() => {
            op -= 0.05;
            px += velocityX;
            py += velocityY;
            p.style.opacity = op;
            p.style.left = `${px}px`;
            p.style.top = `${py}px`;
            
            if (op <= 0) {
                clearInterval(pAnim);
                p.remove();
            }
        }, 30);
    }


    // --- BACKGROUND CANVAS PARTICLES (SPIDER NODES) ---
    const bgCanvas = document.getElementById('bg-particles');
    const bgCtx = bgCanvas.getContext('2d');
    let particles = [];
    const maxParticles = 60;

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();

    // Particle Class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1;
            this.color = Math.random() > 0.3 ? '#ff0044' : '#ffe600';
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > bgCanvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > bgCanvas.height) this.vy *= -1;
        }

        draw() {
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            bgCtx.fillStyle = this.color;
            bgCtx.globalAlpha = this.opacity;
            bgCtx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Connect nodes in proximity (Spider Web effect)
    function drawWebLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    bgCtx.beginPath();
                    bgCtx.moveTo(particles[i].x, particles[i].y);
                    bgCtx.lineTo(particles[j].x, particles[j].y);
                    const isCamo = document.body.classList.contains('camo-active');
                    
                    if (isCamo) {
                        bgCtx.strokeStyle = 'rgba(0, 255, 204, 0.08)';
                    } else {
                        // Blend line color based on particle colors
                        bgCtx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - dist / 120)})`;
                    }
                    bgCtx.lineWidth = 0.5;
                    bgCtx.stroke();
                }
            }
        }
    }

    function animateBgParticles() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawWebLines();
        bgCtx.globalAlpha = 1.0;
        requestAnimationFrame(animateBgParticles);
    }
    animateBgParticles();


    // --- ACTIVE CAMOUFLAGE MODE ---
    const camoBtn = document.getElementById('camouflage-btn');
    if (camoBtn) {
        camoBtn.addEventListener('click', () => {
            const isCamo = document.body.classList.toggle('camo-active');
            
            // UI text switch
            const spanText = camoBtn.querySelector('span');
            const icon = camoBtn.querySelector('i');
            
            if (isCamo) {
                if (spanText) spanText.textContent = 'STEALTH';
                if (icon) icon.className = 'fa-solid fa-eye-slash';
                // Trigger a glitched flicker sound using Synth
                playFlickerSynthSound();
            } else {
                if (spanText) spanText.textContent = 'CAMO';
                if (icon) icon.className = 'fa-solid fa-ghost';
                playFlickerSynthSound(440, 220);
            }
        });
    }


    // --- BROOKLYN BEATS (WEB AUDIO SYNTHESIZER LOFI MUSIC) ---
    // A fully synthesized lofi beat looping in the browser
    let audioCtx = null;
    let synthInterval = null;
    let isPlaying = false;
    
    // Beats track options
    const tracks = [
        { title: "What's Up Danger - Chill Synth", tempo: 78, prog: [[50, 57, 60, 64], [46, 53, 57, 60], [48, 55, 59, 62], [45, 52, 55, 59]] },
        { title: "Sunflower - Lofi Sunset", tempo: 82, prog: [[53, 60, 64, 67], [48, 55, 59, 62], [50, 57, 60, 64], [47, 54, 57, 60]] },
        { title: "Brooklyn Rooftops - Chillhop Beat", tempo: 75, prog: [[48, 55, 59, 62], [43, 50, 54, 57], [45, 52, 55, 59], [40, 47, 51, 54]] }
    ];
    let currentTrackIdx = 0;
    let stepCount = 0;
    
    // Nodes
    let masterGain = null;
    let analyser = null;
    
    // Visualizer Canvas setup
    const playerCanvas = document.getElementById('player-visualizer');
    const pCtx = playerCanvas ? playerCanvas.getContext('2d') : null;
    let dataArray = [];
    
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('play-prev');
    const nextBtn = document.getElementById('play-next');
    const volumeSlider = document.getElementById('volume-slider');
    const trackTitleElem = document.getElementById('track-title');
    const synthStatusElem = document.getElementById('synth-status');
    
    if (trackTitleElem) {
        trackTitleElem.textContent = tracks[currentTrackIdx].title;
    }

    // Sound generation helper for camo transitions
    function playFlickerSynthSound(startF = 220, endF = 880) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startF, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endF, audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.16);
    }

    function initAudio() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = volumeSlider ? parseFloat(volumeSlider.value) : 0.5;
        
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    function startBeat() {
        if (!audioCtx) initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        isPlaying = true;
        playPauseBtn.classList.add('playing');
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        if (synthStatusElem) synthStatusElem.textContent = "Synthesizer active: Playing Synth-Lofi loop";
        
        const track = tracks[currentTrackIdx];
        const stepTime = 60 / track.tempo / 2; // eighth notes
        
        let nextStepTime = audioCtx.currentTime;
        
        function scheduler() {
            while (nextStepTime < audioCtx.currentTime + 0.1) {
                scheduleStep(stepCount, nextStepTime);
                nextStepTime += stepTime;
                stepCount = (stepCount + 1) % 16;
            }
            synthInterval = setTimeout(scheduler, 25);
        }
        scheduler();
        animateVisualizer();
    }

    function stopBeat() {
        isPlaying = false;
        playPauseBtn.classList.remove('playing');
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (synthStatusElem) synthStatusElem.textContent = "Synthesizer paused";
        
        clearTimeout(synthInterval);
    }

    // Synthesize simple instruments
    function scheduleStep(step, time) {
        const track = tracks[currentTrackIdx];
        const chords = track.prog;
        const currentChord = chords[Math.floor(step / 4) % chords.length];
        
        // 1. Kick Drum (Step 0, 8, 10, 14)
        if (step === 0 || step === 8 || step === 10 || step === 12) {
            playKick(time);
        }
        
        // 2. Snare Drum (Step 4, 12)
        if (step === 4 || step === 12) {
            playSnare(time);
        }
        
        // 3. Hi-Hat (Every odd step)
        if (step % 2 === 1) {
            playHiHat(time);
        }

        // 4. Bass Line (Root note of current chord, triggers on step 0, 4, 8, 12)
        if (step % 4 === 0) {
            const rootMidi = currentChord[0];
            const rootFreq = midiToFreq(rootMidi - 12); // Octave lower
            playBass(rootFreq, time, stepTime() * 3.8);
        }

        // 5. Ambient Keyboard chords (Trigger on step 0, 4, 8, 12 with slight filter sweep)
        if (step % 8 === 0) {
            playChords(currentChord, time, stepTime() * 7.5);
        }

        // 6. Pluck / Melody (Randomized on steps 2, 6, 11, 14)
        if ((step === 2 || step === 6 || step === 11 || step === 14) && Math.random() > 0.3) {
            const noteMidi = currentChord[Math.floor(Math.random() * currentChord.length)] + 12; // Octave higher
            playMelody(midiToFreq(noteMidi), time);
        }
    }

    function stepTime() {
        return 60 / tracks[currentTrackIdx].tempo / 2;
    }

    function midiToFreq(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    // --- SYNTH INSTRUMENTS IMPLEMENTATIONS ---
    
    // Kick drum synthesis
    function playKick(time) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        osc.start(time);
        osc.stop(time + 0.13);
    }

    // Snare drum synthesis
    function playSnare(time) {
        // Create noise buffer for snare rattle
        const bufferSize = audioCtx.sampleRate * 0.15;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        
        // Noise filter
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        
        // Body oscillator
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 180;
        
        const gainNode = audioCtx.createGain();
        
        noiseNode.connect(filter);
        filter.connect(gainNode);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        gainNode.gain.setValueAtTime(0.35, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.14);
        
        noiseNode.start(time);
        noiseNode.stop(time + 0.15);
        
        osc.start(time);
        osc.stop(time + 0.15);
    }

    // Closed Hi-Hat synthesis
    function playHiHat(time) {
        // White noise hihat
        const bufferSize = audioCtx.sampleRate * 0.04;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7500;
        
        const gain = audioCtx.createGain();
        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        
        source.start(time);
        source.stop(time + 0.045);
    }

    // Bass synthesizer
    function playBass(freq, time, duration) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    // Soft Polyphonic Chords synthesizer
    function playChords(midiArr, time, duration) {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(900, time + duration * 0.5);
        filter.Q.value = 1.0;
        
        const chordGain = audioCtx.createGain();
        chordGain.connect(filter);
        filter.connect(masterGain);
        
        chordGain.gain.setValueAtTime(0.0, time);
        chordGain.gain.linearRampToValueAtTime(0.18, time + 0.1);
        chordGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        midiArr.forEach(midi => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = midiToFreq(midi);
            
            // Detune slightly for lofi chorus width
            osc.detune.value = (Math.random() - 0.5) * 15;
            
            osc.connect(chordGain);
            osc.start(time);
            osc.stop(time + duration);
        });
    }

    // Pluck melody synthesizer
    function playMelody(freq, time) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const delay = audioCtx.createDelay(0.3);
        const delayGain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        // Routing delay loop
        osc.connect(gain);
        gain.connect(masterGain);
        
        // Delay node
        gain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(masterGain);
        delayGain.connect(delay); // Feedback
        
        delay.delayTime.value = 0.22;
        delayGain.gain.value = 0.25; // Feedback gain
        
        gain.gain.setValueAtTime(0.16, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        
        osc.start(time);
        osc.stop(time + 0.38);
    }

    // Audio Controls Hooks
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                stopBeat();
            } else {
                startBeat();
            }
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            if (masterGain) {
                masterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
            trackTitleElem.textContent = tracks[currentTrackIdx].title;
            stepCount = 0;
            if (isPlaying) {
                stopBeat();
                startBeat();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
            trackTitleElem.textContent = tracks[currentTrackIdx].title;
            stepCount = 0;
            if (isPlaying) {
                stopBeat();
                startBeat();
            }
        });
    }

    // Visualizer Canvas Drawing
    function animateVisualizer() {
        if (!isPlaying || !pCtx) return;
        
        analyser.getByteFrequencyData(dataArray);
        pCtx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        pCtx.fillRect(0, 0, playerCanvas.width, playerCanvas.height);
        
        const barWidth = (playerCanvas.width / analyser.frequencyBinCount) * 1.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            barHeight = dataArray[i] / 2.4;
            
            const isCamo = document.body.classList.contains('camo-active');
            if (isCamo) {
                pCtx.fillStyle = `rgba(0, 255, 204, ${0.4 + (barHeight / 100)})`;
            } else {
                pCtx.fillStyle = i % 2 === 0 ? `rgba(255, 0, 68, ${0.4 + (barHeight / 100)})` : `rgba(255, 230, 0, ${0.4 + (barHeight / 100)})`;
            }
            
            pCtx.fillRect(x, playerCanvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
        
        requestAnimationFrame(animateVisualizer);
    }

    // Setup visualizer sizes
    if (playerCanvas) {
        playerCanvas.width = 80;
        playerCanvas.height = 80;
    }


    // --- DOSSIER TELEMETRY STATS BARS ANIMATION ---
    const telemetryBars = document.querySelectorAll('.stat-bar');
    const bioSection = document.getElementById('bio');
    
    // Store original width levels
    const origWidths = [];
    telemetryBars.forEach((bar) => {
        origWidths.push(bar.style.width);
        bar.style.width = '0%'; // Init empty
    });

    const observerOptions = {
        threshold: 0.25
    };

    const bioObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                telemetryBars.forEach((bar, idx) => {
                    setTimeout(() => {
                        bar.style.width = origWidths[idx];
                    }, idx * 150);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    if (bioSection) {
        bioObserver.observe(bioSection);
    }


    // --- SKILLS MODULES ELECTRIC GLOW TRIGGER ---
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const power = card.getAttribute('data-power');
            triggerSuitSpark(power);
        });
    });

    function triggerSuitSpark(power) {
        // Triggers a light click synth sound corresponding to charging skill nodes
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        let pitch = 880;
        if (power === 'venom') pitch = 988;
        if (power === 'camo') pitch = 1174;
        if (power === 'hud') pitch = 1318;
        
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, audioCtx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.09);
    }


    // --- MISSIONS BRIEFING DIALOG (MODALS) ---
    const missionBriefings = {
        roxxon: {
            code: "MISSION CODE: ROXXON-DEC",
            title: "Roxxon Core Decryptor",
            desc: "Successfully intercepted critical dark-web security traffic routing from Underground servers. Created a fully responsive decrypter terminal styled in retro-red. Integrated secure web sockets and localized cryptography using the Web Crypto API to ensure safe packet analysis.",
            metrics: [
                "De-routed over 4.2k mock packet packet streams",
                "Reduced processing decryption lag by 45ms",
                "100% test coverage using Jest mocks",
                "Shielded node API requests with OAuth webhooks"
            ],
            tags: ["React", "TailwindCSS", "Web Crypto API", "Docker", "Jest"],
            status: "CRITICAL SUCCESS"
        },
        tracer: {
            code: "MISSION CODE: TRACER-MAP",
            title: "Spider-Tracer GeoHUD",
            desc: "Designed and implemented a real-time tracking radar dashboard showing coordinates and danger triggers around Manhattan. Leveraged Node.js server connections running Socket.io for immediate server-to-client notifications. Integrates Leaflet Mapping structures with custom-styled map layers.",
            metrics: [
                "Real-time lat/long geo coordinate broadcasts",
                "Websocket latency stable under 10ms",
                "Styled with glowing neon overlay tiles",
                "Responsive map clustering for high-density alerts"
            ],
            tags: ["Node.js", "Socket.io", "Leaflet.js", "Express", "CSS Gradients"],
            status: "ACTIVE MONITORING"
        },
        bva: {
            code: "MISSION CODE: BVA-PORTAL",
            title: "Brooklyn Visions Portal",
            desc: "Co-developed the secure student administration web-portal for Brooklyn Visions Academy. Built clean administrative dashboard structures showing grades telemetry, homework submission files, and interactive student forums. Configured backend storage nodes with Firestore.",
            metrics: [
                "Secure logins with Firebase Auth integrations",
                "Over 850 active simulated accounts managed",
                "Responsive graphs tracking class rankings using Chart.js",
                "Mentored under Peter Parker's web performance guide"
            ],
            tags: ["Vue3", "Firebase Auth", "Firestore", "Chart.js", "Web Security"],
            status: "DEPLOYED"
        }
    };

    const modal = document.getElementById('mission-modal');
    const modalCode = document.getElementById('modal-code');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalMetrics = document.getElementById('modal-metrics');
    const modalTags = document.getElementById('modal-tags');
    const modalStatus = document.getElementById('modal-status');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;

    // Open Modal
    document.querySelectorAll('.mission-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = btn.getAttribute('data-target');
            const info = missionBriefings[key];
            if (!info || !modal) return;
            
            modalCode.textContent = info.code;
            modalTitle.textContent = info.title;
            modalDesc.textContent = info.desc;
            
            // Build metrics list
            modalMetrics.innerHTML = '';
            info.metrics.forEach(m => {
                const li = document.createElement('li');
                li.textContent = m;
                modalMetrics.appendChild(li);
            });

            // Build tags
            modalTags.innerHTML = '';
            info.tags.forEach(t => {
                const span = document.createElement('span');
                span.textContent = t;
                modalTags.appendChild(span);
            });

            modalStatus.textContent = info.status;
            
            // Toggle visual display
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock scrolling
            
            // Audio sound effect
            triggerSuitSpark('hud');
        });
    });

    // Close Modal
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scroll
        }
    }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);


    // --- BROOKLYN GRAFFITI CANVAS ---
    const canvas = document.getElementById('graffiti-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const sizeDisplay = document.getElementById('brush-size-display');
    const sizeSlider = document.getElementById('brush-slider');
    const clearBtn = document.getElementById('canvas-clear');
    const saveBtn = document.getElementById('canvas-save');
    const coordDisplay = document.getElementById('canvas-coordinates');
    const colorBtns = document.querySelectorAll('.color-btn');

    let drawing = false;
    let currentColor = '#ff0044';
    let currentBrushSize = 25;

    // Canvas init
    function initCanvas() {
        if (!canvas || !ctx) return;
        ctx.fillStyle = '#111116';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    initCanvas();

    // Color Pickers
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.getAttribute('data-color');
            
            // Set slider color
            if (sizeSlider) {
                sizeSlider.style.accentColor = currentColor;
            }
        });
    });

    // Brush Size
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            currentBrushSize = parseInt(e.target.value);
            if (sizeDisplay) {
                sizeDisplay.textContent = `${currentBrushSize}px`;
            }
        });
    }

    // Drawing Listeners
    if (canvas && ctx) {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch supports
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            drawing = true;
            drawSpray(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!drawing) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            drawSpray(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        canvas.addEventListener('touchend', () => drawing = false);
    }

    function startDrawing(e) {
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        drawSpray(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update coord hud
        if (coordDisplay) {
            const padX = String(Math.round(x)).padStart(3, '0');
            const padY = String(Math.round(y)).padStart(3, '0');
            coordDisplay.textContent = `X: ${padX} | Y: ${padY}`;
        }
        
        if (!drawing) return;
        drawSpray(x, y);
    }

    function stopDrawing() {
        drawing = false;
    }

    // Spray Paint nozzle simulation
    function drawSpray(x, y) {
        ctx.fillStyle = currentColor;
        const density = currentBrushSize * 0.8;
        
        // Draw multiple random small circles to simulate spray splatters
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * currentBrushSize;
            const xOffset = Math.cos(angle) * radius;
            const yOffset = Math.sin(angle) * radius;
            
            ctx.beginPath();
            // Vary droplet sizes slightly for texture
            const dropletSize = Math.random() * 1.5 + 0.5;
            ctx.arc(x + xOffset, y + yOffset, dropletSize, 0, Math.PI * 2);
            ctx.globalAlpha = Math.random() * 0.3 + 0.15; // translucent overlapping spray
            ctx.fill();
        }
        ctx.globalAlpha = 1.0; // Reset
    }

    // Clear Canvas
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            initCanvas();
            if (audioCtx) {
                // play high noise clearing sound
                playFlickerSynthSound(80, 40);
            }
        });
    }

    // Save/Download Canvas Tag
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!canvas) return;
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'miles_morales_graffiti_tag.png';
            link.href = dataUrl;
            link.click();
        });
    }


    // --- COMLINK SECURE SMS FORMS & SMARTPHONE SIMULATOR ---
    const contactForm = document.getElementById('secure-contact-form');
    const chatThread = document.getElementById('chat-thread');
    const nameInput = document.getElementById('contact-name-input');
    const emailInput = document.getElementById('contact-email-input');
    const messageInput = document.getElementById('contact-message-input');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = nameInput.value;
            const msg = messageInput.value;
            
            // 1. Add user message bubble
            appendChatBubble(msg, 'sent');
            
            // 2. Play message sound
            playFlickerSynthSound(600, 1200);

            // Clear inputs
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
            
            // 3. Trigger typing status of Ganke Lee
            const gankeStatus = document.querySelector('.contact-status');
            if (gankeStatus) {
                gankeStatus.innerHTML = '<span class="pulse-dot green"></span> typing...';
            }

            // 4. Wait 1.8 seconds, append response
            setTimeout(() => {
                const responses = [
                    `Yo! That's awesome, ${name.split(' ')[0]}. Spider-Sense registers your message as safe. I will ping Miles to check the signal logs!`,
                    `Signal received! Encrypted and stored. Miles is out slinging web structures, but he'll check this when back at BVA.`,
                    `Tight! End-to-end signal route verified. Talk soon!`
                ];
                const reply = responses[Math.floor(Math.random() * responses.length)];
                
                appendChatBubble(reply, 'received');
                
                // Reset status
                if (gankeStatus) {
                    gankeStatus.innerHTML = '<span class="pulse-dot green"></span> active';
                }
                
                // Play notification alert
                playFlickerSynthSound(900, 450);
            }, 1800);
        });
    }

    function appendChatBubble(text, type) {
        if (!chatThread) return;
        
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;
        
        const p = document.createElement('p');
        p.textContent = text;
        bubble.appendChild(p);
        
        const time = document.createElement('span');
        time.className = 'bubble-time';
        const now = new Date();
        time.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        bubble.appendChild(time);
        
        chatThread.appendChild(bubble);
        
        // Smooth scroll chat thread
        chatThread.scrollTo({
            top: chatThread.scrollHeight,
            behavior: 'smooth'
        });
    }


    // --- SECTION ACTIVE HIGHLIGHT HUD LINKING ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.scrollY + 200; // Offset for accuracy
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

});
