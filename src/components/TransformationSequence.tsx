import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { StoryStage } from '../types/story';
import { audioManager } from '../utils/AudioManager';

interface Props {
    stage: StoryStage;
    onAdvanceStage: (next: StoryStage) => void;
}

export const TransformationSequence: React.FC<Props> = ({ stage, onAdvanceStage }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fishRef = useRef<HTMLDivElement>(null);
    const splashRef = useRef<HTMLDivElement>(null);
    const energySphereRef = useRef<HTMLDivElement>(null);
    const monkeyRef = useRef<HTMLDivElement>(null);
    const envelopePreviewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stage !== 'FISH_SUCCESS') return;

        const tl = gsap.timeline();

        // 1. Cá nhảy vọt từ mặt sông lên đỉnh quỹ đạo + tia nước bắn chậm
        tl.fromTo(
            splashRef.current,
            { scale: 0.2, opacity: 1, y: 140 },
            { scale: 1.5, opacity: 0, y: 70, duration: 0.95, ease: 'power2.out' }
        );

        tl.fromTo(
            fishRef.current,
            { x: -40, y: 190, scale: 0.35, rotation: -38, opacity: 0 },
            {
                x: 0,
                y: -25,
                scale: 1.15,
                rotation: 12,
                opacity: 1,
                duration: 1.25,
                ease: 'power2.out',
                onComplete: () => {
                    onAdvanceStage('FISH_TRANSFORMATION');
                    audioManager.playMagicChime();
                }
            },
            '<'
        );

        // 2. Cá phát sáng trong vòng hào quang vàng và biến hình thành Khỉ Lông Vàng
        tl.to(energySphereRef.current, {
            scale: 1.8,
            opacity: 1,
            rotation: 180,
            duration: 0.55,
            ease: 'power2.inOut'
        });

        tl.to(
            fishRef.current,
            {
                scale: 0.1,
                opacity: 0,
                filter: 'brightness(3) blur(6px)',
                duration: 0.4
            },
            '-=0.3'
        );

        tl.fromTo(
            monkeyRef.current,
            { scale: 0.2, opacity: 0, rotation: 0 },
            {
                scale: 1.15,
                opacity: 1,
                duration: 0.45,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    onAdvanceStage('MONKEY_SPIN');
                }
            },
            '-=0.2'
        );

        tl.to(energySphereRef.current, { scale: 0.9, opacity: 0.4, duration: 0.35 }, '<');

        // 3. Chú khỉ lông vàng thực hiện CHÍNH XÁC 2 vòng xoay liên tiếp (720 độ) trên không
        tl.to(monkeyRef.current, {
            rotation: 720,
            y: -35,
            duration: 1.65,
            ease: 'power1.inOut',
            onComplete: () => {
                onAdvanceStage('ENVELOPE_TRANSFORMATION');
                audioManager.playMagicChime();
            }
        });

        // 4. Khỉ cuộn mình trong quầng sáng vàng và biến thành Phong Thư Huyền Ảo
        tl.to(energySphereRef.current, {
            scale: 2.2,
            opacity: 1,
            duration: 0.45,
            ease: 'power2.in'
        });

        tl.to(
            monkeyRef.current,
            {
                scale: 0.15,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.in'
            },
            '<'
        );

        tl.fromTo(
            envelopePreviewRef.current,
            { scale: 0.2, opacity: 0, rotation: -15 },
            {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.85,
                ease: 'back.out(1.4)'
            },
            '-=0.15'
        );

        tl.to(
            energySphereRef.current,
            {
                scale: 0.2,
                opacity: 0,
                duration: 0.5
            },
            '-=0.6'
        );

        // Chuyển sang giai đoạn mở thư
        tl.to(envelopePreviewRef.current, {
            y: 0,
            duration: 0.45,
            onComplete: () => {
                onAdvanceStage('LETTER_OPENING');
            }
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="transformation-stage-layer">
            {/* Giọt nước bắn tung tóe */}
            <div ref={splashRef} className="water-splash-droplets">
                <svg viewBox="0 0 220 140" className="splash-svg">
                    <circle cx="45" cy="70" r="6" fill="#fff7d6" />
                    <circle cx="80" cy="35" r="8" fill="#a8e6ff" />
                    <circle cx="110" cy="20" r="5" fill="#ffffff" />
                    <circle cx="145" cy="40" r="7" fill="#a8e6ff" />
                    <circle cx="175" cy="75" r="6" fill="#fff7d6" />
                </svg>
            </div>

            {/* Vòng hào quang năng lượng vàng biến hình */}
            <div ref={energySphereRef} className="golden-magic-aura" />

            {/* 1. Nhân vật Cá Chép Vàng (Custom Multi-path Vector) */}
            <div ref={fishRef} className="morph-actor fish-actor">
                <svg viewBox="0 0 220 150" className="custom-creature-svg">
                    <defs>
                        <linearGradient id="goldenFishGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fff3b0" />
                            <stop offset="45%" stopColor="#ffae34" />
                            <stop offset="100%" stopColor="#d95918" />
                        </linearGradient>
                    </defs>
                    {/* Vây lưng & vây bụng */}
                    <path d="M85,48 Q115,15 148,45 Z" fill="#ff7b29" opacity="0.9" />
                    <path d="M95,102 Q115,130 135,100 Z" fill="#ff7b29" opacity="0.9" />
                    {/* Đuôi cá lượn sóng mềm mại */}
                    <path d="M155,75 C185,35 208,30 212,48 C205,68 195,75 212,102 C205,120 185,112 155,75 Z" fill="url(#goldenFishGrad)" />
                    {/* Thân cá */}
                    <path d="M22,75 C45,32 125,35 162,75 C125,115 45,118 22,75 Z" fill="url(#goldenFishGrad)" stroke="#fff7c2" strokeWidth="2" />
                    {/* Vảy cá lấp lánh */}
                    <path d="M68,62 Q78,75 68,88 M92,58 Q104,75 92,92 M118,62 Q128,75 118,88" stroke="#fff3b0" strokeWidth="2" fill="none" opacity="0.75" />
                    {/* Mắt cá */}
                    <circle cx="46" cy="68" r="6" fill="#ffffff" />
                    <circle cx="44" cy="68" r="3.2" fill="#1a0f0a" />
                </svg>
            </div>

            {/* 2. Nhân vật Chú Khỉ Lông Vàng Óng (Custom Illustrated Character) */}
            <div ref={monkeyRef} className="morph-actor monkey-actor">
                <svg viewBox="0 0 220 220" className="custom-creature-svg">
                    <defs>
                        <radialGradient id="goldenFurGrad" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" stopColor="#ffe885" />
                            <stop offset="65%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </radialGradient>
                    </defs>
                    {/* Đuôi khỉ cong dài mềm mại */}
                    <path
                        d="M138,155 C185,165 198,110 172,92 C156,82 148,98 162,106"
                        stroke="url(#goldenFurGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Tai trái & phải */}
                    <circle cx="62" cy="82" r="16" fill="url(#goldenFurGrad)" />
                    <circle cx="62" cy="82" r="10" fill="#fed7aa" />
                    <circle cx="158" cy="82" r="16" fill="url(#goldenFurGrad)" />
                    <circle cx="158" cy="82" r="10" fill="#fed7aa" />
                    {/* Thân khỉ tư thế nhào lộn vui nhộn */}
                    <ellipse cx="110" cy="142" rx="34" ry="38" fill="url(#goldenFurGrad)" />
                    <ellipse cx="110" cy="145" rx="22" ry="25" fill="#fde68a" />
                    {/* Tay và chân khỉ */}
                    <path d="M82,125 Q52,102 48,122" stroke="url(#goldenFurGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                    <path d="M138,125 Q168,102 172,122" stroke="url(#goldenFurGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                    <path d="M92,174 Q75,195 66,184" stroke="url(#goldenFurGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                    <path d="M128,174 Q145,195 154,184" stroke="url(#goldenFurGrad)" strokeWidth="13" strokeLinecap="round" fill="none" />
                    {/* Đầu khỉ & chỏm lông vàng */}
                    <circle cx="110" cy="82" r="38" fill="url(#goldenFurGrad)" />
                    <path d="M98,46 Q110,28 122,46 Q115,38 110,45 Z" fill="#fde047" />
                    {/* Khuôn mặt trái tim đáng yêu */}
                    <path d="M82,78 C82,60 110,64 110,74 C110,64 138,60 138,78 C138,98 126,110 110,110 C94,110 82,98 82,78 Z" fill="#ffedd5" />
                    {/* Đôi mắt to tròn long lanh & nụ cười */}
                    <circle cx="97" cy="80" r="5.5" fill="#271206" />
                    <circle cx="95" cy="78" r="2" fill="#ffffff" />
                    <circle cx="123" cy="80" r="5.5" fill="#271206" />
                    <circle cx="121" cy="78" r="2" fill="#ffffff" />
                    <ellipse cx="110" cy="89" rx="4" ry="2.5" fill="#9a3412" />
                    <path d="M98,96 Q110,106 122,96" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
            </div>

            {/* 3. Hình dáng Phong Thư Phát Sáng xuất hiện khi kết thúc biến hình (Theo Ảnh mẫu 1) */}
            <div ref={envelopePreviewRef} className="morph-actor envelope-preview-actor">
                <div className="glowing-envelope-box">
                    <div className="wax-seal-blue-clock" />
                </div>
            </div>
        </div>
    );
};