import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { StoryStage } from '../types/story';
import { audioManager } from '../utils/AudioManager';

interface Props {
    stage: StoryStage;
    onAdvanceStage: (next: StoryStage) => void;
}

export const GalaxyAndDescentScene: React.FC<Props> = ({ stage, onAdvanceStage }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const flashOverlayRef = useRef<HTMLDivElement>(null);
    const cloudTunnelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050314, 0.0018);

        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 18, 95);
        camera.lookAt(0, 0, 0);

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
        } catch {
            // Fallback nếu WebGL không khả dụng
            const timer = setTimeout(() => onAdvanceStage('RIVER_SCENE'), 2000);
            return () => clearTimeout(timer);
        }

        // 1. Tạo Thiên Hà Xoắn Ốc (Lấy cảm hứng từ Ảnh 3: Lõi Cyan sáng rực, cánh tay xoắn Tím/Hồng/Cam)
        const isMobile = window.innerWidth < 768;
        const starCount = isMobile ? 6500 : 14000;
        const galaxyGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const colorCore = new THREE.Color('#68e8ff');   // Xanh cyan lõi sáng
        const colorInner = new THREE.Color('#f7a8e8');  // Hồng tinh vân
        const colorMid = new THREE.Color('#8e44ec');    // Tím vũ trụ
        const colorOuter = new THREE.Color('#d97736');  // Cam bụi vũ trụ

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = Math.pow(Math.random(), 1.6) * 85;
            const spinAngle = radius * 0.14;
            const branchAngle = ((i % 4) / 4) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 8;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 4;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 8;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorCore.clone();
            const ratio = radius / 85;
            if (ratio < 0.2) {
                mixedColor.lerp(colorInner, ratio / 0.2);
            } else if (ratio < 0.65) {
                mixedColor.copy(colorInner).lerp(colorMid, (ratio - 0.2) / 0.45);
            } else {
                mixedColor.copy(colorMid).lerp(colorOuter, (ratio - 0.65) / 0.35);
            }

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const galaxyMat = new THREE.PointsMaterial({
            size: isMobile ? 0.55 : 0.42,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.92,
            depthWrite: false
        });

        const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
        galaxyPoints.rotation.x = 0.55;
        scene.add(galaxyPoints);

        // 2. Tâm sáng Cyan phát quang (Core Glow Sphere)
        const coreGeo = new THREE.SphereGeometry(5.2, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x7ef4ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        scene.add(coreMesh);

        // 3. Sao băng (Shooting Stars)
        const shootingStarGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-8, -3, 0)
        ]);
        const shootingStarMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        const shootingStar = new THREE.Line(shootingStarGeo, shootingStarMat);
        shootingStar.position.set(45, 25, -20);
        scene.add(shootingStar);

        // 4. Vòng chân trời Trái Đất ẩn phía xa (sẽ hiện rõ khi lao xuống)
        const earthGeo = new THREE.SphereGeometry(32, 48, 48);
        const earthMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0
        });
        const earthMesh = new THREE.Mesh(earthGeo, earthMat);
        earthMesh.position.set(0, -34, -40);
        scene.add(earthMesh);

        let reqId: number;
        let warpSpeed = 0.0025;

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            galaxyPoints.rotation.y += warpSpeed;
            shootingStar.position.x -= 0.7;
            shootingStar.position.y -= 0.26;
            if (shootingStar.position.x < -70) {
                shootingStar.position.set(60 + Math.random() * 30, 25 + Math.random() * 15, -20);
            }
            renderer.render(scene, camera);
        };
        animate();

        // 5. Timeline điều khiển Giai đoạn 1: Du hành vũ trụ -> Xoay lốc xoáy -> Lao qua mây xuống Đồng Tháp
        const tl = gsap.timeline();

        // Giai đoạn bay chậm ngắm thiên hà (3.2 giây đầu)
        tl.to(camera.position, {
            z: 58,
            y: 11,
            duration: prefersReducedMotion ? 1.5 : 3.2,
            ease: 'sine.inOut',
            onComplete: () => {
                onAdvanceStage('EARTH_DESCENT');
                audioManager.playWarpSound();
            }
        });

        // Bắt đầu xoay tròn gia tốc lao vào tâm sáng
        tl.to(
            camera.position,
            {
                z: 3,
                y: 0.5,
                duration: prefersReducedMotion ? 1.5 : 2.6,
                ease: 'power3.in',
                onUpdate: () => {
                    warpSpeed = Math.min(0.065, warpSpeed + 0.0014);
                    camera.rotation.z += prefersReducedMotion ? 0.005 : 0.028;
                }
            },
            '>'
        );

        // Làm rõ chân trời Trái Đất và tầng mây ánh nắng chiều
        tl.to(
            earthMat,
            {
                opacity: 0.75,
                duration: 1.4,
                ease: 'power2.in'
            },
            '<-1.2'
        );

        // Hiệu ứng xuyên tầng mây trắng - vàng cam và chuyển mượt sang cảnh sông Đồng Tháp
        tl.to(
            cloudTunnelRef.current,
            {
                opacity: 1,
                scale: 1.35,
                duration: 1.1,
                ease: 'power2.in'
            },
            '-=0.9'
        );

        tl.to(
            flashOverlayRef.current,
            {
                opacity: 1,
                duration: 0.65,
                ease: 'power2.inOut',
                onComplete: () => {
                    onAdvanceStage('RIVER_SCENE');
                }
            },
            '-=0.35'
        );

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(reqId);
            tl.kill();
            galaxyGeo.dispose();
            galaxyMat.dispose();
            coreGeo.dispose();
            coreMat.dispose();
            earthGeo.dispose();
            earthMat.dispose();
            renderer.dispose();
        };
    }, []);

    if (stage !== 'GALAXY' && stage !== 'EARTH_DESCENT') return null;

    return (
        <div className="galaxy-stage-wrapper">
            <div ref={mountRef} className="webgl-canvas-mount" />
            <div ref={cloudTunnelRef} className="cloud-descent-layer" />
            <div ref={flashOverlayRef} className="warm-sunset-transition-veil" />
            <div className="galaxy-caption">
                {stage === 'GALAXY' ? 'Đang du hành qua dải ngân hà huyền ảo...' : 'Xuyên qua tầng mây về miền sông nước Đồng Tháp...'}
            </div>
        </div>
    );
};