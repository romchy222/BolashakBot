// Исправленный QabyldauBot Chat Widget

class ChatWidget {
    constructor() {
        console.log('🚀 Начинаем инициализацию QabyldauBot...');

        this.isOpen = false;
        this.currentLanguage = 'ru';
        this.isTyping = false;
        this.initialized = false;

        // Инициализация аватара пользователя
        this.userAvatar = null;

        // Пытаемся получить аватар из localStorage
        try {
            this.userAvatar = localStorage.getItem('qabyldaubot_user_avatar');
        } catch (e) {
            console.log('Не удалось получить аватар из localStorage');
        }

        // Debounce click handler
        this.toggleChatDebounced = this.debounce(this.toggleChat.bind(this), 300);

        if (!this.initializeElements()) {
            console.error('❌ Не удалось найти все необходимые элементы');
            return;
        }

        // Добавляем критически важный CSS для скрытия
        this.addCriticalCSS();

        this.bindEvents();
        this.updateLanguage();
        this.initialized = true;

        console.log('✅ QabyldauBot успешно инициализирован');
    }

    // Добавляем критически важный CSS с максимальной специфичностью
    addCriticalCSS() {
        const existingStyle = document.getElementById('qabyldau-critical-css');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'qabyldau-critical-css';
        style.textContent = `
            /* Критически важные стили для скрытия чата */
            #chat-window.chat-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }

            #chat-window.chat-visible {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* Анимации */
            #chat-window {
                transition: opacity 0.3s ease-in-out;
            }

            .chat-button-open {
                transform: rotate(45deg);
                transition: transform 0.2s ease;
            }

            .chat-button-closed {
                transform: rotate(0deg);
                transition: transform 0.2s ease;
            }

            /* Дополнительные анимации для сообщений */
            .message-sent {
                animation: slideInMessage 0.3s ease-out;
            }

            @keyframes slideInMessage {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Анимация точек загрузки */
            @keyframes bounce {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.3;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .loading-dots .dot {
                animation: bounce 1.4s ease-in-out infinite both;
            }
        `;

        document.head.appendChild(style);
        console.log('🎨 Критически важный CSS добавлен');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    initializeElements() {
        console.log('🔍 Ищем элементы в DOM...');

        const elementIds = {
            chatButton: 'chat-button',
            chatWindow: 'chat-window',
            closeButton: 'close-chat',
            chatMessages: 'chat-messages',
            chatInput: 'chat-input',
            sendButton: 'send-button',
            languageSelector: 'language-selector',
            typingIndicator: 'typing-indicator',
            welcomeMessage: 'welcome-message'
        };

        let allFound = true;
        for (const [propName, elementId] of Object.entries(elementIds)) {
            const element = document.getElementById(elementId);
            this[propName] = element;

            if (element) {
                console.log(`✅ Найден ${propName} (#${elementId})`);
            } else {
                console.error(`❌ НЕ найден ${propName} (#${elementId})`);
                allFound = false;
            }
        }

        return allFound;
    }

    bindEvents() {
        console.log('🔗 Привязываем события...');

        if (!this.chatButton || !this.closeButton) {
            console.error('❌ Критические элементы не найдены для привязки событий');
            return;
        }

        // Событие открытия/закрытия чата
        this.chatButton.addEventListener('click', (e) => {
            console.log('🖱️ Клик по кнопке чата');
            e.preventDefault();
            e.stopPropagation();
            this.toggleChatDebounced();
        });

        // Событие закрытия чата
        this.closeButton.addEventListener('click', (e) => {
            console.log('🖱️ Клик по кнопке закрытия');
            e.preventDefault();
            e.stopPropagation();
            this.closeChat();
        });

        // Остальные события
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (this.languageSelector) {
            this.languageSelector.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.updateLanguage();
            });
        }

        // Предотвращение закрытия при клике внутри окна чата
        if (this.chatWindow) {
            this.chatWindow.addEventListener('click', (e) => e.stopPropagation());
        }

