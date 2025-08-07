/**
 * QabyldauBot 2D Character Avatar System
 * Animated character with emotions, speech sync, and interactions
 */

class CharacterAvatar {
    constructor(config = {}) {
        console.log('🎭 Initializing Character Avatar...');
        
        this.config = { ...CharacterConfig, ...config };
        this.currentLanguage = 'ru';
        this.currentEmotion = 'neutral';
        this.isVisible = false;
        this.isSpeaking = false;
        this.isThinking = false;
        
        // Элементы DOM
        this.container = null;
        this.svgElement = null;
        this.speechBubble = null;
        
        // Состояние анимаций
        this.animationQueue = [];
        this.currentAnimation = null;
        this.blinkInterval = null;
        this.breathingAnimation = null;
        
        // Speech Synthesis
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Starting character initialization...');
        
        this.createCharacterHTML();
        this.setupEventListeners();
        this.startIdleAnimations();
        this.setupSpeechSynthesis();
        
        if (this.config.behavior.showOnLoad) {
            setTimeout(() => this.show(), 1000);
        }
        
        console.log('✅ Character avatar initialized successfully');
    }

    createCharacterHTML() {
        console.log('🎨 Creating character HTML structure...');
        
        // Создаем контейнер персонажа
        this.container = document.createElement('div');
        this.container.id = 'character-avatar';
        this.container.className = 'character-avatar';
        
        // Создаем SVG персонажа
        this.svgElement = this.createCharacterSVG();
        this.container.appendChild(this.svgElement);
        
        // Создаем пузырь для речи
        if (this.config.speech.visualEffects.speechBubble) {
            this.speechBubble = this.createSpeechBubble();
            this.container.appendChild(this.speechBubble);
        }

                // Добавляем визуальную связь с последним сообщением
                if (this.config.positioning.connectToMessages) {
                    this.connectToLastMessage();
                }
        
        // Добавляем в DOM
        const targetContainer = document.getElementById(this.config.positioning.container) || document.body;
        targetContainer.appendChild(this.container);
        
        console.log('✅ Character HTML structure created');
    }

