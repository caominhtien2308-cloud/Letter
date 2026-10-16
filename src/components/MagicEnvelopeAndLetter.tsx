import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { DEFAULT_LETTER_CONTENT, StoryStage } from '../types/story';
import { audioManager } from '../utils/AudioManager';
import '../styles/magicLetter.css';

interface Props {
  stage: StoryStage;
  onAdvanceStage: (next: StoryStage) => void;
  onTriggerFireworks: () => void;
}

export const MagicEnvelopeAndLetter: React.FC<Props> = ({
  stage,
  onAdvanceStage,
  onTriggerFireworks
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rig3DRef = useRef<HTMLDivElement>(null);
  const envelopeShellRef = useRef<HTMLDivElement>(null);
  const topFlapRef = useRef<HTMLDivElement>(null);
  const innerGlowRef = useRef<HTMLDivElement>(null);
  const waxSealRef = useRef<HTMLDivElement>(null);
  const sealGearRef = useRef<SVGGElement>(null);
  const leftCordRef = useRef<SVGPathElement>(null);
  const rightCordRef = useRef<SVGPathElement>(null);

  // Ref cho tờ giấy và các nếp gấp 3D
  const letterCarrierRef = useRef<HTMLDivElement>(null);
  const topFoldRef = useRef<HTMLDivElement>(null);
  const bottomFoldRef = useRef<HTMLDivElement>(null);

  const [isFullyOpened, setIsFullyOpened] = useState(false);

  // Tạo sẵn 28 hạt bụi phép thuật vàng để bung nổ khi con dấu sáp tan biến
  const sealSparks = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.25;
      const distance = 65 + Math.random() * 95;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 0.12
      };
    });
  }, []);

  useEffect(() => {
    if (stage !== 'LETTER_OPENING') return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' }
      });

      // Thiết lập trạng thái khởi đầu: Phong thư đóng kín, giấy nằm gọn bên trong túi thư (zIndex = 2)
      gsap.set(rig3DRef.current, {
        scale: 0.45,
        rotationX: 32,
        rotationY: -28,
        rotationZ: -8,
        z: -350,
        opacity: 0
      });
      gsap.set(topFlapRef.current, { rotationX: 0, zIndex: 6 });
      gsap.set(letterCarrierRef.current, {
        y: 28,
        scaleX: 0.86,
        scaleY: 0.44,
        z: 2,
        zIndex: 2,
        opacity: 1
      });
      gsap.set(topFoldRef.current, { rotationX: -85 });
      gsap.set(bottomFoldRef.current, { rotationX: 85 });
      gsap.set('.letter-stagger-line', { opacity: 0, y: 16, filter: 'blur(4px)' });

      // BƯỚC 1: Phong thư bay lượn 3D từ không gian vào giữa màn hình và nghiêng đón sáng
      tl.to(rig3DRef.current, {
        scale: 1,
        rotationX: 8,
        rotationY: 12,
        rotationZ: 2,
        z: 0,
        opacity: 1,
        duration: 1.35,
        ease: 'power3.out'
      }).to(rig3DRef.current, {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.75,
        ease: 'sine.inOut'
      });

      // BƯỚC 2: Bánh răng đồng hồ thiên văn xoay mở khóa -> Dây vàng rút mở -> Con dấu vỡ thành hạt sáng
      tl.to(
        sealGearRef.current,
        {
          rotation: 240,
          transformOrigin: '50% 50%',
          duration: 0.85,
          ease: 'back.inOut(1.6)',
          onStart: () => audioManager.playMagicChime()
        },
        '-=0.2'
      )
        .to(
          waxSealRef.current,
          {
            scale: 1.25,
            filter: 'brightness(1.85) drop-shadow(0 0 28px #ffd54f)',
            duration: 0.4,
            ease: 'power2.in'
          },
          '-=0.35'
        )
        // Rút 2 sợi dây thừng vàng chéo trên bìa thư
        .to(
          [leftCordRef.current, rightCordRef.current],
          {
            strokeDashoffset: 360,
            opacity: 0,
            duration: 0.55,
            ease: 'power2.inOut'
          },
          '<'
        )
        // Bung nổ 28 hạt bụi vàng từ tâm con dấu
        .fromTo(
          '.seal-spark-particle',
          { x: 0, y: 0, scale: 0, opacity: 1 },
          {
            x: (i) => sealSparks[i].tx,
            y: (i) => sealSparks[i].ty,
            scale: 1.2,
            opacity: 0,
            duration: 0.85,
            stagger: 0.008,
            ease: 'power3.out'
          },
          '-=0.15'
        )
        .to(
          waxSealRef.current,
          {
            scale: 0,
            opacity: 0,
            duration: 0.28,
            ease: 'back.in(2)'
          },
          '<'
        );

      // BƯỚC 3: Nắp phong thư mở lật 3D (Từ 0 -> 90 độ giữ zIndex 6, từ 90 -> 180 độ hạ zIndex xuống 1)
      tl.to(
        topFlapRef.current,
        {
          rotationX: 90,
          duration: 0.48,
          ease: 'power2.in',
          onComplete: () => {
            // Đổi zIndex ngay điểm 90 độ để tờ giấy khi rút lên sẽ nằm đè lên mặt trong của nắp thư
            gsap.set(topFlapRef.current, { zIndex: 1 });
          }
        },
        '-=0.45'
      )
        .to(topFlapRef.current, {
          rotationX: 180,
          duration: 0.58,
          ease: 'back.out(1.4)'
        })
        // Ánh sáng vàng dịu từ bên trong túi thư bừng lên
        .to(
          innerGlowRef.current,
          {
            opacity: 1,
            scale: 1.25,
            duration: 0.65,
            ease: 'power2.out'
          },
          '-=0.8'
        );

      // BƯỚC 4: Rút tờ giấy trượt từ trong túi phong thư lên cao (Lúc này giấy vẫn kẹp sau túi trước zIndex = 4)
      tl.to(
        letterCarrierRef.current,
        {
          y: -235,
          scaleY: 0.68,
          rotationZ: -1.5,
          duration: 1.05,
          ease: 'power3.inOut',
          onStart: () => audioManager.playMagicChime()
        },
        '-=0.25'
      );

      // BƯỚC 5: Chuyển lớp Z-Index đưa tờ giấy ra tiền cảnh & Đẩy vỏ phong thư lùi xuống hậu cảnh
      tl.add(() => {
        gsap.set(letterCarrierRef.current, { zIndex: 15 });
      })
        .to(
          envelopeShellRef.current,
          {
            y: 165,
            z: -160,
            rotationX: 22,
            scale: 0.82,
            opacity: 0.42,
            duration: 1.1,
            ease: 'power3.inOut'
          },
          '+=0.05'
        )
        // Đồng thời đưa tờ giấy về chính giữa màn hình và bung rộng kích thước
        .to(
          letterCarrierRef.current,
          {
            y: 0,
            z: 40,
            rotationZ: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 1.15,
            ease: 'power3.out'
          },
          '<'
        )
        // BƯỚC 6: Mở phẳng các nếp gấp giấy 3D
        .to(
          [topFoldRef.current, bottomFoldRef.current],
          {
            rotationX: 0,
            duration: 0.95,
            ease: 'Back.easeOut.config(1.2)'
          },
          '-=0.85'
        );

      // BƯỚC 7: Từng dòng chữ lời chúc buổi chiều và nút xác nhận hiện lên mượt mà
      tl.to(
        '.letter-stagger-line',
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            setIsFullyOpened(true);
            onAdvanceStage('LETTER_READ');
          }
        },
        '-=0.3'
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [stage, sealSparks]);

  const handleConfirmRead = () => {
    if (!isFullyOpened) return;
    if (navigator.vibrate) navigator.vibrate(40);
    setIsFullyOpened(false);
    onTriggerFireworks();
  };

  return (
    <div
      ref={sceneRef}
      className={`magic-letter-viewport ${
        stage === 'COCONUT_FIREWORKS' || stage === 'ENDING' ? 'is-celebrating-mode' : ''
      }`}
    >
      <div ref={rig3DRef} className="letter-3d-rig">
        {/* ================= KHỐI VỎ PHONG THƯ 3D (ENVELOPE SHELL) ================= */}
        <div ref={envelopeShellRef} className="envelope-shell-3d">
          {/* 1. Mặt lưng trong của phong thư (z-index: 1) */}
          <div className="envelope-back-plate" />

          {/* 2. Luồng sáng phép thuật phát ra từ lòng phong thư (z-index: 2) */}
          <div ref={innerGlowRef} className="envelope-inner-magic-glow" />

          {/* 3. Hai vạt gấp chéo hai bên và túi trước của phong thư (z-index: 4 - Che tờ giấy khi đang rút) */}
          <div className="envelope-pocket-front">
            <svg viewBox="0 0 440 280" className="pocket-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="leftFlapGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f3dfb9" />
                  <stop offset="55%" stopColor="#d1ad72" />
                  <stop offset="100%" stopColor="#9c7538" />
                </linearGradient>
                <linearGradient id="rightFlapGrad" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f3dfb9" />
                  <stop offset="55%" stopColor="#c8a165" />
                  <stop offset="100%" stopColor="#946d30" />
                </linearGradient>
                <linearGradient id="bottomFlapGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="#f9e8c8" />
                  <stop offset="45%" stopColor="#dfc088" />
                  <stop offset="100%" stopColor="#ad8344" />
                </linearGradient>
              </defs>

              {/* Vạt gấp bên trái */}
              <polygon
                points="0,0 220,150 0,280"
                fill="url(#leftFlapGrad)"
                stroke="#ffe599"
                strokeWidth="1.2"
              />
              {/* Vạt gấp bên phải */}
              <polygon
                points="440,0 220,150 440,280"
                fill="url(#rightFlapGrad)"
                stroke="#ffe599"
                strokeWidth="1.2"
              />
              {/* Vạt gấp đáy phong thư */}
              <polygon
                points="0,280 220,132 440,280"
                fill="url(#bottomFlapGrad)"
                stroke="#ffecb3"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* 4. Nắp trên của phong thư có 2 mặt Trước/Sau lật 3D (Bắt đầu ở z-index: 6) */}
          <div ref={topFlapRef} className="envelope-top-flap-3d">
            {/* Mặt ngoài nắp thư (Khi đang đóng) */}
            <div className="flap-face flap-outer-face">
              <svg viewBox="0 0 440 165" className="flap-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="topOuterGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#e3c387" />
                    <stop offset="65%" stopColor="#f8e6c2" />
                    <stop offset="100%" stopColor="#c79b56" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,0 L440,0 L236,154 Q220,165 204,154 Z"
                  fill="url(#topOuterGrad)"
                  stroke="#ffe699"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Mặt lót bên trong nắp thư (Hiện ra khi lật mở 180 độ) */}
            <div className="flap-face flap-inner-face">
              <svg viewBox="0 0 440 165" className="flap-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="topInnerGrad" x1="0.5" y1="1" x2="0.5" y2="0">
                    <stop offset="0%" stopColor="#b88d48" />
                    <stop offset="100%" stopColor="#ebd3a7" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,0 L440,0 L236,154 Q220,165 204,154 Z"
                  fill="url(#topInnerGrad)"
                  stroke="#ffd54f"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* 5. Hai sợi dây thừng vàng kim buộc chéo (Bám sát Ảnh mẫu 1) */}
          <svg viewBox="0 0 440 280" className="golden-cords-svg">
            <path
              ref={leftCordRef}
              d="M175,0 L220,142 L205,280"
              stroke="#d4af37"
              strokeWidth="4.5"
              strokeDasharray="360"
              strokeDashoffset="0"
              fill="none"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
            />
            <path
              ref={rightCordRef}
              d="M265,0 L220,142 L235,280"
              stroke="#ffd54f"
              strokeWidth="4"
              strokeDasharray="360"
              strokeDashoffset="0"
              fill="none"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
            />
          </svg>

          {/* 6. Con dấu sáp xanh lam chạm bánh răng đồng hồ thiên văn + Hạt bụi vàng */}
          <div className="wax-seal-anchor">
            {/* Hệ thống hạt sáng nổ ra khi mở phong ấn */}
            <div className="seal-sparks-container">
              {sealSparks.map((sp) => (
                <span
                  key={sp.id}
                  className="seal-spark-particle"
                  style={{ width: `${sp.size}px`, height: `${sp.size}px` }}
                />
              ))}
            </div>

            <div ref={waxSealRef} className="celestial-wax-seal-3d">
              <svg viewBox="0 0 110 110" className="wax-seal-detail-svg">
                <defs>
                  <radialGradient id="blueWaxGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#4fc3f7" />
                    <stop offset="45%" stopColor="#1565c0" />
                    <stop offset="85%" stopColor="#0d2b52" />
                    <stop offset="100%" stopColor="#07172e" />
                  </radialGradient>
                </defs>
                {/* Viền sáp lượn sóng tự nhiên */}
                <path
                  d="M55,6 C68,6 74,14 85,19 C96,24 103,35 103,48 C103,61 98,71 91,82 C84,93 70,103 55,103 C40,103 27,94 19,83 C11,72 7,61 7,48 C7,35 15,24 26,18 C37,12 42,6 55,6 Z"
                  fill="url(#blueWaxGrad)"
                  stroke="#90caf9"
                  strokeWidth="2"
                />
                <circle cx="55" cy="55" r="34" fill="#0a1e3c" stroke="#f59e0b" strokeWidth="2.2" />

                {/* Nhóm bánh răng & kim đồng hồ vàng xoay khi mở khóa */}
                <g ref={sealGearRef}>
                  <circle
                    cx="55"
                    cy="55"
                    r="28"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeDasharray="6 4"
                  />
                  <circle cx="55" cy="55" r="20" fill="none" stroke="#fde047" strokeWidth="1.4" />
                  <line x1="55" y1="55" x2="55" y2="31" stroke="#fef08a" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="55" y1="55" x2="72" y2="55" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="55" cy="55" r="4.5" fill="#fef08a" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ================= TỜ GIẤY THƯ ĐƯỢC RÚT LÊN & MỞ NẾP GẤP 3D ================= */}
        <div ref={letterCarrierRef} className="letter-sheet-carrier">
          <div className="parchment-paper-card">
            {/* Nếp gấp 3D phía trên */}
            <div ref={topFoldRef} className="paper-fold-panel top-fold-wing" />

            {/* Khung viền trang trí hoa văn miền Tây & Nội dung bức thư */}
            <div className="parchment-ornate-frame">
              {/* Hoa văn góc giấy */}
              <span className="corner-ornament tl" />
              <span className="corner-ornament tr" />
              <span className="corner-ornament bl" />
              <span className="corner-ornament br" />

              <div className="letter-stagger-line letter-crest-header">
                ✦ Lá Thư Chiều Đồng Tháp ✦
              </div>

              <div className="letter-scroll-body">
                {DEFAULT_LETTER_CONTENT.paragraphs.map((text, index) => (
                  <p key={index} className="letter-stagger-line letter-paragraph">
                    {text}
                  </p>
                ))}

                <p className="letter-stagger-line letter-signature-line">
                  {DEFAULT_LETTER_CONTENT.signature}
                </p>
              </div>

              <div className="letter-stagger-line letter-action-footer">
                <button
                  type="button"
                  disabled={!isFullyOpened}
                  onClick={handleConfirmRead}
                  className={`confirm-read-luxury-btn ${isFullyOpened ? 'is-interactive' : ''}`}
                >
                  <span>Đã đọc thư</span>
                </button>
              </div>
            </div>

            {/* Nếp gấp 3D phía dưới */}
            <div ref={bottomFoldRef} className="paper-fold-panel bottom-fold-wing" />
          </div>
        </div>
      </div>
    </div>
  );
};