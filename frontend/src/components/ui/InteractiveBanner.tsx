import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ParticleConfig {
    particleCount: number;
    baseSpeed: number;
    connectDistance: number;
    mouseRadius: number;
    interactionMode: 'connect' | 'repel' | 'none';
}

const InteractiveBanner: React.FC = () => {
    const { theme } = useTheme();
    const isDarkRef = useRef(theme === 'dark');

    useEffect(() => {
        isDarkRef.current = theme === 'dark';
    }, [theme]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Get initial particle count based on screen width to avoid high density on mobile
    const getInitialParticleCount = () => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
        if (width < 640) return 45;
        if (width < 1024) return 85;
        return 130;
    };

    const initialCount = getInitialParticleCount();

    // UI states to bind inputs and show/hide the panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [particleCount, setParticleCount] = useState(initialCount);
    const [baseSpeed, setBaseSpeed] = useState(0.8);
    const [interactionMode, setInteractionMode] = useState<'connect' | 'repel' | 'none'>('connect');

    // Ref configuration for high-performance reading inside the loop
    const configRef = useRef<ParticleConfig>({
        particleCount: initialCount,
        baseSpeed: 0.8,
        connectDistance: 120,
        mouseRadius: 150,
        interactionMode: 'connect',
    });

    // Update configRef when states change
    useEffect(() => {
        configRef.current.particleCount = particleCount;
        configRef.current.baseSpeed = baseSpeed;
        configRef.current.interactionMode = interactionMode;
    }, [particleCount, baseSpeed, interactionMode]);

    // Mouse coordinates relative to the container
    const mouseRef = useRef<{ x: number | null; y: number | null }>({
        x: null,
        y: null,
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouseRef.current.x = null;
        mouseRef.current.y = null;
    };

    // Color interpolation function
    const getColorByPosition = (x: number, width: number) => {
        const ratio = x / (width || 1);
        
        // RGB Values
        const colors = [
            { r: 229, g: 57,  b: 53  }, // Vermelho (L)
            { r: 251, g: 192, b: 45  }, // Amarelo (I)
            { r: 30,  g: 136, b: 229 }, // Azul (A)
            { r: 67,  g: 160, b: 71  }  // Verde (O)
        ];

        let startColor, endColor, localRatio;

        if (ratio < 0.33) {
            startColor = colors[0];
            endColor = colors[1];
            localRatio = ratio / 0.33;
        } else if (ratio < 0.66) {
            startColor = colors[1];
            endColor = colors[2];
            localRatio = (ratio - 0.33) / 0.33;
        } else {
            startColor = colors[2];
            endColor = colors[3];
            localRatio = (ratio - 0.66) / 0.34;
        }

        localRatio = Math.max(0, Math.min(1, localRatio));

        const r = Math.round(startColor.r + (endColor.r - startColor.r) * localRatio);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * localRatio);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * localRatio);

        return `${r}, ${g}, ${b}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particlesArray: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            size: number;
            baseVx: number;
            baseVy: number;
            vx: number;
            vy: number;

            constructor(w: number, h: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 1; // Size between 1 and 3

                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 0.5 + 0.2;
                this.baseVx = Math.cos(angle) * speed;
                this.baseVy = Math.sin(angle) * speed;

                this.vx = this.baseVx;
                this.vy = this.baseVy;
            }

            update(w: number, h: number, config: ParticleConfig, mouse: { x: number | null; y: number | null }) {
                this.vx = this.baseVx * config.baseSpeed;
                this.vy = this.baseVy * config.baseSpeed;

                // Repel Interaction
                if (config.interactionMode === 'repel' && mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.mouseRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = config.mouseRadius;
                        const force = (maxDistance - distance) / maxDistance;
                        
                        // Push away from mouse
                        const directionX = forceDirectionX * force * 5;
                        const directionY = forceDirectionY * force * 5;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;

                // Bounce boundaries with clamping
                if (this.x < 0) {
                    this.x = 0;
                    this.baseVx = Math.abs(this.baseVx);
                } else if (this.x > w) {
                    this.x = w;
                    this.baseVx = -Math.abs(this.baseVx);
                }

                if (this.y < 0) {
                    this.y = 0;
                    this.baseVy = Math.abs(this.baseVy);
                } else if (this.y > h) {
                    this.y = h;
                    this.baseVy = -Math.abs(this.baseVy);
                }
            }

            draw(ctx: CanvasRenderingContext2D, w: number) {
                const rgb = getColorByPosition(this.x, w);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, 0.8)`;
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgb(${rgb})`;
                ctx.fill();
                ctx.shadowBlur = 0; // Reset blur for lines
            }
        }

        const resizeCanvas = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            canvas.width = w;
            canvas.height = h;
            initParticles(w, h);
        };

        const initParticles = (w: number, h: number) => {
            particlesArray = [];
            const count = configRef.current.particleCount;
            for (let i = 0; i < count; i++) {
                particlesArray.push(new Particle(w, h));
            }
        };

        // Connect particles
        const connectParticles = (ctx: CanvasRenderingContext2D, w: number, config: ParticleConfig, mouse: { x: number | null; y: number | null }) => {
            for (let a = 0; a < particlesArray.length; a++) {
                const pA = particlesArray[a];
                
                for (let b = a + 1; b < particlesArray.length; b++) {
                    const pB = particlesArray[b];
                    const dx = pA.x - pB.x;
                    const dy = pA.y - pB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectDistance) {
                        const opacity = 1 - (distance / config.connectDistance);
                        const avgX = (pA.x + pB.x) / 2;
                        const rgb = getColorByPosition(avgX, w);

                        ctx.strokeStyle = `rgba(${rgb}, ${opacity * 0.45})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(pA.x, pA.y);
                        ctx.lineTo(pB.x, pB.y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse (neural network mode)
                if (config.interactionMode === 'connect' && mouse.x !== null && mouse.y !== null) {
                    const dxMouse = pA.x - mouse.x;
                    const dyMouse = pA.y - mouse.y;
                    const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                    if (distanceMouse < config.mouseRadius) {
                        const opacity = 1 - (distanceMouse / config.mouseRadius);
                        const rgb = getColorByPosition(pA.x, w);

                        ctx.strokeStyle = `rgba(${rgb}, ${opacity * 0.75})`;
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(pA.x, pA.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Resize initially
        resizeCanvas();

        const animate = () => {
            const w = canvas.width;
            const h = canvas.height;
            const config = configRef.current;
            const mouse = mouseRef.current;

            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(w, h, config, mouse);
                particlesArray[i].draw(ctx, w);
            }

            connectParticles(ctx, w, config, mouse);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Listen for window resize
        window.addEventListener('resize', resizeCanvas);

        // Watch for manual density changes
        const checkDensityInterval = setInterval(() => {
            if (particlesArray.length !== configRef.current.particleCount) {
                initParticles(canvas.width, canvas.height);
            }
        }, 100);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            clearInterval(checkDensityInterval);
        };
    }, []);

    const styles = `
        .logo-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 3rem;
            line-height: 1;
            letter-spacing: 0.05em;
            text-shadow: 2px 2px 15px rgba(0,0,0,0.8);
        }
        @media (min-width: 640px) {
            .logo-text {
                font-size: 4.5rem;
                letter-spacing: 0.08em;
            }
        }
        @media (min-width: 768px) {
            .logo-text {
                font-size: 5.5rem;
                letter-spacing: 0.1em;
            }
        }
        .logo-sub {
            font-family: 'Rajdhani', sans-serif;
            text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
        }
        .interactive-banner input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        .interactive-banner input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            margin-top: -6px;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        .interactive-banner input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #333;
            border-radius: 2px;
        }
    `;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="interactive-banner relative h-[220px] sm:h-[300px] md:h-[400px] w-full overflow-hidden bg-[#141417] dark:bg-[#0a0a0c] text-white flex flex-col justify-center select-none transition-colors duration-300"
        >
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            {/* Network Canvas Animation */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block z-0 animate-fade-in"
            />

            {/* Overlay UI Layer */}
            <div className="relative z-10 w-full px-4 sm:px-8 md:px-16 max-w-7xl mx-auto pointer-events-none">
                <div className="flex flex-col">
                    <h1 className="logo-text flex items-center font-black">
                        <span className="text-[#E53935] drop-shadow-[0_0_15px_rgba(229,57,53,0.4)]">L</span>
                        <span className="text-[#FBC02D] drop-shadow-[0_0_15px_rgba(251,192,45,0.4)]">I</span>
                        <span className="text-[#1E88E5] drop-shadow-[0_0_15px_rgba(30,136,229,0.4)] text-[1.1em] translate-y-[-0.05em]">Λ</span>
                        <span className="text-[#43A047] drop-shadow-[0_0_15px_rgba(67,160,71,0.4)]">O</span>
                        {/* Text for search engines and accessibility to match LIAO UFBA entity */}
                        <span className="sr-only">LIAO UFBA - Liga Acadêmica de Inteligência Artificial e Otimização</span>
                    </h1>
                    <p className="logo-sub text-sm sm:text-lg md:text-xl font-semibold mt-1.5 text-gray-200 tracking-wide">
                        Liga de Inteligência Artificial e Otimização
                    </p>
                </div>
            </div>

            {/* Gear Button */}
            <button
                onClick={() => setPanelOpen(!panelOpen)}
                style={{ transform: panelOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-black/80 hover:bg-gray-800 border border-white/20 p-3 rounded-full z-20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none"
                title="Configurações da Rede"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            </button>

            {/* Settings Panel */}
            <div
                className={`absolute bottom-20 right-6 sm:bottom-24 sm:right-8 bg-black/75 backdrop-blur-lg border border-white/10 p-5 rounded-xl w-72 shadow-2xl z-20 transition-all duration-300 ${
                    panelOpen
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
                <h3 className="text-sm font-bold font-['Orbitron'] mb-4 flex items-center gap-2 border-b border-white/20 pb-2 text-white/90">
                    Controles da Rede
                </h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-sans">
                            <span>Densidade de Nós</span>
                            <span className="font-semibold text-white">{particleCount}</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="400"
                            value={particleCount}
                            onChange={(e) => setParticleCount(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-sans">
                            <span>Velocidade</span>
                            <span className="font-semibold text-white">{baseSpeed}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={baseSpeed}
                            onChange={(e) => setParticleSpeedState(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-sans">
                            Interação do Mouse
                        </label>
                        <select
                            value={interactionMode}
                            onChange={(e) => setInteractionMode(e.target.value as any)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500 font-sans"
                        >
                            <option value="connect">Conectar (Rede Neural)</option>
                            <option value="repel">Repelir (Campo Magnético)</option>
                            <option value="none">Nenhuma</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    // Minor helper to bridge setParticleSpeedState to baseSpeed
    function setParticleSpeedState(val: number) {
        setBaseSpeed(val);
    }
};

export default InteractiveBanner;
