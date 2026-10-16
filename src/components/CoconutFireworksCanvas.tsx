import React, { useEffect, useRef } from 'react';
import { StoryStage } from '../types/story';
import { audioManager } from '../utils/AudioManager';

interface Props {
    stage: StoryStage;
    onAdvanceStage: (next: StoryStage) => void;
    onRestartStory: () => void;
}

interface FallingCoconut {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    targetY: number;
    scale: number;
}

interface FireworkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    decay: number;
    size: number;
    isStar: boolean;
}

interface FireworkRocket {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    color: string;
    trail: { x: number; y: number; alpha: number }[];
}

const FIREWORK_COLORS = ['#ff3366', '#fde047', '#4ade80', '#22d3ee', '#fb923c', '#e879f9', '#ffffff', '#ffd700'];

export const CoconutFireworksCanvas: React.FC<Props> = ({
    stage,
    onAdvanceStage,
    onRestartStory
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (stage !== 'COCONUT_FIREWORKS' && stage !== 'ENDING') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const coconuts: FallingCoconut[] = [];
        const particles: FireworkParticle[] = [];
        const rockets: FireworkRocket[] = [];
        const startTime = performance.now();
        const FIREWORKS_DURATION = 5000;
        let finishedTriggered = false;

        // Hàm nổ pháo hoa tại tọa độ (x, y)
        const explodeFirework = (x: number, y: number, count = 48, baseColor: string | null = null) => {
            audioManager.playFireworkPop();
            const chosenColor = baseColor || FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
                const speed = 2.5 + Math.random() * 6.5;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: Math.random() < 0.25 ? '#ffffff' : chosenColor,
                    alpha: 1,
                    decay: 0.014 + Math.random() * 0.012,
                    size: 2.5 + Math.random() * 3.5,
                    isStar: i % 4 === 0
                });
            }
        };

        // Bắn tên lửa pháo hoa từ dưới mặt sông vút lên trời
        const launchRocket = (targetX: number | null = null, targetY: number | null = null) => {
            const tx = targetX !== null ? targetX : canvas.width * (0.2 + Math.random() * 0.6);
            const ty = targetY !== null ? targetY : canvas.height * (0.18 + Math.random() * 0.32);
            rockets.push({
                x: tx + (Math.random() - 0.5) * 60,
                y: canvas.height + 20,
                targetY: ty,
                vy: -(9 + Math.random() * 4),
                vx: (tx - (tx + (Math.random() - 0.5) * 60)) * 0.02,
                color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
                trail: []
            });
        };

        // Thả quả dừa xanh rơi
        const spawnCoconut = (initialY = -50) => {
            const centerX = canvas.width * 0.5;
            const spread = Math.min(canvas.width * 0.78, 720);
            coconuts.push({
                x: centerX + (Math.random() - 0.5) * spread,
                y: initialY,
                vx: (Math.random() - 0.5) * 1.6,
                vy: 3.4 + Math.random() * 2.4,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.1,
                targetY: canvas.height * (0.28 + Math.random() * 0.42),
                scale: 0.78 + Math.random() * 0.42
            });
        };

        // BÙNG NỔ NGAY LẬP TỨC: 5 chùm pháo hoa rực rỡ + dừa rơi ngay lập tức
        explodeFirework(canvas.width * 0.5, canvas.height * 0.28, 60, '#fde047');
        setTimeout(() => explodeFirework(canvas.width * 0.3, canvas.height * 0.35, 52, '#22d3ee'), 120);
        setTimeout(() => explodeFirework(canvas.width * 0.7, canvas.height * 0.32, 52, '#e879f9'), 240);
        setTimeout(() => explodeFirework(canvas.width * 0.45, canvas.height * 0.42, 48, '#4ade80'), 380);
        setTimeout(() => explodeFirework(canvas.width * 0.65, canvas.height * 0.22, 55, '#ff3366'), 520);

        spawnCoconut(-30);
        spawnCoconut(60);
        spawnCoconut(120);
        launchRocket(canvas.width * 0.35, canvas.height * 0.25);
        launchRocket(canvas.width * 0.65, canvas.height * 0.22);

        // Hàm vẽ Quả Dừa Xanh Miền Tây
        const drawGreenCoconut = (c: FallingCoconut) => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.scale(c.scale, c.scale);

            const grad = ctx.createRadialGradient(-6, -6, 3, 0, 0, 22);
            grad.addColorStop(0, '#a3e635');
            grad.addColorStop(0.6, '#4d7c0f');
            grad.addColorStop(1, '#1a2e05');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 21, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(0, -19, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        let lastSpawnTime = performance.now();
        let lastRocketTime = performance.now();
        let rafId: number;

        const render = (now: number) => {
            const elapsed = now - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Liên tục thả dừa và bắn tên lửa pháo hoa trong suốt 5 giây
            if (elapsed < FIREWORKS_DURATION) {
                if (now - lastSpawnTime > 380 && coconuts.length < 8) {
                    spawnCoconut(-40);
                    lastSpawnTime = now;
                }
                if (now - lastRocketTime > 650) {
                    launchRocket();
                    lastRocketTime = now;
                }
            } else if (!finishedTriggered) {
                finishedTriggered = true;
                onAdvanceStage('ENDING');
            }

            // Cập nhật & vẽ tên lửa phóng lên
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.trail.push({ x: r.x, y: r.y, alpha: 1 });
                r.x += r.vx;
                r.y += r.vy;

                for (let t = r.trail.length - 1; t >= 0; t--) {
                    const tr = r.trail[t];
                    tr.alpha -= 0.08;
                    if (tr.alpha <= 0) {
                        r.trail.splice(t, 1);
                        continue;
                    }
                    ctx.fillStyle = r.color;
                    ctx.globalAlpha = tr.alpha;
                    ctx.beginPath();
                    ctx.arc(tr.x, tr.y, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;

                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = r.color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                if (r.y <= r.targetY) {
                    explodeFirework(r.x, r.y, 55, r.color);
                    rockets.splice(i, 1);
                }
            }

            // Cập nhật & vẽ quả dừa rơi
            for (let i = coconuts.length - 1; i >= 0; i--) {
                const c = coconuts[i];
                c.x += c.vx;
                c.y += c.vy;
                c.vy += 0.12;
                c.rotation += c.vRot;

                drawGreenCoconut(c);

                if (c.y >= c.targetY) {
                    explodeFirework(c.x, c.y, 44, '#fde047');
                    coconuts.splice(i, 1);
                }
            }

            // Cập nhật & vẽ hạt sáng pháo hoa
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy = p.vy * 0.96 + 0.09;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;

                if (p.isStar) {
                    ctx.translate(p.x, p.y);
                    ctx.beginPath();
                    for (let s = 0; s < 4; s++) {
                        ctx.lineTo(Math.cos((s * Math.PI) / 2) * (p.size * 2.2), Math.sin((s * Math.PI) / 2) * (p.size * 2.2));
                        ctx.lineTo(
                            Math.cos(((s + 0.5) * Math.PI) / 2) * (p.size * 0.7),
                            Math.sin(((s + 0.5) * Math.PI) / 2) * (p.size * 0.7)
                        );
                    }
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafId);
        };
    }, [stage]);

    return (
        <div className="coconut-fireworks-layer">
            <canvas ref={canvasRef} className="fireworks-canvas" />

            {stage === 'ENDING' && (
                <div className="ending-celebration-modal">
                    <h2 className="ending-title">“Chúc bạn một buổi chiều thật nhiều niềm vui!”</h2>
                    <p className="ending-subtitle">
                        Cảm ơn bạn đã ghé thăm miền sông nước Đồng Tháp huyền ảo.
                    </p>
                    <button type="button" onClick={onRestartStory} className="restart-story-btn">
                        Trải nghiệm lại từ đầu
                    </button>
                </div>
            )}
        </div>
    );
};