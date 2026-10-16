import React, { useEffect, useRef, useState } from 'react';
import { FishingStatus } from '../types/story';
import { audioManager } from '../utils/AudioManager';

interface Props {
    status: FishingStatus;
    power: number;
    setPower: React.Dispatch<React.SetStateAction<number>>;
    onStatusChange: (newStatus: FishingStatus) => void;
    onSuccessCatch: () => void;
}

// Vùng mục tiêu đủ rộng (62% -> 86%) để người chơi dễ hoàn thành và trải nghiệm trọn vẹn
const TARGET_MIN = 55;
const TARGET_MAX = 88;

export const FishingPowerMeter: React.FC<Props> = ({
    status,
    power,
    setPower,
    onStatusChange,
    onSuccessCatch
}) => {
    const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const getPromptMessage = () =>
        isTouchScreen ? 'Nhấn & giữ nút bên dưới để tích lực câu cá' : 'Nhấn và giữ phím SPACE hoặc nút bên dưới để tích lực câu';

    const [feedbackMsg, setFeedbackMsg] = useState<string>(getPromptMessage);
    const isHoldingRef = useRef<boolean>(false);
    const prevInZoneRef = useRef<boolean>(false);
    const rafRef = useRef<number | null>(null);
    const powerRef = useRef<number>(0);
    const directionRef = useRef<number>(1);
    const statusRef = useRef<FishingStatus>(status);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const inTargetZone = power >= TARGET_MIN && power <= TARGET_MAX;

    useEffect(() => {
        if (inTargetZone && !prevInZoneRef.current && isHoldingRef.current) {
            if (navigator.vibrate) navigator.vibrate(28);
        }
        prevInZoneRef.current = inTargetZone;
    }, [inTargetZone]);

    const stopChargingAndEvaluate = () => {
        if (!isHoldingRef.current) return;
        isHoldingRef.current = false;
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        const finalPower = powerRef.current;
        if (finalPower >= TARGET_MIN && finalPower <= TARGET_MAX) {
            onStatusChange('success');
            setFeedbackMsg('Tuyệt vời! Cá đã cắn câu!');
            audioManager.playSplash(true);
            if (navigator.vibrate) navigator.vibrate([40, 70, 60]);
            onSuccessCatch();
        } else {
            onStatusChange('failure');
            audioManager.playSplash(false);
            if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
            setFeedbackMsg(
                finalPower < TARGET_MIN
                    ? 'Lực hơi nhẹ! Hãy giữ lâu hơn cho cột lực chạm vào vùng cá nhé.'
                    : 'Lực hơi mạnh! Hãy thả tay ngay khi cột lực vào vùng con cá phát sáng nhé.'
            );
            setTimeout(() => {
                powerRef.current = 0;
                directionRef.current = 1;
                setPower(0);
                onStatusChange('idle');
                setFeedbackMsg(getPromptMessage());
            }, 1300);
        }
    };

    const startCharging = () => {
        if (statusRef.current === 'success' || statusRef.current === 'failure' || isHoldingRef.current) return;
        audioManager.ensureContext();
        audioManager.playCastSound();
        if (navigator.vibrate) navigator.vibrate(22);
        isHoldingRef.current = true;
        directionRef.current = 1;
        powerRef.current = 0;
        setPower(0);
        onStatusChange('charging');
        setFeedbackMsg('Canh lực vào đúng vùng con cá vàng và thả tay...');

        let lastSoundStep = 0;
        const updateLoop = () => {
            if (!isHoldingRef.current) return;

            powerRef.current += 1.35 * directionRef.current;
            if (powerRef.current >= 100) {
                powerRef.current = 100;
                directionRef.current = -1;
            } else if (powerRef.current <= 0) {
                powerRef.current = 0;
                directionRef.current = 1;
            }

            setPower(Math.round(powerRef.current));

            if (Math.abs(powerRef.current - lastSoundStep) > 7) {
                audioManager.playChargeTick(powerRef.current);
                lastSoundStep = powerRef.current;
            }

            rafRef.current = requestAnimationFrame(updateLoop);
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(updateLoop);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!e.repeat) startCharging();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                stopChargingAndEvaluate();
            }
        };
        const handleWindowBlur = () => {
            if (isHoldingRef.current) stopChargingAndEvaluate();
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        window.addEventListener('keyup', handleKeyUp, { passive: false });
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleWindowBlur);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className="fishing-ui-overlay">
            {/* Lời mời tham gia trò chơi */}
            <div className="invitation-banner">
                <h1 className="invitation-title">“Hãy giúp người đàn ông câu cá”</h1>
                <p className="invitation-subtitle">{feedbackMsg}</p>
            </div>

            {/* Thanh đo lực dọc mang phong cách Fantasy */}
            <div className={`fantasy-meter-wrapper ${inTargetZone ? 'in-sweet-spot' : ''}`}>
                <div className="meter-label">LỰC CÂU</div>
                <div className="meter-track">
                    {/* Vạch đánh dấu vùng lý tưởng (55% - 88%) */}
                    <div
                        className="meter-target-zone"
                        style={{
                            bottom: `${TARGET_MIN}%`,
                            height: `${TARGET_MAX - TARGET_MIN}%`
                        }}
                    >
                        {/* Biểu tượng con cá vector được thiết kế riêng */}
                        <svg viewBox="0 0 48 28" className="target-fish-svg">
                            <path
                                d="M6,14 C14,4 28,4 36,14 C40,9 45,6 46,6 C45,12 45,16 46,22 C45,22 40,19 36,14 C28,24 14,24 6,14 Z"
                                fill="#ffe57f"
                                stroke="#fff"
                                strokeWidth="1.2"
                            />
                            <circle cx="14" cy="12" r="1.8" fill="#3e2723" />
                        </svg>
                    </div>

                    {/* Cột năng lượng tăng dần */}
                    <div
                        className="meter-fill-bar"
                        style={{
                            height: `${power}%`
                        }}
                    />
                </div>
            </div>

            {/* Nút nhấn giữ lớn hỗ trợ cảm ứng điện thoại và chuột */}
            <div className="touch-controls-area">
                <button
                    type="button"
                    className={`hold-cast-button ${status === 'charging' ? 'is-charging' : ''}`}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        try {
                            e.currentTarget.setPointerCapture(e.pointerId);
                        } catch (_) {}
                        startCharging();
                    }}
                    onPointerUp={(e) => {
                        e.preventDefault();
                        try {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                        } catch (_) {}
                        stopChargingAndEvaluate();
                    }}
                    onPointerCancel={() => stopChargingAndEvaluate()}
                >
                    <span className="btn-glow-ring" />
                    <span className="btn-text">
                        {status === 'charging' ? 'THẢ TAY ĐỂ CHỐT LỰC!' : 'NHẤN & GIỮ ĐỂ CÂU CÁ'}
                    </span>
                </button>
            </div>
        </div>
    );
};