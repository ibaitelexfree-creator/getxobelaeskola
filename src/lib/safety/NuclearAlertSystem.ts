export class NuclearAlertSystem {
	private context: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private oscillators: OscillatorNode[] = [];
	private isPlaying = false;

	private init() {
		if (this.context) return;
		const AudioContextClass =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContextClass) return;
		this.context = new AudioContextClass();
		this.masterGain = this.context.createGain();
		this.masterGain.connect(this.context.destination);
	}

	public async start() {
		if (this.isPlaying) return;
		this.init();
		if (!this.context || !this.masterGain) return;

		if (this.context.state === "suspended") {
			await this.context.resume();
		}

		this.isPlaying = true;
		this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
		this.masterGain.gain.linearRampToValueAtTime(
			0.8,
			this.context.currentTime + 0.1,
		);

		// Siren 1: High frequency rising and falling (Pitched up)
		const osc1 = this.context.createOscillator();
		osc1.type = "sawtooth";
		osc1.frequency.setValueAtTime(1000, this.context.currentTime);

		const mod = this.context.createOscillator();
		mod.type = "sine";
		mod.frequency.value = 0.8;
		const modGain = this.context.createGain();
		modGain.gain.value = 500;

		mod.connect(modGain);
		modGain.connect(osc1.frequency);
		osc1.connect(this.masterGain);

		// Siren 2: Harsh discordance (Square wave)
		const osc2 = this.context.createOscillator();
		osc2.type = "square";
		osc2.frequency.setValueAtTime(440, this.context.currentTime);

		const mod2 = this.context.createOscillator();
		mod2.type = "sawtooth";
		mod2.frequency.value = 4; // Fast jitter
		const modGain2 = this.context.createGain();
		modGain2.gain.value = 300;

		mod2.connect(modGain2);
		modGain2.connect(osc2.frequency);
		osc2.connect(this.masterGain);

		// Siren 3: Ultrafast tremolo for "nuclear" feel
		const osc3 = this.context.createOscillator();
		osc3.type = "triangle";
		osc3.frequency.setValueAtTime(2000, this.context.currentTime);
		const tremolo = this.context.createGain();
		const tremoloOsc = this.context.createOscillator();
		tremoloOsc.frequency.value = 20;
		tremoloOsc.connect(tremolo.gain);
		osc3.connect(tremolo);
		tremolo.connect(this.masterGain);

		osc1.start();
		mod.start();
		osc2.start();
		mod2.start();
		osc3.start();
		tremoloOsc.start();

		this.oscillators = [osc1, mod, osc2, mod2, osc3, tremoloOsc];
	}

	public stop() {
		if (!this.isPlaying || !this.context || !this.masterGain) return;

		const stopTime = this.context.currentTime + 0.5;
		this.masterGain.gain.linearRampToValueAtTime(0, stopTime);

		setTimeout(() => {
			this.oscillators.forEach((o) => {
				try {
					o.stop();
				} catch (e) {}
			});
			this.oscillators = [];
			this.isPlaying = false;
		}, 600);
	}
}

export const nuclearAlert = new NuclearAlertSystem();
