/**
 * QabyldauBot 2D Character Configuration
 * Centralized configuration for the animated character avatar
 * Change settings here to customize the character across all instances
 */

const CharacterConfig = {
    // === ОСНОВНЫЕ НАСТРОЙКИ ПЕРСОНАЖА ===
    character: {
        name: "QabyldauBot",
        gender: "neutral", // "male", "female", "neutral"
        style: "cute", // "cute", "professional", "friendly", "anime"
        size: {
            width: 120,
            height: 150
        }
    },

    // === ВНЕШНИЙ ВИД ===
    appearance: {
        // Цвета персонажа
        colors: {
            primary: "#3b57b3",      // Основной цвет (синий университета)
            secondary: "#5e7ee7",    // Дополнительный цвет
            accent: "#1a3eb3",       // Акцентный цвет
            skin: "#fdbcb4",         // Цвет кожи
            hair: "#4a5568",         // Цвет волос
            eyes: "#3b57b3",         // Цвет глаз
            outfit: "#ffffff"        // Цвет одежды
        },
        
        // Элементы персонажа
        features: {
            showHat: true,           // Показать шапочку магистра
            showGlasses: false,      // Показать очки
            showTie: true,           // Показать галстук/бабочку
            expressiveEyes: true,    // Выразительные глаза
            animatedHair: true       // Анимированные волосы
        }
    },

    // === АНИМАЦИИ ===
    animations: {
        // Базовые анимации
        idle: {
            enabled: true,
            blinkInterval: 3000,     // Моргание каждые 3 секунды
            breathingSpeed: 4000,    // Дыхание каждые 4 секунды
            headMovement: true,      // Легкие повороты головы
            eyeMovement: true        // Движение глаз
        },

        // Анимации разговора
        speaking: {
            enabled: true,
            mouthAnimation: true,    // Анимация рта
            headBobbing: true,       // Покачивание головой
            handGestures: true,      // Жесты руками
            syncWithSpeech: true     // Синхронизация с речью
        },

        // Анимации эмоций
        emotions: {
            enabled: true,
            duration: 1500,          // Длительность эмоции (мс)
            autoDetect: true,        // Автоопределение эмоций из текста
            expressions: {
                happy: true,
                sad: false,          // Отключаем грустные эмоции для университетского бота
                excited: true,
                thinking: true,
                confused: true,
                helpful: true
            }
        },

        // Анимации взаимодействия
        interactions: {
            hoverEffect: true,       // Реакция на наведение мыши
            clickEffect: true,       // Реакция на клик
            tapToTalk: true,         // Нажатие для разговора
            followMouse: false,      // Следить глазами за мышью
            waveOnHello: true        // Махать рукой при приветствии
        }
    },

    // === ГОЛОС И РЕЧЬ ===
    speech: {
        enabled: true,
        autoSpeak: true,             // Автоматически озвучивать ответы
        
        // Настройки для русского языка
        russian: {
            voice: "ru-RU",
            rate: 0.9,               // Скорость речи
            pitch: 1.1,              // Высота голоса
            volume: 0.8              // Громкость
        },

        // Настройки для казахского языка
        kazakh: {
            voice: "ru-RU",          // Используем русский голос для казахского
            rate: 0.85,
            pitch: 1.0,
            volume: 0.8
        },

        // Визуальные эффекты речи
        visualEffects: {
            speechBubble: true,      // Пузырь с текстом
            soundWaves: true,        // Звуковые волны
            glowEffect: true         // Свечение при разговоре
        }
    },

    // === ПОЗИЦИОНИРОВАНИЕ ===
    positioning: {
        container: "chat-widget",   // ID контейнера
        position: "bottom-right",   // Позиция: "bottom-right", "bottom-left", "top-right", "top-left"
        offset: {
            x: -140,                // Смещение по X от кнопки чата
            y: -20                  // Смещение по Y от кнопки чата
        },
        zIndex: 10000,              // Z-index для персонажа
        responsive: true,           // Адаптивное позиционирование
        connectToMessages: true     // Соединять персонажа с сообщениями чата
    },

    // Интеграция с аватарами
    avatarIntegration: {
        enabled: true,              // Включить интеграцию аватаров
        replaceAvatars: true,       // Заменять аватары бота на персонажа
        connectVisually: true,      // Визуально соединять персонажа с сообщениями
        animateWithSpeech: true,    // Анимировать связь во время речи
        defaultUserAvatar: null     // URL изображения для аватара пользователя по умолчанию
    },

    // === ПОВЕДЕНИЕ ===
    behavior: {
        showOnLoad: true,           // Показать персонажа при загрузке
        hideWhenChatOpen: false,    // Скрывать когда чат открыт
        greetingMessage: true,      // Показать приветствие при первом появлении
        helpHints: true,            // Показывать подсказки
        contextAware: true,         // Учитывать контекст разговора
        personality: "helpful"      // "helpful", "playful", "professional", "friendly"
    },

    // === НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ ===
    performance: {
        useCSS3: true,              // Использовать CSS3 анимации
        useWebGL: false,            // Использовать WebGL (для будущих улучшений)
        reducedMotion: true,        // Учитывать настройки пользователя о движении
        lazyLoading: true,          // Ленивая загрузка ресурсов
        frameRate: 30               // Целевая частота кадров
    },

    // === ОТЛАДКА ===
    debug: {
        enabled: false,             // Включить режим отладки
        showBounds: false,          // Показать границы элементов
        logAnimations: false,       // Логировать анимации
        showFPS: false              // Показать FPS
    },

    // === ЯЗЫКОВЫЕ НАСТРОЙКИ ===
    messages: {
        ru: {
            greeting: "Привет! Я ваш помощник QabyldauBot! 👋",
            thinking: "Думаю...",
            listening: "Слушаю вас...",
            typing: "Печатаю ответ...",
            error: "Извините, что-то пошло не так 😔",
            helpHint: "Нажмите на меня для подсказки!"
        },
        kk: {
            greeting: "Сәлем! Мен сіздің көмекшіңіз QabyldauBot! 👋",
            thinking: "Ойлап жатырмын...",
            listening: "Сізді тыңдап отырмын...",
            typing: "Жауап жазып отырмын...",
            error: "Кешіріңіз, бірдеңе дұрыс болмады 😔",
            helpHint: "Кеңес алу үшін маған басыңыз!"
        }
    }
};

// === ЭКСПОРТ КОНФИГУРАЦИИ ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterConfig;
} else if (typeof window !== 'undefined') {
    window.CharacterConfig = CharacterConfig;
}

/**
 * Функция для получения конфигурации по языку
 * @param {string} language - Код языка ('ru' или 'kk')
 * @returns {object} Конфигурация для указанного языка
 */
CharacterConfig.getForLanguage = function(language = 'ru') {
    const config = JSON.parse(JSON.stringify(this)); // Глубокая копия
    config.currentLanguage = language;
    config.currentMessages = this.messages[language] || this.messages.ru;
    config.currentSpeech = this.speech[language === 'kk' ? 'kazakh' : 'russian'];
    return config;
};

/**
 * Функция для обновления конфигурации
 * @param {object} updates - Объект с обновлениями
 */
CharacterConfig.update = function(updates) {
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    deepMerge(this, updates);
};

console.log('✅ Character configuration loaded:', CharacterConfig.character.name);