/**
 * QabyldauBot Character Integration
 * Интеграция 2D персонажа с существующим чат-виджетом
 */

class CharacterIntegration {
    constructor() {
        console.log('🔗 Initializing Character Integration...');
        
        this.character = null;
        this.chatWidget = null;
        this.isIntegrated = false;
        
        // Ожидаем загрузки всех компонентов
        this.waitForComponents();
    }

    async waitForComponents() {
        console.log('⏳ Waiting for components to load...');
        
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkComponents = () => {
            attempts++;
            
            if (window.CharacterConfig && window.CharacterAvatar && window.QabyldauBot) {
                console.log('✅ All components loaded, initializing integration');
                this.initialize();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('❌ Failed to load all components after maximum attempts');
                return;
            }
            
            setTimeout(checkComponents, 100);
        };
        
        checkComponents();
    }

    initialize() {
        console.log('🚀 Starting character integration...');
        
        try {
            // Создаем персонажа с конфигурацией
            this.character = new CharacterAvatar(CharacterConfig);
            
            // Получаем ссылку на чат-виджет
            this.chatWidget = window.QabyldauBot;
            
            // Интегрируем с чат-системой
            this.integrateWithChat();
            
            // Настраиваем обработчики событий
            this.setupEventHandlers();
            
            this.isIntegrated = true;
            console.log('✅ Character integration completed successfully');
            
        } catch (error) {
            console.error('❌ Character integration failed:', error);
        }
    }

