export class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {
            type: [
                new Audio('assets/sounds/type1.mp3'),
                new Audio('assets/sounds/type2.mp3'),
                new Audio('assets/sounds/type3.mp3')
            ],
            error: new Audio('assets/sounds/error.mp3'),
            success: new Audio('assets/sounds/success.mp3'),
            hover: new Audio('assets/sounds/hover.mp3')
        };

        // Synthesizer fallback if files missing
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    play(id) {
        if (!this.enabled) return;

        if (id === 'type') {
            // Random variation
            // Use synthesis for "Juicy" mechanical sound if files fail
            this.playSynthType();
        } else if (id === 'error') {
            this.playSynthError();
        } else if (id === 'success') {
            this.playSynthSuccess();
        }
    }

    playSynthType() {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Mechanical click sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05); // Snap

        gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playSynthError() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playSynthSuccess() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}

