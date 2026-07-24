import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface TechCtaBackgroundProps {
    className?: string;
}

interface CircuitSegment {
    x1: number;
    y1: number;
    cornerX: number;
    cornerY: number;
    x2: number;
    y2: number;
    color: string;
    padStartSize: number;
    padEndSize: number;
    length: number;
}

interface SignalPulse {
    segmentIdx: number;
    progress: number;
    speed: number;
    color: string;
}

export const TechCtaBackground: React.FC<TechCtaBackgroundProps> = ({ className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const isDarkRef = useRef(theme === 'dark');

    useEffect(() => {
        isDarkRef.current = theme === 'dark';
    }, [theme]);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animFrameId: number;
        let segments: CircuitSegment[] = [];
        let pulses: SignalPulse[] = [];

        const gridStep = 40; // Clean 40px grid

        const darkColors = [
            'rgba(6, 182, 212, ',   // Cyan
            'rgba(59, 130, 246, ',  // Blue
            'rgba(234, 179, 8, ',   // Gold
            'rgba(239, 68, 68, ',   // Red
        ];

        const lightColors = [
            'rgba(14, 165, 233, ',  // Sky Blue
            'rgba(37, 99, 235, ',   // Royal Blue
            'rgba(217, 119, 6, ',   // Amber
            'rgba(220, 38, 38, ',   // Red
        ];

        const getColors = () => (isDarkRef.current ? darkColors : lightColors);

        const initCircuits = () => {
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            const cols = Math.floor(w / gridStep);
            const rows = Math.floor(h / gridStep);

            const colors = getColors();

            // Generate clean, sparse circuit line segments
            // Target ~16-24 distinct segments across the section for a clean look
            const segmentCount = Math.min(Math.max(Math.floor((cols * rows) * 0.04), 16), 26);
            segments = [];

            for (let i = 0; i < segmentCount; i++) {
                const gx1 = Math.floor(Math.random() * (cols - 2)) + 1;
                const gy1 = Math.floor(Math.random() * (rows - 2)) + 1;

                // Length between 2 and 6 grid steps
                const lenX = (Math.floor(Math.random() * 4) + 2) * (Math.random() > 0.5 ? 1 : -1);
                const lenY = (Math.floor(Math.random() * 4) + 2) * (Math.random() > 0.5 ? 1 : -1);

                const gx2 = Math.min(Math.max(gx1 + lenX, 1), cols - 1);
                const gy2 = Math.min(Math.max(gy1 + lenY, 1), rows - 1);

                const x1 = gx1 * gridStep;
                const y1 = gy1 * gridStep;
                const x2 = gx2 * gridStep;
                const y2 = gy2 * gridStep;

                // 90-degree corner
                const useXFirst = Math.random() > 0.5;
                const cornerX = useXFirst ? x2 : x1;
                const cornerY = useXFirst ? y1 : y2;

                const d1 = Math.abs(cornerX - x1) + Math.abs(cornerY - y1);
                const d2 = Math.abs(x2 - cornerX) + Math.abs(y2 - cornerY);

                if (d1 + d2 > 0) {
                    segments.push({
                        x1,
                        y1,
                        cornerX,
                        cornerY,
                        x2,
                        y2,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        padStartSize: Math.random() > 0.5 ? 4 : 3,
                        padEndSize: Math.random() > 0.5 ? 4 : 3,
                        length: d1 + d2,
                    });
                }
            }

            pulses = [];
        };

        const resize = () => {
            if (!container || !canvas) return;
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            initCircuits();
        };

        const spawnPulse = () => {
            if (segments.length === 0 || pulses.length >= 6) return;
            const segIdx = Math.floor(Math.random() * segments.length);
            const colors = getColors();

            pulses.push({
                segmentIdx: segIdx,
                progress: 0,
                speed: 0.012 + Math.random() * 0.012,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        };

        let lastPulseSpawn = 0;

        const drawFaintGrid = (w: number, h: number, isDark: boolean) => {
            ctx.save();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';

            for (let x = 0; x < w; x += gridStep) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridStep) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            ctx.restore();
        };

        const render = (time: number) => {
            const w = canvas.width;
            const h = canvas.height;
            const isDark = isDarkRef.current;

            ctx.clearRect(0, 0, w, h);

            // 1. Faint grid background
            drawFaintGrid(w, h, isDark);

            // 2. Draw Sparse Circuit Segments with 90° Bends and Terminal Pads
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                const alpha = isDark ? 0.16 : 0.12;

                // Trace Line
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.cornerX, seg.cornerY);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.strokeStyle = `${seg.color}${alpha})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Corner junction dot
                ctx.fillStyle = `${seg.color}${alpha * 1.5})`;
                ctx.fillRect(seg.cornerX - 1.5, seg.cornerY - 1.5, 3, 3);

                // Start Terminal Pad (Square solder pad)
                const sSz = seg.padStartSize;
                ctx.fillRect(seg.x1 - sSz / 2, seg.y1 - sSz / 2, sSz, sSz);

                // End Terminal Pad (Square solder pad)
                const eSz = seg.padEndSize;
                ctx.fillRect(seg.x2 - eSz / 2, seg.y2 - eSz / 2, eSz, eSz);
            }

            // 3. Signal Pulses gliding along line segments
            if (time - lastPulseSpawn > 1000) {
                spawnPulse();
                lastPulseSpawn = time;
            }

            for (let p = pulses.length - 1; p >= 0; p--) {
                const pulse = pulses[p];
                pulse.progress += pulse.speed;
                if (pulse.progress >= 1) {
                    pulses.splice(p, 1);
                    continue;
                }

                const seg = segments[pulse.segmentIdx];
                if (!seg) continue;

                const d1 = Math.abs(seg.cornerX - seg.x1) + Math.abs(seg.cornerY - seg.y1);
                const d2 = Math.abs(seg.x2 - seg.cornerX) + Math.abs(seg.y2 - seg.cornerY);
                const currentDist = pulse.progress * seg.length;

                let px: number, py: number;

                if (currentDist <= d1) {
                    const ratio = d1 > 0 ? currentDist / d1 : 0;
                    px = seg.x1 + (seg.cornerX - seg.x1) * ratio;
                    py = seg.y1 + (seg.cornerY - seg.y1) * ratio;
                } else {
                    const ratio = d2 > 0 ? (currentDist - d1) / d2 : 0;
                    px = seg.cornerX + (seg.x2 - seg.cornerX) * ratio;
                    py = seg.cornerY + (seg.y2 - seg.cornerY) * ratio;
                }

                // Glowing pulse dot along trace
                const pulseAlpha = Math.sin(pulse.progress * Math.PI) * (isDark ? 0.85 : 0.65);
                ctx.save();
                ctx.fillStyle = `${pulse.color}${pulseAlpha})`;
                ctx.shadowColor = `${pulse.color}0.9)`;
                ctx.shadowBlur = isDark ? 8 : 4;
                ctx.fillRect(px - 1.75, py - 1.75, 3.5, 3.5);
                ctx.restore();
            }

            animFrameId = requestAnimationFrame(render);
        };

        const resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(container);

        resize();
        animFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animFrameId);
        };
    }, [theme]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        >
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-gradient-to-tr from-primary-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-gradient-to-bl from-liao-yellow/15 via-liao-red/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-7000" />

            {/* Glowing Tech Scanline */}
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 dark:via-cyan-400/50 to-transparent animate-tech-scanline pointer-events-none" />

            {/* Circuit Canvas Layer */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
    );
};

export default TechCtaBackground;