        // Закрытие при клике вне виджета
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.chatWindow.contains(e.target) && 
                !this.chatButton.contains(e.target)) {
                console.log('🖱️ Клик вне виджета - закрываем');
                this.closeChat();
            }
        });

        console.log('✅ События успешно привязаны');
    }

        /**
         * Установка аватара пользователя
         * @param {string} imageUrl - URL изображения или цвет аватара
         * @returns {boolean} Успешность операции
         */
        setUserAvatar(imageUrl) {
            // Сохраняем ссылку на аватар
            this.userAvatar = imageUrl;

            // Сохраняем в localStorage для будущих сессий
            try {
                localStorage.setItem('qabyldaubot_user_avatar', imageUrl);
            } catch (e) {
                console.log('Не удалось сохранить аватар в localStorage');
                return false;
            }

            // Обновляем все существующие аватары пользователя
            const userAvatars = document.querySelectorAll('.user-avatar');
            userAvatars.forEach(avatar => {
                // Очищаем содержимое
                avatar.innerHTML = '';

                // Если это URL или путь к изображению
                if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
                    avatar.style.backgroundImage = `url(${imageUrl})`;
                    avatar.style.backgroundSize = 'cover';
                    avatar.style.backgroundPosition = 'center';
                    avatar.style.backgroundColor = 'transparent';
                } 
                // Если это цвет
                else if (imageUrl.startsWith('#') || imageUrl.startsWith('rgb')) {
                    avatar.style.backgroundImage = '';
                    avatar.style.backgroundColor = imageUrl;

                    // Добавляем иконку пользователя
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user';
                    avatar.appendChild(icon);
                }
            });

            return true;
        }

    toggleChat() {
        console.log('🔄 toggleChat вызван');
        console.log('📊 Текущее состояние:', {
            isOpen: this.isOpen,
            initialized: this.initialized
        });

        if (!this.initialized) {
            console.warn('⚠️ Виджет еще не полностью инициализирован');
            return;
        }

        if (this.isOpen) {
            console.log('➡️ Чат открыт, закрываем...');
            this.closeChat();
        } else {
            console.log('➡️ Чат закрыт, открываем...');
            this.openChat();
        }
    }

    openChat() {
        console.log('🔓 Открываем чат...');

        if (!this.chatWindow || !this.chatInput || !this.chatButton) {
            console.error('❌ Элементы для открытия чата не найдены');
            return;
        }

        try {
            // Используем специальные классы вместо hidden
            this.chatWindow.classList.remove('chat-hidden', 'hidden');
            this.chatWindow.classList.add('chat-visible');

            this.isOpen = true;

            console.log('📋 Классы окна чата:', Array.from(this.chatWindow.classList));

            // Проверяем стили после изменения
            const computedStyle = window.getComputedStyle(this.chatWindow);
            console.log('👁️ Стили отображения:', {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity
            });

            // Фокус на поле ввода
            setTimeout(() => {
                if (this.chatInput) {
                    this.chatInput.focus();
                    console.log('🎯 Фокус установлен на поле ввода');
                }
            }, 100);

            // Обновляем иконку кнопки с анимацией
            this.chatButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
            this.chatButton.classList.remove('chat-button-closed');
            this.chatButton.classList.add('chat-button-open');

            console.log('✅ Чат успешно открыт');

        } catch (error) {
            console.error('❌ Ошибка при открытии чата:', error);
        }
    }

    closeChat() {
        console.log('🔒 Закрываем чат...');

        if (!this.chatWindow || !this.chatButton) {
            console.error('❌ Элементы для закрытия чата не найдены');
            return;
        }

        try {
            // Используем специальные классы вместо hidden
            this.chatWindow.classList.remove('chat-visible', 'hidden');
            this.chatWindow.classList.add('chat-hidden');

            this.isOpen = false;

            console.log('📋 Классы окна чата:', Array.from(this.chatWindow.classList));

            // Проверяем стили после изменения
            const computedStyle = window.getComputedStyle(this.chatWindow);
            console.log('👁️ Стили отображения:', {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity
            });

            // Обновляем иконку кнопки с анимацией
            this.chatButton.innerHTML = '<i class="fas fa-comments text-xl"></i>';
            this.chatButton.classList.remove('chat-button-open');
            this.chatButton.classList.add('chat-button-closed');

            console.log('✅ Чат успешно закрыт');

        } catch (error) {
            console.error('❌ Ошибка при закрытии чата:', error);
        }
    }

    updateLanguage() {
        const messages = {
            ru: {
                welcome: 'Привет! Я QabyldauBot. Задайте вопрос о поступлении в университет "Болашак".',
                placeholder: 'Введите ваш вопрос...',
                typing: 'QabyldauBot печатает...'
            },
            kk: {
                welcome: 'Сәлем! Мен QabyldauBot-пын. "Болашақ" университетіне түсу туралы сұрақ қойыңыз.',
                placeholder: 'Сұрағыңызды енгізіңіз...',
                typing: 'QabyldauBot жазып жатыр...'
            }
        };

        const currentMessages = messages[this.currentLanguage];

        if (this.welcomeMessage) {
            this.welcomeMessage.textContent = currentMessages.welcome;
        }

        if (this.chatInput) {
            this.chatInput.placeholder = currentMessages.placeholder;
        }

        this.currentMessages = currentMessages;

        console.log(`🌍 Язык обновлен на: ${this.currentLanguage}`);
    }

    async sendMessage() {
        const message = this.chatInput?.value?.trim();

        if (!message || this.isTyping) {
            return;
        }

        console.log('📤 Отправляем сообщение:', message);

        // Очищаем поле
        this.chatInput.value = '';

        // Добавляем сообщение пользователя
        this.addMessage(message, 'user');

        // Показываем индикатор печатания
        this.showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: this.currentLanguage
                })
            });

            const data = await response.json();
            this.hideTyping();

            if (response.ok) {
                const cleanResponse = this.cleanResponseLanguage(data.response);
                this.addMessage(cleanResponse, 'bot');
                console.log('✅ Ответ получен и добавлен');

                if (data.response_time) {
                    console.log(`⏱️ Время ответа: ${data.response_time}с`);
                }
            } else {
                throw new Error(data.error || 'Ошибка сервера');
            }

        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            this.hideTyping();

            const errorMessage = this.currentLanguage === 'ru' 
                ? 'Извините, произошла ошибка. Попробуйте позже.'
                : 'Кешіріңіз, қате орын алды. Кейінірек қайталап көріңіз.';

            this.addMessage(errorMessage, 'bot', true);
        }
    }

    addMessage(text, sender, isError = false) {
        if (!this.chatMessages) {
            console.error('❌ Элемент chatMessages не найден');
            return;
        }

        const messageDiv = document.createElement('div');
        const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
        const errorClass = isError ? ' error-message' : '';

        messageDiv.className = `${messageClass}${errorClass} p-3 rounded-lg shadow-sm max-w-xs message-sent`;

        

        if (sender === 'user') {
            const languageSpan = document.createElement('span');
            languageSpan.className = 'language-indicator text-xs opacity-75 mb-1 block';
            languageSpan.textContent = this.currentLanguage.toUpperCase();
            messageDiv.appendChild(languageSpan);
        }

        const textP = document.createElement('p');
        textP.className = 'text-sm text-gray-800 mb-1';
        textP.textContent = text;
        messageDiv.appendChild(textP);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time text-xs opacity-60';
        timeSpan.textContent = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        messageDiv.appendChild(timeSpan);

        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();

        const icon = document.createElement('i');
        if (sender === 'user') {
            icon.className = 'fas fa-user text-white ml-2 mt-1';
            icon.style.display = 'flex';
            icon.style.flexDirection = 'row-reverse';
            messageDiv.appendChild(icon);
            
            
        } else {
            icon.className = 'fas fa-robot text-gray-500 mr-2 mt-1';
            messageDiv.insertBefore(icon, messageDiv.firstChild);
        }
        
        console.log(`💬 Сообщение добавлено (${sender}):`, text.substring(0, 50));

        
        
    }

    
    

    cleanResponseLanguage(response) {
        if (!response) return '';

        return response
            .replace(/\bOK\b/gi, 'Хорошо')
            .replace(/\bYes\b/gi, 'Да')
            .replace(/\bNo\b/gi, 'Нет')
            .replace(/\bHello\b/gi, 'Здравствуйте')
            .replace(/\bHi\b/gi, 'Привет')
            .replace(/\bThanks?\b/gi, 'Спасибо')
            .replace(/\bThank you\b/gi, 'Спасибо')
            .replace(/\bSorry\b/gi, 'Извините')
            .replace(/\bPlease\b/gi, 'Пожалуйста')
            .replace(/\bInfo\b/gi, 'Информация')
            .replace(/\bInformation\b/gi, 'Информация')
            .replace(/\bWebsite\b/gi, '')
            .replace(/\bEmail\b/gi, 'электронная почта')
            .replace(/\bContact\b/gi, 'контакт')
            .replace(/\bUniversity\b/gi, 'университет')
            .replace(/\bStudents?\b/gi, 'студенты')
            .replace(/\bCourses?\b/gi, 'курсы')
            .replace(/\bPrograms?\b/gi, 'программы')
            .replace(/\bFaculty\b/gi, 'факультет')
            .replace(/\bAdmission\b/gi, 'поступление')
            .replace(/\bApplications?\b/gi, 'заявления')
            .replace(/\bDocuments?\b/gi, 'документы')
            .replace(/\b[A-Za-z]{3,}\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    showTyping() {
        this.isTyping = true;

        // Удаляем существующий индикатор
        const existingTyping = document.getElementById('typing-message');
        if (existingTyping) {
            existingTyping.remove();
        }

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-message';
        typingDiv.className = 'bot-message typing-indicator';

        const typingContent = document.createElement('div');
        typingContent.className = 'flex items-center space-x-2 p-2';

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'loading-dots flex space-x-1';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot w-2 h-2 bg-blue-500 rounded-full';
            dot.style.animationDelay = `${i * 0.16}s`;
            dotsContainer.appendChild(dot);
        }

        const typingText = document.createElement('span');
        typingText.textContent = this.currentMessages?.typing || 'QabyldauBot печатает...';
        typingText.className = 'text-sm text-gray-600';

        typingContent.appendChild(dotsContainer);
        typingContent.appendChild(typingText);
        typingDiv.appendChild(typingContent);

        this.chatMessages.appendChild(typingDiv);

        if (this.sendButton) {
            this.sendButton.disabled = true;
            this.sendButton.style.opacity = '0.5';
        }

        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;

        const typingMessage = document.getElementById('typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }

        if (this.sendButton) {
            this.sendButton.disabled = false;
            this.sendButton.style.opacity = '1';
        }
    }

    scrollToBottom() {
        if (this.chatMessages) {
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        }

        setUserAvatar(imageUrl) {
            // Сохраняем ссылку на аватар
            this.userAvatar = imageUrl;

            // Сохраняем в localStorage для будущих сессий
            try {
                localStorage.setItem('qabyldaubot_user_avatar', imageUrl);
            } catch (e) {
                console.log('Не удалось сохранить аватар в localStorage');
            }

            // Обновляем все существующие аватары пользователя
            const userAvatars = document.querySelectorAll('.user-avatar');
            userAvatars.forEach(avatar => {
                avatar.innerHTML = '';
                avatar.style.backgroundImage = `url(${imageUrl})`;
            });

            return true;
        }
    }

    // Методы для отладки
    debug() {
        console.log('🔧 СОСТОЯНИЕ ВИДЖЕТА:');
        console.log('  isOpen:', this.isOpen);
        console.log('  initialized:', this.initialized);
        console.log('  currentLanguage:', this.currentLanguage);

        if (this.chatWindow) {
            console.log('🔧 ОКНО ЧАТА:');
            console.log('  classList:', Array.from(this.chatWindow.classList));
            const computedStyle = window.getComputedStyle(this.chatWindow);
            console.log('  display:', computedStyle.display);
            console.log('  visibility:', computedStyle.visibility);
            console.log('  opacity:', computedStyle.opacity);
        }
    }

    forceOpen() {
        console.log('🔧 Принудительное открытие чата');
        this.isOpen = false;
        this.openChat();
    }

    forceClose() {
        console.log('🔧 Принудительное закрытие чата');
        this.isOpen = true;
        this.closeChat();
    }

    // Публичные методы для внешнего управления
    clearChat() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
            console.log('🧹 Чат очищен');
        }
    }

    sendPredefinedMessage(message) {
        if (this.chatInput) {
            this.chatInput.value = message;
            this.sendMessage();
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, начинаем инициализацию...');

    try {
        setTimeout(() => {
            console.log('⏰ Запускаем ChatWidget через 100ms...');
            const chatWidget = new ChatWidget();

            // Глобальная ссылка для отладки
            window.QabyldauBot = chatWidget;

            // Команды отладки
            window.debugChat = () => chatWidget.debug();
            window.forceOpenChat = () => chatWidget.forceOpen();
            window.forceCloseChat = () => chatWidget.forceClose();
            window.clearChat = () => chatWidget.clearChat();

            console.log('🎉 Виджет инициализирован!');
            console.log('🔧 Доступные команды:');
            console.log('  - debugChat() - показать состояние');
            console.log('  - forceOpenChat() - принудительно открыть');
            console.log('  - forceCloseChat() - принудительно закрыть');
            console.log('  - clearChat() - очистить историю');

        }, 100);

    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
    }
});

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
    if (event.error && event.error.message.includes('QabyldauBot')) {
        console.error('❌ Ошибка виджета:', event.error);
    }
});