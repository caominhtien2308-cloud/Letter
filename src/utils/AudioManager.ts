class SoundEngine {
    private ctx: AudioContext | null = null;
    public enabled: boolean = true;
    private ambientGain: GainNode | null = null;
    private ambientInterval: any = null;
    private droneNodes: (AudioNode & { stop?: () => void })[] = [];

    public ensureContext(): void {
        try {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().then(() => {
                    if (this.enabled) this.startAmbient();
                }).catch(() => {});
            } else if (this.ctx && this.ctx.state === 'running' && this.enabled && !this.ambientGain) {
                this.startAmbient();
            }
        } catch (_) {}
    }

    public initAndToggle(): boolean {
        this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
            this.enabled = true;
            this.startAmbient();
            return true;
        }
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.startAmbient();
        } else {
            this.stopAmbient();
        }
        return this.enabled;
    }

    public startAmbient(): void {
        if (!this.enabled || !this.ctx || this.ambientGain) return;
        try {
            const master = this.ctx.createGain();
            master.gain.setValueAtTime(0.01, this.ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3);
            master.connect(this.ctx.destination);
            this.ambientGain = master;

            // 1. Drone ấm áp hoàng hôn (Hợp âm D trầm 73.4Hz + 110Hz + 146.8Hz)
            const freqs = [73.42, 110.0, 146.83];
            freqs.forEach((f) => {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, this.ctx.currentTime);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(260, this.ctx.currentTime);
                g.gain.setValueAtTime(0.04, this.ctx.currentTime);

                osc.connect(filter);
                filter.connect(g);
                g.connect(master);
                osc.start();
                this.droneNodes.push(osc);
            });

            // 2. Tiếng nước gợn sóng lăn tăn (Gió nước êm đềm)
            const bufSize = Math.floor(this.ctx.sampleRate * 2);
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            noise.loop = true;

            const waterFilter = this.ctx.createBiquadFilter();
            waterFilter.type = 'bandpass';
            waterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
            waterFilter.Q.setValueAtTime(4, this.ctx.currentTime);

            const waterGain = this.ctx.createGain();
            waterGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

            noise.connect(waterFilter);
            waterFilter.connect(waterGain);
            waterGain.connect(master);
            noise.start();
            this.droneNodes.push(noise);

            // 3. Chuông ngũ cung thư giãn rơi nhẹ mỗi 4.2 giây
            const pentatonic = [293.66, 329.63, 392.0, 440.0, 493.88, 587.33];
            const playRandomBell = () => {
                if (!this.enabled || !this.ctx || !this.ambientGain) return;
                try {
                    const now = this.ctx.currentTime;
                    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
                    const bellOsc = this.ctx.createOscillator();
                    const bellGain = this.ctx.createGain();

                    bellOsc.type = 'sine';
                    bellOsc.frequency.setValueAtTime(freq, now);
                    bellGain.gain.setValueAtTime(0.06, now);
                    bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 2.2);

                    bellOsc.connect(bellGain);
                    bellGain.connect(master);
                    bellOsc.start(now);
                    bellOsc.stop(now + 2.2);
                } catch (_) {}
            };

            this.ambientInterval = setInterval(playRandomBell, 4200);
        } catch (_) {}
    }

    public stopAmbient(): void {
        try {
            if (this.ambientInterval) {
                clearInterval(this.ambientInterval);
                this.ambientInterval = null;
            }
            if (this.ambientGain && this.ctx) {
                this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                setTimeout(() => {
                    this.droneNodes.forEach((node) => {
                        try { node.stop?.(); } catch (_) {}
                    });
                    this.droneNodes = [];
                    this.ambientGain = null;
                }, 550);
            }
        } catch (_) {}
    }

    public playWarpSound(): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.exponentialRampToValueAtTime(420, now + 2.5);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 2.8);
        } catch (_) {}
    }

    public playCastSound(): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (_) {}
    }

    public playChargeTick(powerPercent: number): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220 + powerPercent * 4.5, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.07);
        } catch (_) {}
    }

    public playSplash(isSuccess: boolean): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(isSuccess ? 900 : 400, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch (_) {}
    }

    public playMagicChime(): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
            notes.forEach((freq, idx) => {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const startTime = now + idx * 0.09;
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.14, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.75);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.75);
            });
        } catch (_) {}
    }

    public playFireworkPop(): void {
        this.ensureContext();
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            // 1. Tiếng rít tên lửa vút lên
            const whistle = this.ctx.createOscillator();
            const whistleGain = this.ctx.createGain();
            whistle.type = 'sine';
            whistle.frequency.setValueAtTime(350, now);
            whistle.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
            whistleGain.gain.setValueAtTime(0.08, now);
            whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            whistle.connect(whistleGain);
            whistleGain.connect(this.ctx.destination);
            whistle.start(now);
            whistle.stop(now + 0.18);

            // 2. Tiếng nổ trầm vang (Boom bass)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260 + Math.random() * 180, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.38);
            gain.gain.setValueAtTime(0.25, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + 0.08);
            osc.stop(now + 0.38);

            // 3. Tiếng lách tách hoa lửa tàn (Crackle)
            const crackleLen = Math.floor(this.ctx.sampleRate * 0.3);
            const crackleBuffer = this.ctx.createBuffer(1, crackleLen, this.ctx.sampleRate);
            const cd = crackleBuffer.getChannelData(0);
            for (let i = 0; i < crackleLen; i++) {
                cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackleLen * 0.4));
            }
            const noiseSrc = this.ctx.createBufferSource();
            noiseSrc.buffer = crackleBuffer;
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.18, now + 0.12);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            noiseSrc.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noiseSrc.start(now + 0.12);
        } catch (_) {}
    }
}

export const audioManager = new SoundEngine();