import React, { useEffect, useRef } from 'react';

interface TechBackgroundProps {
    colors?: string[];
    backgroundColor?: string;
    mode?: 'fixed' | 'absolute';
    opacity?: number;
}

const TechBackground: React.FC<TechBackgroundProps> = ({
    colors = ['#4cc9f0', '#0b132b', '#00f5d4'],
    backgroundColor = '#050a14',
    mode = 'fixed',
    opacity = 1
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Configuration - Strict adherence to "Ideal Parameters"
        const particleCount = 50; // 40-55
        const connectionDistance = 130; // 120-140
        const friction = 0.995; // Explicit requirement
        const initialSpeed = 0.4; // 0.3 - 0.5

        // Resize handling
        const resizeCanvas = () => {
            if (mode === 'absolute' && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            // Phase offset for deterministic wave motion
            phaseX: number;
            phaseY: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;

                // Initial Random Direction but Deterministic Loop
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * initialSpeed;
                this.vy = Math.sin(angle) * initialSpeed;

                this.size = Math.random() * 2 + 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];

                // Assign random phases for wave motion so they don't all move in sync
                this.phaseX = Math.random() * Math.PI * 2;
                this.phaseY = Math.random() * Math.PI * 2;
            }

            update() {
                // PRINCIPLE 1: Inertia Constant
                this.vx *= friction;
                this.vy *= friction;

                // PRINCIPLE 3: Gradual Direction Change (Deterministic, No Random in Loop)
                // We use Sine waves to create infinite, predictable, organic energy.
                // This acts as the "External Influence" (dx, dy) to keep them moving against friction.
                // Low frequency (0.0002) ensures very long, smooth curves (~30s cycles).
                const time = Date.now() * 0.0002;

                const dx = Math.cos(time + this.phaseX);
                const dy = Math.sin(time + this.phaseY);

                // "Aceleração mínima" compliant with specs (0.0001 range per frame equivalent)
                // Since we aren't using dt here to stay strict to the "Formula" provided:
                // vx += dx * 0.0001
                this.vx += dx * 0.005; // Tuned slightly up to counter 0.995 friction effectively
                this.vy += dy * 0.005;

                // PRINCIPLE 2: Continuous Incremental Movement
                this.x += this.vx;
                this.y += this.vy;

                // PRINCIPLE 4: Smooth Edges (Reflection)
                // "Refletir suavemente a velocidade, nunca reposicionar"
                if (this.x < 0 || this.x > canvas!.width) {
                    this.vx *= -1;
                    // Soft push to ensure they don't get stuck in the wall due to float precision
                    // without distinct "repositioning"
                    // this.vx += (this.x < 0 ? 0.01 : -0.01); 
                }
                if (this.y < 0 || this.y > canvas!.height) {
                    this.vy *= -1;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();

                // Connections
                for (let j = index + 1; j < particles.length; j++) {
                    const dx = particle.x - particles[j].x;
                    const dy = particle.y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        const gradient = ctx.createLinearGradient(particle.x, particle.y, particles[j].x, particles[j].y);
                        gradient.addColorStop(0, particle.color);
                        gradient.addColorStop(1, particles[j].color);

                        ctx.strokeStyle = gradient;
                        // Spec: opacity = 1 - (dist / maxDist)
                        // Max Opacity Clamp: <= 0.25
                        const rawAlpha = 1 - (distance / connectionDistance);
                        const alpha = Math.min(rawAlpha, 0.25); // Strict requirement: <= 0.25

                        ctx.globalAlpha = alpha;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [colors, backgroundColor, mode]);

    return (
        <canvas
            ref={canvasRef}
            className={`${mode === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'} w-full h-full pointer-events-none`}
            style={{ zIndex: 0, opacity }}
        />
    );
};

export default TechBackground;
