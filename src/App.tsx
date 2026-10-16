import React, { useEffect, useState } from 'react';
import { FishingStatus, StoryStage } from './types/story';
import { GalaxyAndDescentScene } from './components/GalaxyAndDescentScene';
import { DongThapRiverScene } from './components/DongThapRiverScene';
import { FishingPowerMeter } from './components/FishingPowerMeter';
import { TransformationSequence } from './components/TransformationSequence';
import { MagicEnvelopeAndLetter } from './components/MagicEnvelopeAndLetter';
import { CoconutFireworksCanvas } from './components/CoconutFireworksCanvas';
import { audioManager } from './utils/AudioManager';
import './styles/global.css';

export const App: React.FC = () => {
    const [stage, setStage] = useState<StoryStage>('GALAXY');
    const [fishingStatus, setFishingStatus] = useState<FishingStatus>('idle');
    const [power, setPower] = useState<number>(0);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [storyKey, setStoryKey] = useState<number>(0);

    // Khi cảnh sông Đồng Tháp xuất hiện xong, tự động bật giao diện mời câu cá
    useEffect(() => {
        if (stage === 'RIVER_SCENE') {
            const timer = setTimeout(() => {
                setStage('FISHING');
            }, 1100);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleToggleAudio = () => {
        const active = audioManager.initAndToggle();
        setSoundEnabled(active);
    };

    const handleRestartStory = () => {
        setPower(0);
        setFishingStatus('idle');
        setStage('GALAXY');
        setStoryKey((prev) => prev + 1);
    };

    const showRiverWorld = stage !== 'GALAXY';
    const showTransformSequence =
        stage === 'FISH_SUCCESS' ||
        stage === 'FISH_TRANSFORMATION' ||
        stage === 'MONKEY_SPIN' ||
        stage === 'ENVELOPE_TRANSFORMATION';

    const showEnvelopeAndLetter =
        stage === 'LETTER_OPENING' ||
        stage === 'LETTER_READ' ||
        stage === 'COCONUT_FIREWORKS' ||
        stage === 'ENDING';

    return (
        <main key={storyKey} className="magical-story-viewport">
            {/* Nút bật/tắt âm thanh tùy chọn (Không tự động phát gây giật mình) */}
            <button
                type="button"
                onClick={handleToggleAudio}
                className="sound-toggle-pill"
                aria-label="Bật hoặc tắt âm thanh môi trường"
            >
                {soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
            </button>

            {/* Giai đoạn 1: Du hành thiên hà & lao xuyên mây xuống Trái Đất */}
            <GalaxyAndDescentScene stage={stage} onAdvanceStage={setStage} />

            {/* Giai đoạn 2: Khung cảnh sông nước Đồng Tháp & người đàn ông câu cá */}
            {showRiverWorld && (
                <DongThapRiverScene stage={stage} fishingStatus={fishingStatus} power={power} />
            )}

            {/* Giai đoạn 3: Lời mời tham gia & thanh đo lực câu cá */}
            {stage === 'FISHING' && (
                <FishingPowerMeter
                    status={fishingStatus}
                    power={power}
                    setPower={setPower}
                    onStatusChange={setFishingStatus}
                    onSuccessCatch={() => {
                        setTimeout(() => setStage('FISH_SUCCESS'), 350);
                    }}
                />
            )}

            {/* Giai đoạn 4: Cá nhảy -> Khỉ lông vàng xoay 2 vòng -> Phong thư */}
            {showTransformSequence && (
                <TransformationSequence stage={stage} onAdvanceStage={setStage} />
            )}

            {/* Giai đoạn 5: Phong thư mở 3D & Nội dung lời chúc buổi chiều */}
            {showEnvelopeAndLetter && (
                <MagicEnvelopeAndLetter
                    stage={stage}
                    onAdvanceStage={setStage}
                    onTriggerFireworks={() => setStage('COCONUT_FIREWORKS')}
                />
            )}

            {/* Giai đoạn 6: Mưa dừa xanh & Pháo hoa 5 giây + Màn hình kết thúc */}
            {(stage === 'COCONUT_FIREWORKS' || stage === 'ENDING') && (
                <CoconutFireworksCanvas
                    stage={stage}
                    onAdvanceStage={setStage}
                    onRestartStory={handleRestartStory}
                />
            )}
        </main>
    );
};

export default App;