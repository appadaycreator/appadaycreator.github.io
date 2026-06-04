// Audio Manager for Cosmic Typing Adventure

const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.isMuted = false;
        this.soundVolume = 0.7;
        this.musicVolume = 0.5;
        
        this.loadSounds();
        this.loadMusic();
        this.setupEventListeners();
        
        _logger.debug('🎵 Audio Manager initialized');
    }

    async loadSounds() {
        // Create audio contexts for different sound types
        this.sounds = {
            typing: this.createTypingSounds(),
            effects: this.createEffectSounds(),
            ui: this.createUISounds(),
            achievements: this.createAchievementSounds()
        };
    }

    createTypingSounds() {
        return {
            keyPress: this.createOscillatorSound(800, 0.1, 'sine'),
            keyError: this.createOscillatorSound(200, 0.2, 'square'),
            keySuccess: this.createOscillatorSound(1200, 0.1, 'sine'),
            combo: this.createOscillatorSound(1500, 0.15, 'triangle'),
            comboBreak: this.createOscillatorSound(300, 0.3, 'sawtooth')
        };
    }

    createEffectSounds() {
        return {
            levelUp: this.createOscillatorSound(2000, 0.5, 'sine'),
            planetDiscovered: this.createOscillatorSound(800, 0.8, 'triangle'),
            upgrade: this.createOscillatorSound(1200, 0.3, 'sine'),
            achievement: this.createOscillatorSound(1500, 0.4, 'triangle'),
            notification: this.createOscillatorSound(600, 0.2, 'sine'),
            error: this.createOscillatorSound(400, 0.3, 'square'),
            success: this.createOscillatorSound(1000, 0.3, 'sine'),
            warning: this.createOscillatorSound(500, 0.4, 'sawtooth')
        };
    }

    createUISounds() {
        return {
            buttonClick: this.createOscillatorSound(600, 0.1, 'sine'),
            menuOpen: this.createOscillatorSound(400, 0.2, 'triangle'),
            menuClose: this.createOscillatorSound(300, 0.2, 'triangle'),
            tabSwitch: this.createOscillatorSound(500, 0.1, 'sine'),
            hover: this.createOscillatorSound(800, 0.05, 'sine')
        };
    }

    createAchievementSounds() {
        return {
            unlock: this.createOscillatorSound(1800, 0.6, 'triangle'),
            progress: this.createOscillatorSound(1000, 0.3, 'sine'),
            milestone: this.createOscillatorSound(1200, 0.4, 'triangle'),
            special: this.createOscillatorSound(2200, 0.8, 'sine')
        };
    }

    createOscillatorSound(frequency, duration, type = 'sine') {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.soundVolume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                _logger.warn('Audio playback failed:', error);
            }
        };
    }

    async loadMusic() {
        // Create ambient music using Web Audio API
        this.music = {
            ambient: this.createAmbientMusic(),
            space: this.createSpaceMusic(),
            victory: this.createVictoryMusic(),
            exploration: this.createExplorationMusic()
        };
    }

    createAmbientMusic() {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.3, audioContext.currentTime + 1);
                
                oscillator.start(audioContext.currentTime);
                
                // Create a simple ambient pattern
                setInterval(() => {
                    if (!this.isMuted) {
                        oscillator.frequency.setValueAtTime(220 + Math.random() * 50, audioContext.currentTime);
                    }
                }, 2000);
                
                return { oscillator, gainNode, audioContext };
            } catch (error) {
                _logger.warn('Music playback failed:', error);
            }
        };
    }

    createSpaceMusic() {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillators = [];
                
                // Create multiple oscillators for space-like sound
                for (let i = 0; i < 3; i++) {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(440 + i * 100, audioContext.currentTime);
                    oscillator.type = 'triangle';
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.2, audioContext.currentTime + 2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillators.push({ oscillator, gainNode });
                }
                
                return { oscillators, audioContext };
            } catch (error) {
                _logger.warn('Space music playback failed:', error);
            }
        };
    }

    createVictoryMusic() {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const notes = [523, 659, 784, 1047]; // C, E, G, C
                const oscillators = [];
                
                notes.forEach((note, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(note, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.4, audioContext.currentTime + 0.1);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.5);
                    }, index * 200);
                });
                
                return { audioContext };
            } catch (error) {
                _logger.warn('Victory music playback failed:', error);
            }
        };
    }

    createExplorationMusic() {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.25, audioContext.currentTime + 1);
                
                oscillator.start(audioContext.currentTime);
                
                return { oscillator, gainNode, audioContext };
            } catch (error) {
                _logger.warn('Exploration music playback failed:', error);
            }
        };
    }

    setupEventListeners() {
        // Volume controls
        const volumeSlider = document.getElementById('soundVolume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.soundVolume = e.target.value / 100;
            });
        }

        const musicVolumeSlider = document.getElementById('musicVolume');
        if (musicVolumeSlider) {
            musicVolumeSlider.addEventListener('input', (e) => {
                this.musicVolume = e.target.value / 100;
                this.updateMusicVolume();
            });
        }

        // Mute toggle
        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    // Typing sounds
    playKeyPress() {
        if (this.sounds.typing.keyPress) {
            this.sounds.typing.keyPress();
        }
    }

    playKeyError() {
        if (this.sounds.typing.keyError) {
            this.sounds.typing.keyError();
        }
    }

    playKeySuccess() {
        if (this.sounds.typing.keySuccess) {
            this.sounds.typing.keySuccess();
        }
    }

    playCombo() {
        if (this.sounds.typing.combo) {
            this.sounds.typing.combo();
        }
    }

    playComboBreak() {
        if (this.sounds.typing.comboBreak) {
            this.sounds.typing.comboBreak();
        }
    }

    // Effect sounds
    playLevelUp() {
        if (this.sounds.effects.levelUp) {
            this.sounds.effects.levelUp();
        }
    }

    playPlanetDiscovered() {
        if (this.sounds.effects.planetDiscovered) {
            this.sounds.effects.planetDiscovered();
        }
    }

    playUpgrade() {
        if (this.sounds.effects.upgrade) {
            this.sounds.effects.upgrade();
        }
    }

    playAchievement() {
        if (this.sounds.effects.achievement) {
            this.sounds.effects.achievement();
        }
    }

    playNotification() {
        if (this.sounds.effects.notification) {
            this.sounds.effects.notification();
        }
    }

    playError() {
        if (this.sounds.effects.error) {
            this.sounds.effects.error();
        }
    }

    playSuccess() {
        if (this.sounds.effects.success) {
            this.sounds.effects.success();
        }
    }

    playWarning() {
        if (this.sounds.effects.warning) {
            this.sounds.effects.warning();
        }
    }

    // UI sounds
    playButtonClick() {
        if (this.sounds.ui.buttonClick) {
            this.sounds.ui.buttonClick();
        }
    }

    playMenuOpen() {
        if (this.sounds.ui.menuOpen) {
            this.sounds.ui.menuOpen();
        }
    }

    playMenuClose() {
        if (this.sounds.ui.menuClose) {
            this.sounds.ui.menuClose();
        }
    }

    playTabSwitch() {
        if (this.sounds.ui.tabSwitch) {
            this.sounds.ui.tabSwitch();
        }
    }

    playHover() {
        if (this.sounds.ui.hover) {
            this.sounds.ui.hover();
        }
    }

    // Achievement sounds
    playAchievementUnlock() {
        if (this.sounds.achievements.unlock) {
            this.sounds.achievements.unlock();
        }
    }

    playAchievementProgress() {
        if (this.sounds.achievements.progress) {
            this.sounds.achievements.progress();
        }
    }

    playAchievementMilestone() {
        if (this.sounds.achievements.milestone) {
            this.sounds.achievements.milestone();
        }
    }

    playAchievementSpecial() {
        if (this.sounds.achievements.special) {
            this.sounds.achievements.special();
        }
    }

    // Music control
    playMusic(type = 'ambient') {
        if (this.isMuted) return;
        
        this.stopMusic();
        
        if (this.music[type]) {
            this.currentMusic = this.music[type]();
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            if (this.currentMusic.oscillator) {
                this.currentMusic.oscillator.stop();
            }
            if (this.currentMusic.oscillators) {
                this.currentMusic.oscillators.forEach(({ oscillator }) => {
                    oscillator.stop();
                });
            }
            if (this.currentMusic.audioContext) {
                this.currentMusic.audioContext.close();
            }
            this.currentMusic = null;
        }
    }

    updateMusicVolume() {
        if (this.currentMusic && this.currentMusic.gainNode) {
            this.currentMusic.gainNode.gain.setValueAtTime(this.musicVolume, this.currentMusic.audioContext.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            // Resume music if it was playing
            if (this.currentMusic) {
                this.playMusic();
            }
        }
        
        // Update UI
        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }

    // Volume control
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }

    // Get current settings
    getSettings() {
        return {
            isMuted: this.isMuted,
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume
        };
    }

    // Save settings
    saveSettings() {
        const settings = this.getSettings();
        localStorage.setItem('cosmicTyping_audioSettings', JSON.stringify(settings));
    }

    // Load settings
    loadSettings() {
        const saved = localStorage.getItem('cosmicTyping_audioSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.isMuted = settings.isMuted || false;
                this.soundVolume = settings.soundVolume || 0.7;
                this.musicVolume = settings.musicVolume || 0.5;
            } catch (error) {
                _logger.error('Failed to load audio settings:', error);
            }
        }
    }
} 