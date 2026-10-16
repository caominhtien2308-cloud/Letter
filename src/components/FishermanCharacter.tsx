import React from 'react';
import { FishingStatus, StoryStage } from '../types/story';

interface Props {
    fishingStatus: FishingStatus;
    power: number;
    stage: StoryStage;
}

export const FishermanCharacter: React.FC<Props> = ({ fishingStatus, power, stage }) => {
    const isPulling =
        fishingStatus === 'success' ||
        stage === 'FISH_SUCCESS' ||
        stage === 'FISH_TRANSFORMATION';

    const isCharging = fishingStatus === 'charging';

    // Độ cong của cần câu tính theo lực kéo hoặc trạng thái cá cắn câu
    const rodBendOffset = isPulling ? 42 : isCharging ? (power / 100) * 22 : 4;

    return (
        <div className={`fisherman-container ${isPulling ? 'pulling-active' : ''}`}>
            <svg
                viewBox="0 0 420 360"
                className="fisherman-svg"
                aria-label="Người đàn ông miền Tây đang câu cá bên bờ sông"
            >
                <defs>
                    <linearGradient id="woodDockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6b4423" />
                        <stop offset="100%" stopColor="#3a2010" />
                    </linearGradient>
                    <linearGradient id="shirtBaBaGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#9c5a3c" />
                        <stop offset="100%" stopColor="#5e321e" />
                    </linearGradient>
                    <linearGradient id="nonLaGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f6e3ba" />
                        <stop offset="60%" stopColor="#d9b372" />
                        <stop offset="100%" stopColor="#9c7438" />
                    </linearGradient>
                    <filter id="warmRimGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="-1" stdDeviation="2.5" floodColor="#ffcf70" floodOpacity="0.6" />
                    </filter>
                </defs>

                {/* Cầu gỗ miền Tây (Wooden Pier) */}
                <g className="wooden-pier">
                    <rect x="20" y="290" width="6" height="65" fill="#2c1608" />
                    <rect x="75" y="292" width="7" height="65" fill="#2c1608" />
                    <rect x="135" y="295" width="7" height="62" fill="#2c1608" />
                    <path d="M5,288 L165,295 L155,308 L0,300 Z" fill="url(#woodDockGrad)" stroke="#ffbe6b" strokeWidth="0.7" />
                    <path d="M18,284 L168,291" stroke="#8c5830" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Nhóm cơ thể nhân vật có chuyển động thở nhẹ */}
                <g className="character-body-rig" filter="url(#warmRimGlow)">
                    {/* Hai chân & ống quần xắn */}
                    <path d="M98,225 L92,272 L104,272 L108,228 Z" fill="#242938" />
                    <path d="M112,225 L118,274 L130,274 L123,225 Z" fill="#1c202b" />
                    {/* Bàn chân trần đứng trên cầu gỗ */}
                    <path d="M94,272 L94,290 L109,291 L103,285 L102,272 Z" fill="#d99b72" />
                    <path d="M119,274 L121,291 L136,292 L129,286 L128,274 Z" fill="#c58860" />

                    {/* Thân người mặc áo bà ba miền Tây */}
                    <path
                        d="M88,152 C86,178 89,205 92,230 L128,230 C130,204 128,175 122,150 Z"
                        fill="url(#shirtBaBaGrad)"
                    />
                    {/* Khăn rằn Nam Bộ vắt vai */}
                    <path
                        d="M94,150 Q108,162 122,152 L125,188 L116,189 L114,158 L98,185 L90,182 Z"
                        fill="#e8dec8"
                        stroke="#333"
                        strokeDasharray="3 2"
                        strokeWidth="1.2"
                    />

                    {/* Đầu, cổ và khuôn mặt nhìn nghiêng hiền hậu */}
                    <path d="M102,135 L104,152 L116,152 L114,135 Z" fill="#d99b72" />
                    <circle cx="111" cy="126" r="14" fill="#e0a57e" />
                    {/* Mắt, mũi và nụ cười nhẹ */}
                    <path d="M123,124 L127,128 L123,130" fill="#e0a57e" />
                    <circle cx="118" cy="123" r="1.6" fill="#2b1911" />
                    <path d="M117,132 Q121,134 123,131" stroke="#6e3b26" strokeWidth="1.3" fill="none" />

                    {/* Nón lá truyền thống */}
                    <path d="M72,122 L112,96 L152,122 Q112,129 72,122 Z" fill="url(#nonLaGrad)" stroke="#7a5724" strokeWidth="1" />
                    <path d="M84,115 Q112,120 140,115" stroke="#b38849" strokeWidth="0.8" fill="none" />
                    <path d="M96,107 Q112,111 128,107" stroke="#b38849" strokeWidth="0.8" fill="none" />

                    {/* Cánh tay và Cần câu tre (Tách nhóm riêng để xoay khi kéo cá) */}
                    <g
                        className="arm-and-rod-group"
                        style={{
                            transform: `rotate(${isPulling ? -18 : isCharging ? -(power / 100) * 10 : 0}deg)`,
                            transformOrigin: '105px 162px',
                            transition: isCharging ? 'none' : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                    >
                        {/* Cánh tay trái & phải cầm cần câu */}
                        <path
                            d="M102,158 L128,178 L152,170"
                            stroke="url(#shirtBaBaGrad)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                        <circle cx="154" cy="169" r="5.5" fill="#e0a57e" />

                        {/* Thân cần câu tre uốn cong động theo lực */}
                        <path
                            d={`M136,175 Q245,${110 - rodBendOffset * 0.5} 355,${82 + rodBendOffset}`}
                            stroke="#d4a259"
                            strokeWidth="4.2"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d={`M240,${142 - rodBendOffset * 0.25} Q300,${96 - rodBendOffset * 0.2} 355,${82 + rodBendOffset}`}
                            stroke="#ffdf9e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />

                        {/* Dây câu và phao câu */}
                        <line
                            x1="355"
                            y1={82 + rodBendOffset}
                            x2={isPulling ? '335' : '362'}
                            y2={isPulling ? '195' : '318'}
                            stroke="rgba(255, 250, 220, 0.82)"
                            strokeWidth={isPulling ? '2.2' : '1.3'}
                        />
                        {/* Phao câu đỏ trắng */}
                        {!isPulling && (
                            <g transform={`translate(362, ${312 + Math.sin(power * 0.2) * 3})`}>
                                <ellipse cx="0" cy="0" rx="3.5" ry="6" fill="#ff4d4d" />
                                <ellipse cx="0" cy="-3" rx="3" ry="2.5" fill="#ffffff" />
                            </g>
                        )}
                    </g>
                </g>
            </svg>
        </div>
    );
};