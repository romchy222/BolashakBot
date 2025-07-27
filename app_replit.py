"""Основной файл приложения для запуска на Replit"""

import os
from app import create_app

# Создаем экземпляр приложения
app = create_app()

# Специальные настройки для Replit
app.config['PREFERRED_URL_SCHEME'] = 'https'

# Настройка для работы за прокси Replit
from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Запуск миграций перед стартом приложения
try:
    print("Проверка и применение миграций...")
    from setup_db import run_migrations
    run_migrations()
except Exception as e:
    print(f"Предупреждение: не удалось выполнить миграции автоматически: {e}")

# Запуск приложения
if __name__ == '__main__':
    # Получаем порт из переменной окружения Replit или используем порт по умолчанию
    port = int(os.environ.get('PORT', 8080))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
