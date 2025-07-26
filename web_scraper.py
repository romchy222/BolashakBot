import trafilatura
import requests
from urllib.parse import urljoin, urlparse
import time
from models import Category, FAQ, db
from datetime import datetime
import re


class UniversityScraper:
    def __init__(self, base_url="https://bolashak-edu.kz/"):
        self.base_url = base_url
        self.visited_urls = set()
        self.scraped_content = []
        
    def get_website_text_content(self, url: str) -> str:
        """
        Извлекает основной текстовый контент с веб-страницы
        """
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                text = trafilatura.extract(downloaded)
                return text or ""
            return ""
        except Exception as e:
            print(f"Ошибка при обработке {url}: {e}")
            return ""
    
    def extract_links(self, url: str) -> list:
        """
        Извлекает все ссылки со страницы
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Простое извлечение ссылок
            links = re.findall(r'href=[\'"]?([^\'" >]+)', response.text)
            full_links = []
            
            for link in links:
                if link.startswith('http'):
                    full_links.append(link)
                elif link.startswith('/'):
                    full_links.append(urljoin(self.base_url, link))
                    
            return full_links
        except Exception as e:
            print(f"Ошибка извлечения ссылок с {url}: {e}")
            return []
    
    def scrape_university_data(self, max_pages=50):
        """
        Собирает данные с сайта университета
        """
        to_visit = [self.base_url]
        visited_count = 0
        
        # Приоритетные разделы для поступления
        priority_paths = [
            '/admission', '/postupenie', '/priem', '/abiturient',
            '/faculty', '/fakultet', '/programs', '/programmy',
            '/documents', '/dokumenty', '/schedule', '/raspisanie',
            '/contacts', '/kontakty', '/about', '/o-universitete'
        ]
        
        while to_visit and visited_count < max_pages:
            current_url = to_visit.pop(0)
            
            if current_url in self.visited_urls:
                continue
                
            if not current_url.startswith(self.base_url):
                continue
                
            print(f"Обрабатываю: {current_url}")
            
            # Извлекаем контент
            content = self.get_website_text_content(current_url)
            
            if content and len(content) > 100:  # Минимальная длина контента
                self.scraped_content.append({
                    'url': current_url,
                    'content': content,
                    'scraped_at': datetime.utcnow(),
                    'priority': self._is_priority_page(current_url, priority_paths)
                })
                
                # Извлекаем новые ссылки
                new_links = self.extract_links(current_url)
                for link in new_links:
                    if link not in self.visited_urls and link not in to_visit:
                        # Приоритет для важных разделов
                        if self._is_priority_page(link, priority_paths):
                            to_visit.insert(0, link)  # В начало списка
                        else:
                            to_visit.append(link)
            
            self.visited_urls.add(current_url)
            visited_count += 1
            
            # Вежливая задержка
            time.sleep(1)
            
        print(f"Собрано {len(self.scraped_content)} страниц")
        return self.scraped_content
    
    def _is_priority_page(self, url: str, priority_paths: list) -> bool:
        """
        Проверяет, является ли страница приоритетной
        """
        url_lower = url.lower()
        return any(path in url_lower for path in priority_paths)
    
    def process_content_to_faqs(self):
        """
        Обрабатывает собранный контент и создает FAQ записи
        """
        processed_faqs = []
        
        for item in self.scraped_content:
            content = item['content']
            url = item['url']
            
            # Определяем категорию по URL
            category = self._determine_category(url)
            
            # Разбиваем контент на логические блоки
            sections = self._split_content_into_sections(content)
            
            for section in sections:
                if len(section.strip()) > 50:  # Минимальная длина секции
                    # Создаем структурированный FAQ
                    faq_data = self._create_structured_faq(section, category)
                    if faq_data:
                        processed_faqs.append(faq_data)
        
        return processed_faqs
    
    def _determine_category(self, url: str) -> str:
        """
        Определяет категорию на основе URL
        """
        url_lower = url.lower()
        
        if any(word in url_lower for word in ['admission', 'postupenie', 'priem', 'abiturient']):
            return 'Поступление'
        elif any(word in url_lower for word in ['faculty', 'fakultet']):
            return 'Факультеты'
        elif any(word in url_lower for word in ['programs', 'programmy', 'speciality']):
            return 'Программы обучения'
        elif any(word in url_lower for word in ['documents', 'dokumenty']):
            return 'Документы'
        elif any(word in url_lower for word in ['schedule', 'raspisanie']):
            return 'Расписание'
        elif any(word in url_lower for word in ['contacts', 'kontakty']):
            return 'Контакты'
        elif any(word in url_lower for word in ['hostel', 'obshaga', 'obshejitie']):
            return 'Общежитие'
        else:
            return 'Общая информация'
    
    def _split_content_into_sections(self, content: str) -> list:
        """
        Разбивает контент на логические секции
        """
        # Разбиваем по абзацам и заголовкам
        sections = []
        
        # Разделяем по двойным переносам строк
        paragraphs = content.split('\n\n')
        
        current_section = ""
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            
            if not paragraph:
                continue
                
            # Если параграф похож на заголовок (короткий, заглавные буквы)
            if len(paragraph) < 100 and (paragraph.isupper() or paragraph.istitle()):
                if current_section:
                    sections.append(current_section)
                current_section = paragraph + "\n\n"
            else:
                current_section += paragraph + "\n\n"
        
        if current_section:
            sections.append(current_section)
            
        return sections
    
    def _create_structured_faq(self, content: str, category: str) -> dict:
        """
        Создает структурированный FAQ на основе контента
        """
        # Простой алгоритм создания вопроса из контента
        lines = content.strip().split('\n')
        
        # Берем первую строку как потенциальный заголовок/вопрос
        first_line = lines[0].strip()
        
        # Если первая строка слишком длинная, создаем вопрос
        if len(first_line) > 100:
            question = self._generate_question_from_content(content)
        else:
            question = first_line
            
        # Остальной контент как ответ
        answer = content.strip()
        
        # Очищаем от лишних символов и форматируем
        question = self._clean_text(question)
        answer = self._clean_text(answer)
        
        if len(question) < 10 or len(answer) < 20:
            return {}
            
        return {
            'category': category,
            'question_ru': question,
            'question_kk': self._translate_to_kazakh(question),
            'answer_ru': answer,
            'answer_kk': self._translate_to_kazakh(answer)
        }
    
    def _generate_question_from_content(self, content: str) -> str:
        """
        Генерирует вопрос из контента
        """
        # Простые шаблоны вопросов
        question_templates = [
            "Как происходит {}?",
            "Что нужно знать о {}?",
            "Какие требования к {}?",
            "Где можно узнать о {}?",
            "Когда проходит {}?"
        ]
        
        # Извлекаем ключевые слова
        words = content.lower().split()
        key_phrases = []
        
        # Ищем важные фразы
        important_words = ['поступление', 'документы', 'экзамен', 'программа', 'факультет', 'общежитие']
        for word in important_words:
            if word in ' '.join(words):
                key_phrases.append(word)
        
        if key_phrases:
            import random
            template = random.choice(question_templates)
            phrase = random.choice(key_phrases)
            return template.format(phrase)
        
        return "Расскажите подробнее об этом"
    
    def _clean_text(self, text: str) -> str:
        """
        Очищает текст от лишних символов
        """
        # Убираем лишние пробелы и переносы
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Убираем URL и email
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        text = re.sub(r'\S+@\S+', '', text)
        
        return text
    
    def _translate_to_kazakh(self, text: str) -> str:
        """
        Заглушка для перевода на казахский язык
        В реальной реализации здесь будет API переводчика
        """
        # Простые замены для демонстрации
        translations = {
            'Поступление': 'Түсу',
            'Документы': 'Құжаттар', 
            'Программы обучения': 'Оқу бағдарламалары',
            'Расписание': 'Кесте',
            'Факультеты': 'Факультеттер',
            'Контакты': 'Байланыс',
            'Общежитие': 'Жатақхана',
            'Университет': 'Университет',
            'Образование': 'Білім'
        }
        
        result = text
        for ru, kk in translations.items():
            result = result.replace(ru, kk)
            
        return result
    
    def save_to_database(self, faq_data_list):
        """
        Сохраняет FAQ данные в базу
        """
        saved_count = 0
        
        for faq_data in faq_data_list:
            try:
                # Проверяем, есть ли уже такая категория
                category = Category.query.filter_by(name_ru=faq_data['category']).first()
                
                if not category:
                    # Создаем новую категорию
                    category = Category()
                    category.name_ru = faq_data['category']
                    category.name_kk = self._translate_to_kazakh(faq_data['category'])
                    category.description_ru = f"Информация о: {faq_data['category']}"
                    category.description_kk = f"Мәліметтер: {self._translate_to_kazakh(faq_data['category'])}"
                    db.session.add(category)
                    db.session.flush()  # Получаем ID
                
                # Создаем FAQ запись
                faq = FAQ()
                faq.category_id = category.id
                faq.question_ru = faq_data['question_ru']
                faq.question_kk = faq_data['question_kk']
                faq.answer_ru = faq_data['answer_ru']
                faq.answer_kk = faq_data['answer_kk']
                faq.is_active = True
                
                db.session.add(faq)
                saved_count += 1
                
            except Exception as e:
                print(f"Ошибка сохранения FAQ: {e}")
                continue
        
        try:
            db.session.commit()
            print(f"Сохранено {saved_count} FAQ записей")
        except Exception as e:
            db.session.rollback()
            print(f"Ошибка сохранения в базу: {e}")
        
        return saved_count


def run_university_scraper():
    """
    Запускает процесс сбора данных с сайта университета
    """
    print("Запуск сбора данных с сайта университета...")
    
    scraper = UniversityScraper()
    
    # Собираем данные
    scraped_data = scraper.scrape_university_data(max_pages=30)
    
    if not scraped_data:
        print("Не удалось собрать данные с сайта")
        return
    
    # Обрабатываем в FAQ
    faq_data = scraper.process_content_to_faqs()
    
    if not faq_data:
        print("Не удалось создать FAQ из собранных данных")
        return
    
    # Сохраняем в базу
    saved_count = scraper.save_to_database(faq_data)
    
    print(f"Процесс завершен. Создано {saved_count} FAQ записей")
    return saved_count


if __name__ == "__main__":
    run_university_scraper()