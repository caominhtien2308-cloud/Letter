import React, { useEffect, useRef } from 'react';
import { FishingStatus, StoryStage } from '../types/story';
import { FishermanCharacter } from './FishermanCharacter';

interface Props {
    stage: StoryStage;
    fishingStatus: FishingStatus;
    power: number;
}

interface AmbientFish {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    active: boolean;
}

interface WaterRipple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
}

export const DongThapRiverScene: React.FC<Props> = ({ stage, fishingStatus, power }) => {
    const waterCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = waterCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let time = 0;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.52;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const ripples: WaterRipple[] = [];
        const ambientFish: AmbientFish = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, active: false };

        const spawnRipple = (x: number, y: number, maxRadius = 48) => {
            ripples.push({ x, y, radius: 3, maxRadius, alpha: 0.85 });
        };

        // Tạo hiệu ứng gợn sóng khi câu trượt hoặc câu trúng
        if (fishingStatus === 'failure' || fishingStatus === 'success') {
            spawnRipple(canvas.width * 0.48, canvas.height * 0.52, 85);
        }

        const renderWater = () => {
            time += 0.025;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Vẽ các dải nắng chiều lấp lánh trên dòng sông uốn lượn (Sun Shimmer Reflections)
            for (let i = 0; i < 38; i++) {
                const yRatio = i / 38;
                const y = yRatio * canvas.height;
                const waveOffset = Math.sin(time * 2 + i * 0.45) * (8 + yRatio * 22);
                const centerRiverX = canvas.width * 0.5 + Math.sin(yRatio * 3.2 - 0.6) * (canvas.width * 0.14);
                const stripWidth = (45 + yRatio * 180) + Math.cos(time * 1.5 + i) * 14;

                ctx.fillStyle = `rgba(255, ${205 - Math.floor(yRatio * 55)}, 95, ${0.42 - yRatio * 0.22})`;
                ctx.beginPath();
                ctx.roundRect(centerRiverX - stripWidth / 2 + waveOffset, y, stripWidth, 3.5 + yRatio * 3, 4);
                ctx.fill();
            }

            // 2. Đàn cá nhỏ nhảy lên khỏi mặt nước ngẫu nhiên rồi tạo vòng gợn sóng
            if (!ambientFish.active && Math.random() < 0.008) {
                ambientFish.active = true;
                ambientFish.x = canvas.width * (0.35 + Math.random() * 0.35);
                ambientFish.y = canvas.height * (0.35 + Math.random() * 0.35);
                ambientFish.vx = (Math.random() < 0.5 ? 1 : -1) * (2.2 + Math.random() * 1.5);
                ambientFish.vy = -5.8;
                spawnRipple(ambientFish.x, ambientFish.y, 42);
            }

            if (ambientFish.active) {
                ambientFish.x += ambientFish.vx;
                ambientFish.y += ambientFish.vy;
                ambientFish.vy += 0.24; // Trọng lực
                ambientFish.angle = Math.atan2(ambientFish.vy, ambientFish.vx);

                ctx.save();
                ctx.translate(ambientFish.x, ambientFish.y);
                ctx.rotate(ambientFish.angle);
                ctx.fillStyle = '#ffe299';
                ctx.beginPath();
                ctx.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-9, 0);
                ctx.lineTo(-16, -5);
                ctx.lineTo(-16, 5);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                if (ambientFish.vy > 0 && ambientFish.y > canvas.height * 0.45) {
                    spawnRipple(ambientFish.x, ambientFish.y, 50);
                    ambientFish.active = false;
                }
            }

            // 3. Vẽ các vòng gợn sóng lan tỏa
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += 0.85;
                r.alpha -= 0.014;
                if (r.alpha <= 0) {
                    ripples.splice(i, 1);
                    continue;
                }
                ctx.strokeStyle = `rgba(255, 236, 179, ${r.alpha})`;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.32, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            animId = requestAnimationFrame(renderWater);
        };

        renderWater();
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, [fishingStatus]);

    return (
        <div className="dong-thap-scene">
            {/* Bầu trời chiều vàng cam pha tím hồng & Mặt trời hoàng hôn */}
            <div className="sunset-sky-backdrop">
                <div className="sunset-sun-orb" />
                <div className="drifting-cloud cloud-1" />
                <div className="drifting-cloud cloud-2" />
            </div>

            {/* Phong cảnh cánh đồng lúa, dòng sông uốn lượn & rặng dừa miền Tây (Bám sát Ảnh mẫu 2) */}
            <svg className="mekong-landscape-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
                <defs>
                    <linearGradient id="riverSunsetGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                        <stop offset="0%" stopColor="#ffdb7d" />
                        <stop offset="35%" stopColor="#f59042" />
                        <stop offset="75%" stopColor="#9e4770" />
                        <stop offset="100%" stopColor="#2c224d" />
                    </linearGradient>
                    <linearGradient id="riceFieldLeft" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7cb342" />
                        <stop offset="100%" stopColor="#33691e" />
                    </linearGradient>
                    <linearGradient id="riceFieldRight" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8bc34a" />
                        <stop offset="100%" stopColor="#2e5c1e" />
                    </linearGradient>
                </defs>

                {/* Dãy núi mờ phía chân trời */}
                <path
                    d="M0,430 Q220,395 450,425 T920,415 T1440,430 L1440,480 L0,480 Z"
                    fill="#d98c5f"
                    opacity="0.45"
                />

                {/* Nền cánh đồng lúa xanh mướt trải dài */}
                <rect x="0" y="430" width="1440" height="470" fill="url(#riceFieldLeft)" />

                {/* Dòng sông Đồng Tháp uốn lượn hình chữ S từ chân trời về tiền cảnh */}
                <path
                    d="M695,430 C640,465 830,500 760,555 C680,615 470,655 520,745 C560,815 390,865 260,900 L1290,900 C1160,820 960,760 890,675 C830,600 940,535 840,485 C775,452 730,440 695,430 Z"
                    fill="url(#riverSunsetGrad)"
                />

                {/* Các ô ruộng lúa bên bờ trái và bờ phải */}
                <path d="M0,520 L580,535 L460,640 L0,610 Z" fill="#689f38" opacity="0.65" />
                <path d="M900,530 L1440,515 L1440,635 L860,615 Z" fill="url(#riceFieldRight)" opacity="0.75" />

                {/* Những chiếc xuồng ba lá nhỏ trên sông xa (Giống Ảnh mẫu 2) */}
                <g transform="translate(650, 620) scale(0.8)">
                    <path d="M0,0 Q22,12 45,0 L38,10 L8,10 Z" fill="#3e2314" />
                    <path d="M14,0 Q22,-8 31,0" fill="#8d6e63" />
                </g>
                <g transform="translate(810, 695) scale(1.05)">
                    <path d="M0,0 Q25,12 52,0 L43,11 L9,11 Z" fill="#2e190d" />
                    <path d="M16,0 Q26,-9 36,0" fill="#795548" />
                </g>

                {/* Rặng dừa và ngôi nhà gỗ ven sông bên trái & bên phải */}
                <g className="swaying-palms-left">
                    {/* Nhà sàn nhỏ ven sông */}
                    <polygon points="110,590 155,565 200,590 200,625 110,625" fill="#5d3a24" />
                    <polygon points="102,592 155,560 208,592" fill="#8c5230" />
                    {/* Thân và tàu lá dừa đung đưa */}
                    <path d="M85,680 Q105,560 135,480" stroke="#3e2723" strokeWidth="9" fill="none" />
                    <g transform="translate(135, 480)" className="palm-crown">
                        <path d="M0,0 Q-45,-15 -75,15" stroke="#1b5e20" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M0,0 Q-30,-40 -65,-25" stroke="#2e7d32" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M0,0 Q25,-42 65,-20" stroke="#388e3c" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M0,0 Q45,-10 75,22" stroke="#1b5e20" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </g>
                </g>

                <g className="swaying-palms-right">
                    <path d="M1340,720 Q1310,575 1270,475" stroke="#3e2723" strokeWidth="10" fill="none" />
                    <g transform="translate(1270, 475)" className="palm-crown">
                        <path d="M0,0 Q-50,-12 -85,18" stroke="#1b5e20" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M0,0 Q-25,-45 -70,-22" stroke="#2e7d32" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M0,0 Q35,-38 75,-12" stroke="#388e3c" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </g>
                </g>
            </svg>

            {/* Canvas hiệu ứng gợn sóng, phản chiếu ánh nắng và cá nhảy */}
            <canvas ref={waterCanvasRef} className="water-shimmer-canvas" />

            {/* Lớp sương chiều bảng lảng và hạt sáng đom đóm bay nhẹ */}
            <div className="river-mist-overlay" />

            {/* Nhân vật người đàn ông đứng câu cá bên cầu gỗ */}
            <FishermanCharacter fishingStatus={fishingStatus} power={power} stage={stage} />
        </div>
    );
};