    integrateWithChat() {
        if (!this.chatWidget || !this.character) {
            console.error('❌ Missing chat widget or character for integration');
            return;
        }

        console.log('🔌 Integrating character with chat system...');
        
        // Сохраняем оригинальные методы чата
        const originalAddMessage = this.chatWidget.addMessage;
        const originalSendMessage = this.chatWidget.sendMessage;
        const originalOpenChat = this.chatWidget.openChat;
        const originalCloseChat = this.chatWidget.closeChat;
        const originalSetLanguage = this.chatWidget.currentLanguage;

        // === ИНТЕГРАЦИЯ С СООБЩЕНИЯМИ ===
        
        // Переопределяем addMessage для реакции персонажа на сообщения
        this.chatWidget.addMessage = (text, sender, isError = false) => {
            // Вызываем оригинальный метод
            const result = originalAddMessage.call(this.chatWidget, text, sender, isError);
            
            // Реакция персонажа на сообщения
            if (sender === 'bot' && !isError) {
                this.onBotMessage(text);
            } else if (sender === 'user') {
                this.onUserMessage(text);
            }
            
            return result;
        };

        // === ИНТЕГРАЦИЯ С ОТПРАВКОЙ СООБЩЕНИЙ ===
        
        // Переопределяем sendMessage для реакции персонажа
        this.chatWidget.sendMessage = async function() {
            const message = this.chatInput?.value?.trim();
            
            if (!message || this.isTyping) {
                return;
            }

            // Персонаж реагирует на начало отправки сообщения
            if (window.characterIntegration) {
                window.characterIntegration.onUserStartsTyping();
            }

            // Вызываем оригинальный метод
            return originalSendMessage.call(this);
        };

        // === ИНТЕГРАЦИЯ С УПРАВЛЕНИЕМ ЧАТОМ ===
        
        // Реакция на открытие чата
        this.chatWidget.openChat = function() {
            const result = originalOpenChat.call(this);
            
            if (window.characterIntegration && !CharacterConfig.behavior.hideWhenChatOpen) {
                window.characterIntegration.onChatOpened();
            }
            
            return result;
        };

        // Реакция на закрытие чата
        this.chatWidget.closeChat = function() {
            const result = originalCloseChat.call(this);
            
            if (window.characterIntegration) {
                window.characterIntegration.onChatClosed();
            }
            
            return result;
        };

        // === СИНХРОНИЗАЦИЯ ЯЗЫКА ===
        
        // Отслеживаем изменения языка
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.onLanguageChange(e.target.value);
            });
        }

        console.log('✅ Chat integration completed');
    }

    setupEventHandlers() {
        console.log('🎧 Setting up integration event handlers...');
        
        // Глобальные события для интеграции
        document.addEventListener('chatWidgetReady', () => {
            console.log('📢 Chat widget ready event received');
            this.onChatWidgetReady();
        });

        // События для отладки
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                this.toggleCharacterDebug();
            }
        });

        console.log('✅ Integration event handlers setup complete');
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===

    onBotMessage(text) {
        if (!this.character) return;
        
        console.log('🤖 Bot message received for character:', text.substring(0, 50) + '...');
        
        // Автоматически озвучиваем ответ бота, если включено
        if (CharacterConfig.speech.autoSpeak) {
            this.character.speak(text, this.character.currentLanguage);
        }
        
        // Определяем эмоцию и устанавливаем её
        const emotion = this.character.detectEmotionFromText(text);
        this.character.setEmotion(emotion);
        
        // Показываем персонажа, если он скрыт
        if (!this.character.isVisible) {
            this.character.show();
        }

        // Подсвечиваем последнее сообщение бота
        this.highlightLastBotMessage();
            }

            // Подсвечивание последнего сообщения бота для связи с персонажем
            highlightLastBotMessage() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // Найти последний контейнер с сообщением бота
        const botContainers = chatMessages.querySelectorAll('.avatar-container.with-character-avatar');
        if (botContainers.length === 0) return;

        const lastBotContainer = botContainers[botContainers.length - 1];

        // Добавить класс активного сообщения
        lastBotContainer.classList.add('active-character-message');

        // Добавить небольшую анимацию для привлечения внимания
        const botMessage = lastBotContainer.querySelector('.bot-message');
        if (botMessage) {
            botMessage.style.boxShadow = '0 0 8px rgba(59, 87, 179, 0.5)';

            // Убрать эффект через несколько секунд
            setTimeout(() => {
                botMessage.style.boxShadow = '';
                lastBotContainer.classList.remove('active-character-message');
            }, 3000);
        }
    }

    onUserMessage(text) {
        if (!this.character) return;
        
        console.log('👤 User message received:', text.substring(0, 50) + '...');
        
        // Персонаж показывает, что слушает
        this.character.setEmotion('thinking');
        
        // Добавляем класс для анимации слушания
        if (this.character.container) {
            this.character.container.classList.add('listening');
            
            // Убираем класс через некоторое время
            setTimeout(() => {
                this.character.container.classList.remove('listening');
            }, 2000);
        }
    }

    onUserStartsTyping() {
        if (!this.character) return;
        
        console.log('⌨️ User starts typing');
        
        // Персонаж смотрит в сторону чата
        this.character.setEmotion('helpful');
    }

    onChatOpened() {
        if (!this.character) return;
        
        console.log('💬 Chat opened');
        
        if (CharacterConfig.behavior.hideWhenChatOpen) {
            this.character.hide();
        } else {
            // Персонаж радуется открытию чата
            this.character.setEmotion('excited');
            this.character.wave();
        }
    }

    onChatClosed() {
        if (!this.character) return;
        
        console.log('❌ Chat closed');
        
        if (CharacterConfig.behavior.hideWhenChatOpen) {
            this.character.show();
        } else {
            // Персонаж возвращается в обычное состояние
            this.character.setEmotion('neutral');
        }
    }

    onLanguageChange(newLanguage) {
        if (!this.character) return;
        
        console.log(`🌍 Language changed to: ${newLanguage}`);
        
        // Синхронизируем язык персонажа
        this.character.setLanguage(newLanguage);
        
        // Персонаж кивает в знак понимания
        this.character.nod();
    }

    onChatWidgetReady() {
        console.log('🎯 Chat widget is ready');
        
        // Дополнительная настройка после готовности чата
        if (this.character && CharacterConfig.behavior.greetingMessage) {
            setTimeout(() => {
                const greeting = CharacterConfig.messages[this.character.currentLanguage]?.greeting;
                if (greeting) {
                    this.character.speak(greeting);
                }
            }, 2000);
        }
    }

    // === МЕТОДЫ УПРАВЛЕНИЯ ===

    toggleCharacterDebug() {
        if (!this.character) return;
        
        const isDebug = CharacterConfig.debug.enabled;
        CharacterConfig.debug.enabled = !isDebug;
        
        if (this.character.container) {
            this.character.container.classList.toggle('debug', !isDebug);
        }
        
        console.log(`🔧 Debug mode ${!isDebug ? 'enabled' : 'disabled'}`);
    }

    // === ПУБЛИЧНЫЕ МЕТОДЫ ===

    showCharacter() {
        if (this.character) {
            this.character.show();
        }
    }

    hideCharacter() {
        if (this.character) {
            this.character.hide();
        }
    }

    speakText(text, language = null) {
        if (this.character) {
            this.character.speak(text, language);
        }
    }

    setCharacterEmotion(emotion) {
        if (this.character) {
            this.character.setEmotion(emotion);
        }
    }

    // === УПРАВЛЕНИЕ КОНФИГУРАЦИЕЙ ===

    updateConfig(newConfig) {
        console.log('⚙️ Updating character configuration');
        
        CharacterConfig.update(newConfig);
        
        // Применяем изменения к персонажу
        if (this.character) {
            this.character.config = { ...this.character.config, ...newConfig };
        }
    }

    // === МЕТОДЫ ОТЛАДКИ ===

    getStatus() {
        return {
            isIntegrated: this.isIntegrated,
            character: {
                isVisible: this.character?.isVisible,
                isSpeaking: this.character?.isSpeaking,
                currentEmotion: this.character?.currentEmotion,
                currentLanguage: this.character?.currentLanguage
            },
            chatWidget: {
                isOpen: this.chatWidget?.isOpen,
                currentLanguage: this.chatWidget?.currentLanguage
            }
        };
    }

    // === УНИЧТОЖЕНИЕ ===

    destroy() {
        console.log('💥 Destroying character integration');
        
        if (this.character) {
            this.character.destroy();
            this.character = null;
        }
        
        this.chatWidget = null;
        this.isIntegrated = false;
    }
}

// === АВТОИНИЦИАЛИЗАЦИЯ ===

// Глобальная переменная для доступа к интеграции
window.characterIntegration = null;

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, starting character integration...');
    
    setTimeout(() => {
        try {
            window.characterIntegration = new CharacterIntegration();
            
            // Глобальные команды для отладки
            window.showCharacter = () => window.characterIntegration?.showCharacter();
            window.hideCharacter = () => window.characterIntegration?.hideCharacter();
            window.speakText = (text, lang) => window.characterIntegration?.speakText(text, lang);
            window.setEmotion = (emotion) => window.characterIntegration?.setCharacterEmotion(emotion);
            window.getCharacterStatus = () => window.characterIntegration?.getStatus();
            
            console.log('🎉 Character integration initialized!');
            console.log('🔧 Available commands:');
            console.log('  - showCharacter() - показать персонажа');
            console.log('  - hideCharacter() - скрыть персонажа');
            console.log('  - speakText(text, lang) - произнести текст');
            console.log('  - setEmotion(emotion) - установить эмоцию');
            console.log('  - getCharacterStatus() - получить статус');
            
        } catch (error) {
            console.error('❌ Failed to initialize character integration:', error);
        }
    }, 500);
});

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterIntegration;
}

console.log('✅ Character Integration script loaded');