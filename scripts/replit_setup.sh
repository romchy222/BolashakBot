#!/bin/bash

# Скрипт для настройки проекта на Replit

echo "===== Начало настройки проекта на Replit ====="

# Создаем директорию для скриптов, если она не существует
mkdir -p scripts

# Устанавливаем зависимости
echo "Установка зависимостей Python..."
pip install -r requirements.txt

# Создаем директорию для загрузок, если её нет
echo "Создание директории для загрузок..."
mkdir -p uploads

# Создаем директорию для миграций, если её нет
echo "Подготовка директории для миграций..."
mkdir -p migrations

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Создание .env файла из примера..."
    cp .env.example .env
    echo "FLASK_ENV=development" >> .env
    echo "REPLIT_ENVIRONMENT=true" >> .env
fi

# Применяем миграции базы данных
echo "Запуск миграций базы данных..."
python setup_db.py

echo "===== Настройка завершена! ====="
echo "Запустите проект командой: python app_replit.py"
