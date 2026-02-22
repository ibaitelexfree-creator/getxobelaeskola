export class WindLabAudio {
	private context: AudioContext | null = null;
	private masterGain: GainNode | null = null;

	// Wind Noise
	private windGain: GainNode | null = null;
	private windFilter: BiquadFilterNode | null = null;
	private windBuffer: AudioBuffer | null = null;
	private windSource: AudioBufferSourceNode | null = null;

	// Harmonic Drone (Efficiency)
	private droneGain: GainNode | null = null;
	private droneOscillators: OscillatorNode[] = [];
	private droneBaseFreq = 130.81; // C3

	private isInitialized = false;
	public isMuted = true; // Public for UI state

	constructor() {}

	public async init() {
		if (this.isInitialized) return;

		try {
			const AudioContextClass =
				window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContextClass) return;

			this.context = new AudioContextClass();
			this.masterGain = this.context.createGain();
			this.masterGain.connect(this.context.destination);

			// Start muted
			this.masterGain.gain.setValueAtTime(0, this.context.currentTime);

			await this.setupWindNoise();
			this.setupHarmonicDrone();

			this.isInitialized = true;
			console.log("WindLab Audio Engine Initialized 🎵");
		} catch (error) {
			console.error("Failed to initialize audio engine", error);
		}
	}

	private async setupWindNoise() {
		if (!this.context) return;

		// 2 seconds of pink noise
		const bufferSize = 2 * this.context.sampleRate;
		this.windBuffer = this.context.createBuffer(
			1,
			bufferSize,
			this.context.sampleRate,
		);
		const data = this.windBuffer.getChannelData(0);

		// Pink noise algorithm
		let b0, b1, b2, b3, b4, b5, b6;
		b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.969 * b2 + white * 0.153852;
			b3 = 0.8665 * b3 + white * 0.3104856;
			b4 = 0.55 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.016898;
			data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			data[i] *= 0.11;
			b6 = white * 0.115926;
		}

		this.windGain = this.context.createGain();
		this.windGain.gain.value = 0;

		this.windFilter = this.context.createBiquadFilter();
		this.windFilter.type = "lowpass";
		this.windFilter.frequency.value = 200; // Deep rumble start

		// Connect graph
		this.windGain.connect(this.windFilter);
		this.windFilter.connect(this.masterGain!);

		// Start Loop
		this.windSource = this.context.createBufferSource();
		this.windSource.buffer = this.windBuffer;
		this.windSource.loop = true;
		this.windSource.connect(this.windGain);
		this.windSource.start(0);
	}

	private setupHarmonicDrone() {
		if (!this.context || !this.masterGain) return;

		this.droneGain = this.context.createGain();
		this.droneGain.gain.value = 0;
		this.droneGain.connect(this.masterGain);

		// Simple Triad (Major Chord)
		// C3, E3, G3
		const ratios = [1, 1.25, 1.5];

		ratios.forEach((ratio) => {
			const osc = this.context!.createOscillator();
			osc.type = "sine"; // Pure tone
			osc.frequency.value = this.droneBaseFreq * ratio;
			osc.connect(this.droneGain!);
			osc.start();
			this.droneOscillators.push(osc);
		});
	}

	public async toggleMute(shouldMute: boolean) {
		if (!this.isInitialized) await this.init();
		if (this.context?.state === "suspended") await this.context.resume();

		if (!this.masterGain || !this.context) return;

		const time = this.context.currentTime;
		if (shouldMute) {
			this.masterGain.gain.setTargetAtTime(0, time, 0.1);
		} else {
			this.masterGain.gain.setTargetAtTime(1, time, 0.1);
		}
		this.isMuted = shouldMute;
	}

	public update(windSpeed: number, efficiency: number, isStalled: boolean) {
		if (!this.context || this.isMuted) return;
		const time = this.context.currentTime;

		// 1. Wind Noise Update
		if (this.windFilter && this.windGain) {
			// Frequency rises with wind speed (Whistling)
			// 0 kts = 100Hz, 30 kts = 1200Hz
			const newFreq = 100 + windSpeed * 40;
			this.windFilter.frequency.setTargetAtTime(newFreq, time, 0.2);

			// Gain rises with wind speed
			const newGain = Math.min(0.8, windSpeed / 40);
			this.windGain.gain.setTargetAtTime(newGain, time, 0.2);
		}

		// 2. Drone Update (Harmony)
		if (this.droneGain) {
			// Only audible when efficient > 50%
			// If stalled, silent.
			if (isStalled) {
				this.droneGain.gain.setTargetAtTime(0, time, 0.1);
			} else {
				// Efficiency 0.5 -> 0 vol
				// Efficiency 1.0 -> 0.4 vol
				const targetVol = Math.max(0, (efficiency - 0.5) * 0.8);
				this.droneGain.gain.setTargetAtTime(targetVol, time, 0.3);
			}
		}
	}

	public playWinchClick() {
		if (!this.context || this.isMuted || !this.masterGain) return;

		const osc = this.context.createOscillator();
		const gain = this.context.createGain();

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.frequency.setValueAtTime(800, this.context.currentTime);
		osc.frequency.exponentialRampToValueAtTime(
			100,
			this.context.currentTime + 0.05,
		);

		gain.gain.setValueAtTime(0.2, this.context.currentTime);
		gain.gain.exponentialRampToValueAtTime(
			0.01,
			this.context.currentTime + 0.05,
		);

		osc.start();
		osc.stop(this.context.currentTime + 0.06);
	}
}
