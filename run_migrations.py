#!/usr/bin/env python
"""Скрипт для запуска миграций базы данных"""

import os
import subprocess
import sys

print("Запуск миграций базы данных...")

try:
    # Проверка наличия переменной окружения DATABASE_URL
    if 'DATABASE_URL' not in os.environ:
        print("Предупреждение: DATABASE_URL не установлен, будет использоваться SQLite по умолчанию.")

    # Проверка папки миграций
    if not os.path.exists('./migrations'):
        print("Инициализация миграций...")
        subprocess.run([sys.executable, '-m', 'flask', 'db', 'init'], check=True)

    # Создание миграции
    print("Создание миграции...")
    subprocess.run([sys.executable, '-m', 'flask', 'db', 'migrate', '-m', 'Автоматическая миграция'], check=True)

    # Применение миграции
    print("Применение миграции...")
    subprocess.run([sys.executable, '-m', 'flask', 'db', 'upgrade'], check=True)

    print("Миграция успешно завершена!")

except subprocess.CalledProcessError as e:
    print(f"Ошибка при выполнении миграции: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Неожиданная ошибка: {e}")
    sys.exit(1)
