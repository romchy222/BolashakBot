# Интеграция QabyldauBot на сайт университета

## Способы интеграции виджета

### 1. Встраивание через iframe (Простой способ)

Добавьте этот код в любое место на вашем сайте:

```html
<!-- QabyldauBot Widget Integration -->
<iframe 
    src="https://ваш-домен.replit.app/widget" 
    width="400" 
    height="500" 
    frameborder="0" 
    style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
</iframe>
```

### 2. Прямая интеграция JavaScript (Рекомендуемый способ)

#### Шаг 1: Добавьте CSS стили
Скопируйте содержимое файла `static/css/style.css` в ваши стили или подключите как внешний файл:

```html
<link rel="stylesheet" href="https://ваш-домен.replit.app/static/css/style.css">
```

#### Шаг 2: Добавьте HTML разметку виджета
Вставьте этот код перед закрывающим тегом `</body>`:

```html
<!-- QabyldauBot Chat Widget -->
<div id="chat-widget" class="fixed bottom-6 right-6 z-50">
    <!-- Chat Button -->
    <button id="chat-button" class="bg-bolashak-blue text-white p-4 rounded-full shadow-lg hover:bg-bolashak-dark transition-all duration-300 hover:scale-110">
        <i class="fas fa-comments text-xl"></i>
    </button>
    
    <!-- Chat Window -->
    <div id="chat-window" class="hidden absolute bottom-16 right-0 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
        <!-- Chat Header -->
        <div class="bg-bolashak-blue text-white p-4 rounded-t-lg flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <i class="fas fa-robot"></i>
                <span class="font-semibold">QabyldauBot</span>
            </div>
            <div class="flex space-x-2">
                <!-- Language Toggle -->
                <select id="language-selector" class="bg-bolashak-dark text-white text-sm rounded px-2 py-1 border-none">
                    <option value="ru">Русский</option>
                    <option value="kk">Қазақша</option>
                </select>
                <button id="close-chat" class="text-white hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <!-- Chat Messages -->
        <div id="chat-messages" class="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            <div class="bot-message bg-white p-3 rounded-lg shadow-sm max-w-xs">
                <p class="text-sm text-gray-800" id="welcome-message">Привет! Я QabyldauBot. Задайте вопрос о поступлении в университет "Болашак".</p>
            </div>
        </div>
        
        <!-- Chat Input -->
        <div class="p-4 border-t border-gray-200">
            <div class="flex space-x-2">
                <input 
                    type="text" 
                    id="chat-input" 
                    placeholder="Введите ваш вопрос..." 
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bolashak-blue"
                    maxlength="500"
                >
                <button 
                    id="send-button" 
                    class="bg-bolashak-blue text-white px-4 py-2 rounded-lg hover:bg-bolashak-dark transition-colors"
                >
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
        
        <!-- Typing Indicator -->
        <div id="typing-indicator" class="hidden p-4 border-t border-gray-200">
            <div class="flex items-center space-x-2 text-gray-500 text-sm">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span>QabyldauBot печатает...</span>
            </div>
        </div>
    </div>
</div>
```

#### Шаг 3: Подключите JavaScript
Добавьте скрипт перед закрывающим тегом `</body>`:

```html
<script>
// Настройте URL вашего QabyldauBot API
const QABYLDAUBOT_API_URL = 'https://ваш-домен.replit.app/api/chat';

// QabyldauBot Chat Widget JavaScript
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.currentLanguage = 'ru';
        this.isTyping = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateLanguage();
    }
    
    initializeElements() {
        this.chatButton = document.getElementById('chat-button');
        this.chatWindow = document.getElementById('chat-window');
        this.closeButton = document.getElementById('close-chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.languageSelector = document.getElementById('language-selector');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.welcomeMessage = document.getElementById('welcome-message');
    }
    
    bindEvents() {
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.closeChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.languageSelector.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
        });
        
        this.chatWindow.addEventListener('click', (e) => e.stopPropagation());
        
        document.addEventListener('click', (e) => {
            if (!this.chatWindow.contains(e.target) && !this.chatButton.contains(e.target)) {
                if (this.isOpen) {
                    this.closeChat();
                }
            }
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatWindow.classList.remove('hidden');
        this.isOpen = true;
        this.chatInput.focus();
        this.chatButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
    }
    
    closeChat() {
        this.chatWindow.classList.add('hidden');
        this.isOpen = false;
        this.chatButton.innerHTML = '<i class="fas fa-comments text-xl"></i>';
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
        this.welcomeMessage.textContent = currentMessages.welcome;
        this.chatInput.placeholder = currentMessages.placeholder;
        
        const typingText = this.typingIndicator.querySelector('span');
        if (typingText) {
            typingText.textContent = currentMessages.typing;
        }
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }
        
        this.chatInput.value = '';
        this.addMessage(message, 'user');
        this.showTyping();
        
        try {
            const response = await fetch(QABYLDAUBOT_API_URL, {
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
                this.addMessage(data.response, 'bot');
            } else {
                throw new Error(data.error || 'Произошла ошибка');
            }
            
        } catch (error) {
            this.hideTyping();
            const errorMessages = {
                ru: 'Извините, произошла ошибка. Попробуйте позже.',
                kk: 'Кешіріңіз, қате орын алды. Кейінірек қайталап көріңіз.'
            };
            this.addMessage(errorMessages[this.currentLanguage], 'bot', true);
        }
    }
    
    addMessage(text, sender, isError = false) {
        const messageDiv = document.createElement('div');
        const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
        const errorClass = isError ? ' error-message' : '';
        
        messageDiv.className = `${messageClass}${errorClass} p-3 rounded-lg shadow-sm max-w-xs message-sent`;
        
        const textP = document.createElement('p');
        textP.className = 'text-sm text-gray-800 mb-1';
        textP.textContent = text;
        messageDiv.appendChild(textP);
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        messageDiv.appendChild(timeSpan);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTyping() {
        this.isTyping = true;
        this.typingIndicator.classList.remove('hidden');
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.classList.add('hidden');
        this.sendButton.disabled = false;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

// Initialize chat widget
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});
</script>
```

### 3. Требуемые зависимости

Убедитесь, что на вашем сайте подключены:

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Font Awesome для иконок -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<script>
// Настройка цветов Болашак
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'bolashak-blue': '#1e40af',
                'bolashak-light': '#3b82f6',
                'bolashak-dark': '#1e3a8a'
            }
        }
    }
}
</script>
```

## Настройка для продакшена

1. **Замените домен**: Измените `ваш-домен.replit.app` на актуальный домен вашего QabyldauBot
2. **CORS настройки**: Убедитесь, что ваш сайт университета добавлен в разрешенные домены
3. **SSL сертификат**: Используйте HTTPS для безопасной работы

## Кастомизация

Вы можете изменить:
- Цвета виджета в CSS (переменные `bolashak-blue`, `bolashak-light`, `bolashak-dark`)
- Размер и позицию виджета
- Тексты приветствия и сообщений
- Логотип университета

## Поддержка и управление

- Админ-панель доступна по адресу: `https://ваш-домен.replit.app/admin`
- Там можно управлять FAQ, категориями и просматривать статистику обращений