    createCharacterSVG() {
        const { width, height } = this.config.character.size;
        const colors = this.config.appearance.colors;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.classList.add('character-svg');

        // SVG контент персонажа
        svg.innerHTML = `
            <!-- Тень -->
            <ellipse class="character-shadow" cx="${width/2}" cy="${height-5}" rx="30" ry="8" fill="rgba(0,0,0,0.1)"/>
            
            <!-- Тело -->
            <g class="character-body">
                <!-- Туловище -->
                <rect class="character-torso" x="${width/2-25}" y="${height-80}" width="50" height="60" rx="25" fill="${colors.outfit}" stroke="${colors.primary}" stroke-width="2"/>
                
                <!-- Руки -->
                <g class="character-arms">
                    <circle class="character-arm character-arm-left" cx="${width/2-30}" cy="${height-60}" r="8" fill="${colors.skin}"/>
                    <circle class="character-arm character-arm-right" cx="${width/2+30}" cy="${height-60}" r="8" fill="${colors.skin}"/>
                </g>
            </g>
            
            <!-- Голова -->
            <g class="character-head">
                <!-- Форма головы -->
                <circle class="character-head-shape" cx="${width/2}" cy="50" r="35" fill="${colors.skin}" stroke="${colors.primary}" stroke-width="1"/>
                
                <!-- Волосы -->
                <g class="character-hair">
                    <path d="M ${width/2-35} 30 Q ${width/2} 15 ${width/2+35} 30 Q ${width/2+25} 25 ${width/2} 20 Q ${width/2-25} 25 ${width/2-35} 30" fill="${colors.hair}"/>
                </g>
                
                <!-- Шапочка магистра (если включена) -->
                ${this.config.appearance.features.showHat ? `
                    <g class="character-hat">
                        <rect x="${width/2-30}" y="20" width="60" height="8" rx="4" fill="${colors.primary}"/>
                        <polygon points="${width/2-25},20 ${width/2+25},20 ${width/2+35},15 ${width/2-35},15" fill="${colors.primary}"/>
                        <circle cx="${width/2+30}" cy="18" r="3" fill="${colors.accent}"/>
                    </g>
                ` : ''}
                
                <!-- Лицо -->
                <g class="character-face">
                    <!-- Глаза -->
                    <g class="character-eyes">
                        <g class="character-eye character-eye-left">
                            <ellipse cx="${width/2-12}" cy="45" rx="6" ry="8" fill="white"/>
                            <circle class="character-pupil-left" cx="${width/2-12}" cy="45" r="3" fill="${colors.eyes}"/>
                            <circle class="character-highlight-left" cx="${width/2-10}" cy="43" r="1" fill="white"/>
                        </g>
                        <g class="character-eye character-eye-right">
                            <ellipse cx="${width/2+12}" cy="45" rx="6" ry="8" fill="white"/>
                            <circle class="character-pupil-right" cx="${width/2+12}" cy="45" r="3" fill="${colors.eyes}"/>
                            <circle class="character-highlight-right" cx="${width/2+14}" cy="43" r="1" fill="white"/>
                        </g>
                    </g>
                    
                    <!-- Рот -->
                    <g class="character-mouth">
                        <path class="character-mouth-shape" d="M ${width/2-8} 60 Q ${width/2} 65 ${width/2+8} 60" stroke="${colors.primary}" stroke-width="2" fill="none"/>
                    </g>
                    
                    <!-- Нос -->
                    <circle cx="${width/2}" cy="52" r="1.5" fill="rgba(0,0,0,0.1)"/>
                    
                    <!-- Галстук (если включен) -->
                    ${this.config.appearance.features.showTie ? `
                        <g class="character-tie">
                            <polygon points="${width/2-4},70 ${width/2+4},70 ${width/2+6},85 ${width/2},90 ${width/2-6},85" fill="${colors.accent}"/>
                        </g>
                    ` : ''}
                </g>
            </g>
            
            <!-- Эффекты -->
            <g class="character-effects">
                <!-- Звуковые волны при разговоре -->
                <g class="character-sound-waves" style="opacity: 0;">
                    <circle cx="${width/2+40}" cy="40" r="5" fill="none" stroke="${colors.primary}" stroke-width="1" opacity="0.6"/>
                    <circle cx="${width/2+45}" cy="35" r="8" fill="none" stroke="${colors.primary}" stroke-width="1" opacity="0.4"/>
                    <circle cx="${width/2+50}" cy="30" r="11" fill="none" stroke="${colors.primary}" stroke-width="1" opacity="0.2"/>
                </g>
                
                <!-- Свечение при активности -->
                <circle class="character-glow" cx="${width/2}" cy="50" r="40" fill="url(#glowGradient)" opacity="0"/>
            </g>
            
            <!-- Градиенты -->
            <defs>
                <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0" />
                </radialGradient>
            </defs>
        `;

        return svg;
    }

    createSpeechBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'character-speech-bubble';
        bubble.innerHTML = `
            <div class="speech-bubble-content">
                <span class="speech-text"></span>
            </div>
            <div class="speech-bubble-tail"></div>
        `;
        return bubble;
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        if (!this.container) return;

        // Hover эффекты
        if (this.config.animations.interactions.hoverEffect) {
            this.container.addEventListener('mouseenter', () => this.onHover(true));
            this.container.addEventListener('mouseleave', () => this.onHover(false));
        }

        // Click эффекты
        if (this.config.animations.interactions.clickEffect) {
            this.container.addEventListener('click', () => this.onClick());
        }

