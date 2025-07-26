/**
 * QabyldauBot Universal Widget Configuration
 * ГЛАВНЫЙ ФАЙЛ КОНФИГУРАЦИИ - изменения здесь влияют на ВСЕ виджеты
 * 
 * Этот файл позволяет централизованно управлять всеми аспектами
 * виджета QabyldauBot включая персонажа, чат и поведение.
 */

window.UniversalWidgetConfig = {
    
    // ============================================
    // ОСНОВНЫЕ НАСТРОЙКИ ВИДЖЕТА
    // ============================================
    
    widget: {
        // Версия конфигурации (для отслеживания изменений)
        version: "1.0.0",
        
        // Включение/отключение компонентов
        features: {
            characterAvatar: true,      // Показывать 2D персонажа
            speechSynthesis: true,      // Озвучка ответов
            chatWidget: true,           // Основной чат-виджет
            quickReplies: true,         // Быстрые ответы
            languageSwitch: true,       // Переключение языков
            animations: true,           // Анимации
            sounds: false,              // Звуковые эффекты
            notifications: true         // Уведомления
        },
        
        // Общие настройки позиционирования
        positioning: {
            side: "right",              // "left" или "right"
            bottomOffset: 20,           // Отступ снизу (px)
            sideOffset: 20,             // Отступ сбоку (px)
            zIndex: 9999               // Z-index для всех элементов виджета
        },
        
        // Режимы работы
        modes: {
            development: false,         // Режим разработки (больше логов)
            standalone: false,          // Автономный режим (без сервера)
            embedded: true,             // Встроенный режим (с интеграцией)
            demo: false                 // Демо-режим
        }
    },

    // ============================================
    // НАСТРОЙКИ ПЕРСОНАЖА
    // ============================================
    
    character: {
        // Основные параметры
        enabled: true,
        name: "QabyldauBot",
        style: "university",            // "cute", "professional", "university", "friendly"
        
        // Размер и позиция
        size: {
            width: 120,
            height: 150,
            scale: 1.0                  // Масштаб (0.5-2.0)
        },
        
        position: {
            relativeTo: "chat-button",  // "chat-button", "chat-window", "viewport"
            offsetX: -140,              // Смещение по X
            offsetY: -20,               // Смещение по Y
            alignment: "bottom-right"    // Выравнивание
        },
        
        // Внешний вид
        appearance: {
            // Цветовая схема (можно менять для разных тем)
            colorScheme: "university",  // "university", "blue", "green", "purple", "custom"
            
            // Кастомные цвета (используются при colorScheme: "custom")
            customColors: {
                primary: "#3b57b3",
                secondary: "#5e7ee7", 
                accent: "#1a3eb3",
                skin: "#fdbcb4",
                hair: "#4a5568",
                eyes: "#3b57b3",
                outfit: "#ffffff"
            },
            
            // Аксессуары
            accessories: {
                graduationHat: true,    // Шапочка выпускника
                glasses: false,         // Очки
                tie: true,              // Галстук/бабочка
                badge: false,           // Бейдж университета
                cape: false             // Мантия
            }
        },
        
        // Поведение
        behavior: {
            showOnLoad: true,           // Показать при загрузке
            hideWhenChatOpen: false,    // Скрывать при открытом чате
            greetUser: true,            // Приветствовать пользователя
            autoReact: true,            // Автоматически реагировать на сообщения
            followMouse: false,         // Следить глазами за мышью
            clickableActions: true      // Реакция на клики
        },
        
        // Анимации
        animations: {
            idle: {
                enabled: true,
                blinking: true,         // Моргание
                breathing: true,        // Дыхание
                headMovement: true,     // Движения головы
                interval: 3000          // Интервал между анимациями (мс)
            },
            
            emotions: {
                enabled: true,
                autoDetect: true,       // Автоопределение эмоций
                duration: 2000,         // Длительность эмоции (мс)
                types: ["happy", "excited", "thinking", "confused", "helpful", "neutral"]
            },
            
            gestures: {
                enabled: true,
                waving: true,           // Махание рукой
                nodding: true,          // Кивание
                pointing: false,        // Указание
                clapping: false         // Хлопание
            }
        }
    },

    // ============================================
    // НАСТРОЙКИ РЕЧИ
    // ============================================
    
    speech: {
        enabled: true,
        autoSpeak: true,                // Автоматически озвучивать ответы бота
        
        // Настройки для разных языков
        languages: {
            ru: {
                voice: "ru-RU",
                rate: 0.9,              // Скорость речи (0.1-2.0)
                pitch: 1.1,             // Высота голоса (0.1-2.0)
                volume: 0.8,            // Громкость (0.0-1.0)
                enabled: true
            },
            kk: {
                voice: "ru-RU",         // Используем русский голос для казахского
                rate: 0.85,
                pitch: 1.0,
                volume: 0.8,
                enabled: true
            }
        },
        
        // Визуальные эффекты
        visualEffects: {
            speechBubble: true,         // Пузырь с текстом
            soundWaves: true,           // Звуковые волны
            mouthAnimation: true,       // Анимация рта
            glowEffect: true            // Свечение при разговоре
        },
        
        // Фильтры текста
        textFilters: {
            removeLinks: true,          // Убирать ссылки из речи
            removeEmojis: false,        // Убирать эмодзи
            maxLength: 200,             // Максимальная длина для озвучки
            cleanEnglish: true          // Очищать английские слова
        }
    },

    // ============================================
    // НАСТРОЙКИ ЧАТА
    // ============================================
    
    chat: {
        // Внешний вид
        appearance: {
            theme: "university",        // "light", "dark", "university", "custom"
            borderRadius: 16,           // Скругление углов (px)
            shadowIntensity: "medium",  // "light", "medium", "strong", "none"
            transparency: 0.95          // Прозрачность фона (0.1-1.0)
        },
        
        // Размеры
        dimensions: {
            width: 320,                 // Ширина окна чата (px)
            height: 500,                // Максимальная высота (px)
            minHeight: 400,             // Минимальная высота (px)
            buttonSize: 60              // Размер кнопки чата (px)
        },
        
        // Поведение
        behavior: {
            openOnClick: true,          // Открывать по клику
            closeOnOutsideClick: true,  // Закрывать при клике вне чата
            rememberState: true,        // Запоминать состояние (открыт/закрыт)
            showTypingIndicator: true,  // Показывать индикатор печатания
            showTimestamps: true,       // Показывать время сообщений
            autoScroll: true            // Автопрокрутка к новым сообщениям
        },
        
        // Быстрые ответы
        quickReplies: {
            enabled: true,
            shuffle: true,              // Перемешивать порядок
            maxVisible: 5,              // Максимум видимых кнопок
            autoRefresh: true,          // Обновлять после использования
            
            // Кнопки быстрых ответов
            buttons: {
                ru: [
                    "Как поступить?",
                    "Какие справки нужны?", 
                    "Специальности",
                    "Расписание",
                    "Спасибо!",
                    "Контакты",
                    "Стоимость обучения",
                    "Общежитие"
                ],
                kk: [
                    "Қалай түсуге болады?",
                    "Қандай анықтамалар керек?",
                    "Мамандықтар", 
                    "Кесте",
                    "Рахмет!",
                    "Байланыс",
                    "Оқу құны",
                    "Жатақхана"
                ]
            }
        }
    },

    // ============================================
    // ЯЗЫКОВЫЕ НАСТРОЙКИ
    // ============================================
    
    localization: {
        defaultLanguage: "ru",          // Язык по умолчанию
        autoDetect: false,              // Автоопределение языка браузера
        
        // Тексты интерфейса
        texts: {
            ru: {
                // Персонаж
                characterGreeting: "Привет! Я ваш помощник QabyldauBot! 👋",
                characterThinking: "Думаю...",
                characterListening: "Слушаю вас...",
                characterSpeaking: "Говорю...",
                characterError: "Извините, что-то пошло не так 😔",
                
                // Чат
                chatPlaceholder: "Введите ваш вопрос...",
                chatWelcome: "Привет! Я QabyldauBot. Задайте вопрос о поступлении в университет \"Болашак\".",
                chatTyping: "QabyldauBot печатает...",
                chatError: "Извините, произошла ошибка. Попробуйте позже.",
                
                // Кнопки
                buttonSend: "Отправить",
                buttonClose: "Закрыть",
                buttonClear: "Очистить",
                
                // Подсказки
                hoverHint: "Нажмите для общения",
                clickHint: "Кликните для подсказки"
            },
            
            kk: {
                // Персонаж
                characterGreeting: "Сәлем! Мен сіздің көмекшіңіз QabyldauBot! 👋",
                characterThinking: "Ойлап жатырмын...",
                characterListening: "Сізді тыңдап отырмын...",
                characterSpeaking: "Айтып отырмын...",
                characterError: "Кешіріңіз, бірдеңе дұрыс болмады 😔",
                
                // Чат
                chatPlaceholder: "Сұрағыңызды енгізіңіз...",
                chatWelcome: "Сәлем! Мен QabyldauBot-пын. \"Болашақ\" университетіне түсу туралы сұрақ қойыңыз.",
                chatTyping: "QabyldauBot жазып жатыр...",
                chatError: "Кешіріңіз, қате орын алды. Кейінірек қайталап көріңіз.",
                
                // Кнопки
                buttonSend: "Жіберу",
                buttonClose: "Жабу", 
                buttonClear: "Тазалау",
                
                // Подсказки
                hoverHint: "Сөйлесу үшін басыңыз",
                clickHint: "Кеңес алу үшін басыңыз"
            }
        }
    },

    // ============================================
    // НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ
    // ============================================
    
    performance: {
        // Оптимизация анимаций
        animations: {
            useCSS3: true,              // Использовать CSS3 анимации
            useRequestAnimationFrame: true, // Использовать RAF для плавности
            reducedMotion: true,        // Учитывать настройки пользователя
            maxFPS: 60,                 // Максимальная частота кадров
            enableGPUAcceleration: true // GPU ускорение
        },
        
        // Ленивая загрузка
        lazyLoading: {
            enabled: true,
            speechVoices: true,         // Отложенная загрузка голосов
            largeAssets: true,          // Отложенная загрузка больших ресурсов
            animations: false           // Отложенная загрузка анимаций
        },
        
        // Оптимизация памяти
        memory: {
            messageHistoryLimit: 50,    // Лимит истории сообщений
            cleanupInterval: 300000,    // Интервал очистки (мс)
            garbageCollection: true     // Принудительная очистка памяти
        }
    },

    // ============================================
    // НАСТРОЙКИ ОТЛАДКИ
    // ============================================
    
    debug: {
        enabled: false,                 // Общее включение отладки
        verbose: false,                 // Подробные логи
        
        // Конкретные компоненты
        components: {
            character: false,           // Отладка персонажа
            chat: false,                // Отладка чата
            speech: false,              // Отладка речи
            integration: false,         // Отладка интеграции
            performance: false          // Отладка производительности
        },
        
        // Визуальная отладка
        visual: {
            showBounds: false,          // Показать границы элементов
            showFPS: false,             // Показать FPS
            showMemoryUsage: false,     // Показать использование памяти
            highlightEvents: false      // Подсвечивать события
        },
        
        // Команды отладки
        commands: {
            enabled: true,              // Включить команды в консоли
            prefix: "qabot",            // Префикс команд (qabot.showCharacter())
            shortcuts: true             // Включить горячие клавиши
        }
    },

    // ============================================
    // ИНТЕГРАЦИОННЫЕ НАСТРОЙКИ
    // ============================================
    
    integration: {
        // API настройки
        api: {
            baseUrl: "/api",            // Базовый URL API
            timeout: 10000,             // Таймаут запросов (мс)
            retries: 3,                 // Количество повторов
            retryDelay: 1000           // Задержка между повторами (мс)
        },
        
        // Внешние сервисы
        services: {
            analytics: false,           // Аналитика
            errorReporting: false,      // Отчеты об ошибках
            feedbackCollection: true,   // Сбор отзывов
            abTesting: false           // A/B тестирование
        },
        
        // Безопасность
        security: {
            validateInput: true,        // Валидация ввода
            sanitizeOutput: true,       // Санитизация вывода
            rateLimiting: true,         // Ограничение частоты запросов
            csrfProtection: true       // CSRF защита
        }
    }
};

