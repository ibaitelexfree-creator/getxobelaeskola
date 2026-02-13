export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    // Nodes
    private windNode: OscillatorNode | null = null;
    private windGain: GainNode | null = null;
    private windFilter: BiquadFilterNode | null = null;

    private waterNode: AudioBufferSourceNode | null = null; // We'll synthesize noise
    private waterGain: GainNode | null = null;

    private luffNode: AudioBufferSourceNode | null = null;
    private luffGain: GainNode | null = null;

    private isInitialized: boolean = false;
    private isMuted: boolean = false;

    constructor() {
        // We wait for user interaction to init, usually provided by the main component
    }

    public async init() {
        if (this.isInitialized) return;

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // Master volume
            this.masterGain.connect(this.ctx.destination);

            this.setupWind();
            this.setupWater();

            this.isInitialized = true;

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
        } catch (e) {
            console.error("Audio init failed:", e);
        }
    }

    private createNoiseBuffer(): AudioBuffer | null {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    private setupWind() {
        if (!this.ctx || !this.masterGain) return;

        // Pink Noise approximation (or just filtered white noise)
        // Actually, simple filtered noise is good for wind
        const buffer = this.createNoiseBuffer();
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.value = 200; // Muffeled start

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0;

        source.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        source.start();
        // save ref? source is fire and forget if looping but we might want to stop it?
        // Actually we need to keep potential reference if we destroy, but usually GC handles it if we disconnect?
        // Better to track it.
        (this as any).windSource = source;
    }

    private setupWater() {
        if (!this.ctx || !this.masterGain) return;

        const buffer = this.createNoiseBuffer();
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Bandpass for water wash
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;

        this.waterGain = this.ctx.createGain();
        this.waterGain.gain.value = 0;

        source.connect(filter);
        filter.connect(this.waterGain);
        this.waterGain.connect(this.masterGain);

        source.start();
        (this as any).waterSource = source;
    }

    public update(speed: number, apparentWindSpeed: number, sailEfficiency: number) {
        if (!this.ctx || !this.isInitialized) return;

        // Sanitize inputs
        const s = Number.isFinite(speed) ? speed : 0;
        const aws = Number.isFinite(apparentWindSpeed) ? apparentWindSpeed : 0;

        // Wind
        // Apparent Wind Speed typically 0 to 20+
        if (this.windGain && this.windFilter) {
            const windVol = Math.min(1.0, aws / 20);
            const windFreq = 200 + (aws * 30); // Pitch up with speed

            // Smooth transitions
            this.windGain.gain.setTargetAtTime(windVol * 0.4, this.ctx.currentTime, 0.1);
            this.windFilter.frequency.setTargetAtTime(windFreq, this.ctx.currentTime, 0.1);
        }

        // Water
        if (this.waterGain) {
            const waterVol = Math.min(1.0, s / 10); // Boat speed 0-10ish
            this.waterGain.gain.setTargetAtTime(waterVol * 0.3, this.ctx.currentTime, 0.1);
        }

        // Luffing (Flapping)
        // If efficiency is low and wind is high -> Flap
        // We can simulate flapping by modulating noise gain quickly? 
        // Or just playing a specific sound. 
        // For procedural, we can use an oscillator to modulate gain (Tremolo)
        // Implementing simple version:
        /*
        if (sailEfficiency < 0.5 && apparentWindSpeed > 5) {
             // trigger flap? complex to do procedurally well without dedicated nodes
        }
        */
    }

    public dispose() {
        if (this.ctx) {
            this.ctx.close();
            this.isInitialized = false;
        }
    }
}