        // Следование глазами за мышью
        if (this.config.animations.interactions.followMouse) {
            document.addEventListener('mousemove', (e) => this.followMouse(e));
        }
    }

    setupSpeechSynthesis() {
        console.log('🗣️ Setting up speech synthesis...');
        
        if (!this.config.speech.enabled || !this.speechSynthesis) {
            console.warn('Speech synthesis not available');
            return;
        }

        // Ждем загрузки голосов
        const loadVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            const langCode = this.currentLanguage === 'kk' ? 'ru-RU' : 'ru-RU';
            this.currentVoice = voices.find(voice => voice.lang.includes(langCode)) || voices[0];
            console.log('✅ Speech voice selected:', this.currentVoice?.name);
        };

        if (this.speechSynthesis.getVoices().length > 0) {
            loadVoices();
        } else {
            this.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        }
    }

    // === АНИМАЦИИ ===

    startIdleAnimations() {
        if (!this.config.animations.idle.enabled) return;

        // Моргание
        this.startBlinking();
        
        // Дыхание
        this.startBreathing();
        
        // Движения головы
        if (this.config.animations.idle.headMovement) {
            this.startHeadMovement();
        }
    }

    startBlinking() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        
        this.blinkInterval = setInterval(() => {
            if (!this.isVisible) return;
            
            const eyes = this.container.querySelectorAll('.character-eye ellipse');
            eyes.forEach(eye => {
                eye.style.transform = 'scaleY(0.1)';
                setTimeout(() => {
                    eye.style.transform = 'scaleY(1)';
                }, 150);
            });
        }, this.config.animations.idle.blinkInterval);
    }

    startBreathing() {
        if (!this.container) return;
        
        const body = this.container.querySelector('.character-body');
        if (body) {
            body.style.animation = `breathing ${this.config.animations.idle.breathingSpeed}ms ease-in-out infinite`;
        }
    }

    startHeadMovement() {
        if (!this.container) return;
        
        const head = this.container.querySelector('.character-head');
        if (head) {
            setInterval(() => {
                if (!this.isVisible || this.isSpeaking) return;
                
                const randomX = (Math.random() - 0.5) * 6;
                const randomY = (Math.random() - 0.5) * 3;
                head.style.transform = `translate(${randomX}px, ${randomY}px)`;
                
                setTimeout(() => {
                    head.style.transform = 'translate(0, 0)';
                }, 2000);
            }, 8000);
        }
    }

    // === ЭМОЦИИ ===

    setEmotion(emotion) {
        console.log(`😊 Setting emotion: ${emotion}`);
        
        if (!this.config.animations.emotions.enabled) return;
        if (!this.config.animations.emotions.expressions[emotion]) return;
        
        this.currentEmotion = emotion;
        
        const mouth = this.container?.querySelector('.character-mouth-shape');
        const eyes = this.container?.querySelectorAll('.character-eye ellipse');
        
        if (!mouth || !eyes.length) return;

        // Сброс анимаций
        mouth.style.animation = '';
        eyes.forEach(eye => eye.style.animation = '');

        switch (emotion) {
            case 'happy':
                mouth.setAttribute('d', `M ${this.config.character.size.width/2-8} 58 Q ${this.config.character.size.width/2} 68 ${this.config.character.size.width/2+8} 58`);
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(0.8)';
                });
                break;
                
            case 'excited':
                mouth.style.animation = 'excitedMouth 0.5s ease-in-out 3';
                eyes.forEach(eye => {
                    eye.style.animation = 'sparkleEyes 1s ease-in-out 2';
                });
                break;
                
            case 'thinking':
                mouth.setAttribute('d', `M ${this.config.character.size.width/2-4} 62 Q ${this.config.character.size.width/2} 64 ${this.config.character.size.width/2+4} 62`);
                this.lookUp();
                break;
                
            case 'confused':
                mouth.setAttribute('d', `M ${this.config.character.size.width/2-6} 62 Q ${this.config.character.size.width/2-2} 60 ${this.config.character.size.width/2+2} 62 Q ${this.config.character.size.width/2+6} 64 ${this.config.character.size.width/2+10} 62`);
                break;
                
            case 'helpful':
                mouth.setAttribute('d', `M ${this.config.character.size.width/2-6} 60 Q ${this.config.character.size.width/2} 64 ${this.config.character.size.width/2+6} 60`);
                break;
                
            default: // neutral
                mouth.setAttribute('d', `M ${this.config.character.size.width/2-8} 60 Q ${this.config.character.size.width/2} 65 ${this.config.character.size.width/2+8} 60`);
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(1)';
                });
        }

        // Автосброс эмоции
        setTimeout(() => {
            if (this.currentEmotion === emotion) {
                this.setEmotion('neutral');
            }
        }, this.config.animations.emotions.duration);
    }

    detectEmotionFromText(text) {
        if (!this.config.animations.emotions.autoDetect) return 'neutral';
        
        const text_lower = text.toLowerCase();
        
        // Радостные слова
        if (text_lower.match(/отлично|прекрасно|замечательно|здорово|рад|радость|спасибо|благодар|класс|супер/)) {
            return 'happy';
        }
        
        // Восклицательные фразы
        if (text.includes('!') && text_lower.match(/да|конечно|обязательно|точно/)) {
            return 'excited';
        }
        
        // Мыслительный процесс
        if (text_lower.match(/думаю|размышляю|рассматриваю|анализирую|изучаю|рассмотрим/)) {
            return 'thinking';
        }
        
        // Помощь
        if (text_lower.match(/помогу|помочь|подскажу|объясню|расскажу|покажу/)) {
            return 'helpful';
        }
        
        // Путаница
        if (text_lower.match(/не понимаю|не ясно|сложно|непонятно|запутанно/)) {
            return 'confused';
        }
        
        return 'neutral';
    }

    // === РЕЧЬ ===

    async speak(text, language = null) {
        if (!this.config.speech.enabled || !text) return;
        
        console.log('🗣️ Speaking:', text.substring(0, 50) + '...');
        
        const lang = language || this.currentLanguage;
        const speechConfig = this.config.speech[lang === 'kk' ? 'kazakh' : 'russian'];
        
        // Определяем эмоцию из текста
        const emotion = this.detectEmotionFromText(text);
        this.setEmotion(emotion);
        
        // Показываем пузырь речи
        if (this.speechBubble && this.config.speech.visualEffects.speechBubble) {
            this.showSpeechBubble(text);
        }
        
        // Начинаем анимацию разговора
        this.startSpeakingAnimation();
        
        // Создаем utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = speechConfig.rate;
        utterance.pitch = speechConfig.pitch;
        utterance.volume = speechConfig.volume;
        utterance.lang = speechConfig.voice;
        
        // События речи
        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('🎤 Speech started');
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.stopSpeakingAnimation();
            this.hideSpeechBubble();
            console.log('🔇 Speech ended');
        };
        
        utterance.onerror = (error) => {
            console.error('❌ Speech error:', error);
            this.isSpeaking = false;
            this.stopSpeakingAnimation();
            this.hideSpeechBubble();
        };
        
        // Произносим текст
        this.speechSynthesis.speak(utterance);
    }

        /**
         * Создает визуальную связь между персонажем и последним сообщением
         */
        connectToLastMessage() {
            // Проверяем поддержку в настройках
            if (!this.config.avatarIntegration?.enabled) return;

            // Находим последнее сообщение бота
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const botContainers = chatMessages.querySelectorAll('.avatar-container.with-character-avatar');
            if (botContainers.length === 0) return;

            const lastBotContainer = botContainers[botContainers.length - 1];

            // Добавляем соединительный элемент, если его еще нет
            let connector = lastBotContainer.querySelector('.character-message-connector');
            if (!connector) {
                connector = document.createElement('div');
                connector.className = 'character-message-connector';
                lastBotContainer.appendChild(connector);
            }

            // Анимируем соединитель
            setTimeout(() => {
                connector.style.transform = 'scaleX(1)';

                // Когда персонаж говорит, усиливаем эффект
                if (this.isSpeaking && this.config.avatarIntegration.animateWithSpeech) {
                    connector.style.opacity = '0.8';
                    connector.style.height = '3px';

                    // Возвращаем обычный вид после речи
                    setTimeout(() => {
                        connector.style.opacity = '0.3';
                        connector.style.height = '2px';
                    }, 1000);
                }
            }, 100);
        }

    startSpeakingAnimation() {
        if (!this.config.animations.speaking.enabled) return;
        
        const mouth = this.container?.querySelector('.character-mouth-shape');
        const soundWaves = this.container?.querySelector('.character-sound-waves');
        const glow = this.container?.querySelector('.character-glow');
        
        // Анимация рта
        if (mouth && this.config.animations.speaking.mouthAnimation) {
            mouth.style.animation = 'speakingMouth 0.2s ease-in-out infinite alternate';
        }
        
        // Звуковые волны
        if (soundWaves && this.config.speech.visualEffects.soundWaves) {
            soundWaves.style.opacity = '1';
            soundWaves.style.animation = 'soundWaves 1s ease-in-out infinite';
        }
        
        // Свечение
        if (glow && this.config.speech.visualEffects.glowEffect) {
            glow.style.opacity = '1';
            glow.style.animation = 'glowPulse 2s ease-in-out infinite';
        }
    }

    stopSpeakingAnimation() {
        const mouth = this.container?.querySelector('.character-mouth-shape');
        const soundWaves = this.container?.querySelector('.character-sound-waves');
        const glow = this.container?.querySelector('.character-glow');
        
        if (mouth) mouth.style.animation = '';
        if (soundWaves) {
            soundWaves.style.opacity = '0';
            soundWaves.style.animation = '';
        }
        if (glow) {
            glow.style.opacity = '0';
            glow.style.animation = '';
        }
    }

    // === ПУЗЫРЬ РЕЧИ ===

    showSpeechBubble(text) {
        if (!this.speechBubble) return;
        
        const textElement = this.speechBubble.querySelector('.speech-text');
        if (textElement) {
            textElement.textContent = text;
        }
        
        this.speechBubble.style.display = 'block';
        this.speechBubble.style.animation = 'bubbleAppear 0.3s ease-out';
    }

    hideSpeechBubble() {
        if (!this.speechBubble) return;
        
        this.speechBubble.style.animation = 'bubbleDisappear 0.3s ease-in';
        setTimeout(() => {
            this.speechBubble.style.display = 'none';
        }, 300);
    }

    // === ВЗАИМОДЕЙСТВИЯ ===

    onHover(isHovering) {
        if (!this.container) return;
        
        if (isHovering) {
            this.container.style.transform = 'scale(1.05)';
            this.wave();
        } else {
            this.container.style.transform = 'scale(1)';
        }
    }

    onClick() {
        console.log('👆 Character clicked');
        
        // Анимация клика
        this.container.style.animation = 'clickBounce 0.4s ease-out';
        
        setTimeout(() => {
            this.container.style.animation = '';
        }, 400);
        
        // Случайное действие при клике
        const actions = ['wave', 'nod', 'setEmotion'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        if (randomAction === 'setEmotion') {
            const emotions = ['happy', 'excited', 'helpful'];
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            this.setEmotion(randomEmotion);
        } else {
            this[randomAction]();
        }
    }

    wave() {
        const leftArm = this.container?.querySelector('.character-arm-left');
        if (leftArm) {
            leftArm.style.animation = 'waveArm 1s ease-in-out 3';
        }
    }

    nod() {
        const head = this.container?.querySelector('.character-head');
        if (head) {
            head.style.animation = 'nodHead 0.6s ease-in-out 2';
        }
    }

    lookUp() {
        const pupils = this.container?.querySelectorAll('[class*="character-pupil"]');
        pupils?.forEach(pupil => {
            pupil.style.transform = 'translateY(-1px)';
            setTimeout(() => {
                pupil.style.transform = 'translateY(0)';
            }, 2000);
        });
    }

    followMouse(event) {
        if (!this.isVisible) return;
        
        const pupils = this.container?.querySelectorAll('[class*="character-pupil"]');
        if (!pupils?.length) return;
        
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (event.clientX - centerX) / 100;
        const deltaY = (event.clientY - centerY) / 100;
        
        pupils.forEach(pupil => {
            pupil.style.transform = `translate(${Math.max(-2, Math.min(2, deltaX))}px, ${Math.max(-2, Math.min(2, deltaY))}px)`;
        });
    }

    // === УПРАВЛЕНИЕ ВИДИМОСТЬЮ ===

    show() {
        if (this.isVisible) return;
        
        console.log('👁️ Showing character');
        this.isVisible = true;
        
        if (this.container) {
            this.container.style.display = 'block';
            this.container.style.animation = 'characterAppear 0.5s ease-out';
        }
        
        // Приветствие
        if (this.config.behavior.greetingMessage) {
            setTimeout(() => {
                const greeting = this.config.messages[this.currentLanguage]?.greeting;
                if (greeting) {
                    this.speak(greeting);
                }
            }, 1000);
        }
    }

    hide() {
        if (!this.isVisible) return;
        
        console.log('🙈 Hiding character');
        this.isVisible = false;
        
        if (this.container) {
            this.container.style.animation = 'characterDisappear 0.5s ease-in';
            setTimeout(() => {
                this.container.style.display = 'none';
            }, 500);
        }
    }

    // === ОБНОВЛЕНИЕ ЯЗЫКА ===

    setLanguage(language) {
        console.log(`🌍 Setting language to: ${language}`);
        this.currentLanguage = language;
        this.setupSpeechSynthesis();
    }

    // === УНИЧТОЖЕНИЕ ===

    destroy() {
        console.log('💥 Destroying character avatar');
        
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        if (this.breathingAnimation) clearInterval(this.breathingAnimation);
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.speechSynthesis.cancel();
    }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterAvatar;
} else if (typeof window !== 'undefined') {
    window.CharacterAvatar = CharacterAvatar;
}

console.log('✅ Character Avatar class loaded');