// ============================================
// ФУНКЦИИ УПРАВЛЕНИЯ КОНФИГУРАЦИЕЙ
// ============================================

/**
 * Получить конфигурацию для конкретного языка
 */
UniversalWidgetConfig.getForLanguage = function(language = 'ru') {
    const config = JSON.parse(JSON.stringify(this));
    config.currentLanguage = language;
    config.currentTexts = this.localization.texts[language] || this.localization.texts.ru;
    config.currentSpeech = this.speech.languages[language] || this.speech.languages.ru;
    return config;
};

/**
 * Обновить конфигурацию
 */
UniversalWidgetConfig.update = function(updates) {
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
    
    // Уведомляем всех слушателей об изменении конфигурации
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('widgetConfigUpdated', { 
            detail: { config: this, updates } 
        }));
    }
};

/**
 * Сбросить конфигурацию к значениям по умолчанию
 */
UniversalWidgetConfig.reset = function() {
    // Здесь можно реализовать сброс к дефолтным значениям
    console.log('🔄 Конфигурация сброшена к значениям по умолчанию');
};

/**
 * Валидировать конфигурацию
 */
UniversalWidgetConfig.validate = function() {
    const errors = [];
    
    // Проверяем обязательные поля
    if (!this.character.name) {
        errors.push('character.name is required');
    }
    
    if (this.character.size.scale < 0.1 || this.character.size.scale > 3.0) {
        errors.push('character.size.scale must be between 0.1 and 3.0');
    }
    
    if (this.speech.languages.ru.rate < 0.1 || this.speech.languages.ru.rate > 2.0) {
        errors.push('speech rate must be between 0.1 and 2.0');
    }
    
    // Возвращаем результат валидации
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// ============================================
// ПРЕДУСТАНОВКИ (ПРЕСЕТЫ)
// ============================================

UniversalWidgetConfig.presets = {
    // Минималистичный режим
    minimal: {
        character: { enabled: false },
        speech: { enabled: false },
        chat: { 
            quickReplies: { enabled: false },
            appearance: { theme: "light" }
        }
    },
    
    // Полнофункциональный режим  
    full: {
        character: { 
            enabled: true,
            animations: {
                idle: { enabled: true },
                emotions: { enabled: true },
                gestures: { enabled: true }
            }
        },
        speech: { enabled: true },
        chat: { quickReplies: { enabled: true } }
    },
    
    // Мобильная версия
    mobile: {
        character: { 
            size: { scale: 0.8 },
            position: { offsetX: -100 }
        },
        chat: {
            dimensions: { width: 280, height: 400 }
        }
    },
    
    // Режим для слабовидящих
    accessibility: {
        character: { animations: { idle: { enabled: false } } },
        speech: { enabled: true, autoSpeak: true },
        chat: { 
            appearance: { theme: "dark" },
            behavior: { showTimestamps: true }
        }
    }
};

/**
 * Применить пресет
 */
UniversalWidgetConfig.applyPreset = function(presetName) {
    if (this.presets[presetName]) {
        this.update(this.presets[presetName]);
        console.log(`✅ Применен пресет: ${presetName}`);
    } else {
        console.error(`❌ Пресет не найден: ${presetName}`);
    }
};

// ============================================
// ЭКСПОРТ И ИНИЦИАЛИЗАЦИЯ
// ============================================

// Автоматическое применение конфигурации к существующим компонентам
if (typeof window !== 'undefined') {
    // Обновляем существующую конфигурацию CharacterConfig
    if (window.CharacterConfig) {
        window.CharacterConfig.update(UniversalWidgetConfig);
    }
    
    // Делаем доступными глобальные команды
    window.widgetConfig = UniversalWidgetConfig;
    
    // Команды быстрой настройки
    window.setCharacterStyle = (style) => {
        UniversalWidgetConfig.update({ character: { style } });
    };
    
    window.setTheme = (theme) => {
        UniversalWidgetConfig.update({ 
            chat: { appearance: { theme } },
            character: { appearance: { colorScheme: theme } }
        });
    };
    
    window.toggleCharacter = () => {
        const enabled = !UniversalWidgetConfig.character.enabled;
        UniversalWidgetConfig.update({ character: { enabled } });
        
        if (window.characterIntegration) {
            if (enabled) {
                window.characterIntegration.showCharacter();
            } else {
                window.characterIntegration.hideCharacter();
            }
        }
    };
}

// Логирование успешной загрузки
console.log('✅ Универсальная конфигурация виджета загружена');
console.log('🔧 Доступные команды:');
console.log('  - widgetConfig.update(settings) - обновить настройки');
console.log('  - widgetConfig.applyPreset(name) - применить пресет');
console.log('  - setCharacterStyle(style) - изменить стиль персонажа');
console.log('  - setTheme(theme) - изменить тему');
console.log('  - toggleCharacter() - включить/выключить персонажа');

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalWidgetConfig;
}