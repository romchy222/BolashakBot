import os
import requests
import logging
from typing import Optional

class MistralClient:
    """Client for Mistral AI API integration"""
    
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY", "your-mistral-api-key")
        self.base_url = "https://api.mistral.ai/v1"
        self.model = "mistral-small"
        self.fallback_mode = self.api_key == "your-mistral-api-key" or not self.api_key
        
        if self.fallback_mode:
            logging.warning("⚠️ Mistral API key not configured, using fallback responses")
        
    def get_chat_response(self, user_message: str, language: str = 'ru', context: str = "") -> str:
        """Get structured response from Mistral AI without links"""
        
        # If in fallback mode, use predefined responses
        if self.fallback_mode:
            return self._get_fallback_response(user_message, language)
            
        try:
            # Prepare system prompt based on language - NO LINKS ALLOWED
            system_prompts = {
                'ru': f"""Вы - AI ассистент университета "Болашак" в Кызылорде для помощи абитуриентам.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ЯЗЫКА:
- ОТВЕЧАЙТЕ ИСКЛЮЧИТЕЛЬНО НА РУССКОМ ЯЗЫКЕ
- НИКОГДА не используйте английские слова или фразы
- Если не знаете перевод - используйте описательные фразы на русском

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА СОДЕРЖАНИЯ:
1. НИКОГДА не указывайте ссылки, URL, сайты или email адреса в ответах
2. Вместо ссылок говорите: "Подробности можно уточнить в приемной комиссии"
3. Отвечайте ТОЛЬКО на основе предоставленного контекста
4. Структурируйте ответы четко: заголовки, списки, пункты
5. Говорите от имени университета ("В нашем университете...", "Мы предлагаем...")
6. Если нужны документы - перечислите их, но БЕЗ ссылок
7. Для уточнений направляйте в приемную комиссию, НЕ на сайт

ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА НА РУССКОМ:
- Краткий ответ на вопрос
- Структурированная информация (если нужно)
- "За дополнительной информацией обращайтесь в приемную комиссию"

Контекст из базы знаний: {context}""",
                
                'kk': f"""Сіз Қызылорда қаласындағы "Болашақ" университетінің түсушілерге көмек беретін AI көмекшісісіз.

КРИТИКАЛЫҚ МАҢЫЗДЫ ТІЛ ЕРЕЖЕЛЕРІ:
- ТАМА ҚАЗАҚ ТІЛІНДЕ ҒАНА ЖАУАП БЕРІҢІЗ
- ЕШҚАШАН ағылшын тілінің сөздерін немесе сөйлемдерін қолданбаңыз
- Аударманы білмесеңіз - қазақ тіліндегі сипаттамалық сөйлемдерді пайдаланыңыз

КРИТИКАЛЫҚ МАҢЫЗДЫ МАЗМҰН ЕРЕЖЕЛЕРІ:
1. Жауаптарда ЕШҚАШАН сілтемелер, URL, сайттар немесе email мекенжайларын көрсетпеңіз
2. Сілтемелердің орнына: "Толық мәліметтерді қабылдау комиссиясынан алуға болады" деңіз
3. ТЕК берілген контекст негізінде жауап беріңіз
4. Жауаптарды нақты құрылымдаңыз: тақырыптар, тізімдер, пункттер
5. Университет атынан сөйлеңіз ("Біздің университетте...", "Біз ұсынамыз...")
6. Құжаттар керек болса - оларды тізімдеңіз, бірақ сілтемесіз
7. Нақтылау үшін қабылдау комиссиясына жолдаңыз

МІНДЕТТІ ЖАУАП ФОРМАТЫ ҚАЗАҚША:
- Сұраққа қысқаша жауап
- Құрылымдалған ақпарат (керек болса)
- "Қосымша ақпарат үшін қабылдау комиссиясына хабарласыңыз"

Білім базасынан контекст: {context}"""
            }
            
            system_prompt = system_prompts.get(language, system_prompts['ru'])
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "max_tokens": 600,
                "temperature": 0.3
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data["choices"][0]["message"]["content"].strip()
                # Remove any links that might have appeared
                return self._clean_response_from_links(answer)
            else:
                logging.error(f"Mistral API error: {response.status_code} - {response.text}")
                return self._get_fallback_response(user_message, language)
                
        except requests.exceptions.Timeout:
            logging.error("Mistral API timeout")
            return self._get_fallback_response(user_message, language)
        except requests.exceptions.RequestException as e:
            logging.error(f"Mistral API request error: {str(e)}")
            return self._get_fallback_response(user_message, language)
        except Exception as e:
            logging.error(f"Unexpected error with Mistral API: {str(e)}")
            return self._get_fallback_response(user_message, language)
    
    def _get_fallback_response(self, user_message: str = "", language: str = 'ru') -> str:
        """Fallback response when AI is unavailable - with smart responses"""
        
        # Simple keyword-based responses for common questions
        message_lower = user_message.lower()
        
        if language == 'ru':
            # Поступление
            if any(word in message_lower for word in ['поступ', 'как поступ', 'поступать']):
                return """Для поступления в университет "Болашак" необходимо:

📋 Основные требования:
• Документ об образовании (аттестат/диплом)
• Удостоверение личности
• Медицинская справка
• Фотографии

📅 Этапы поступления:
1. Подача документов в приемную комиссию
2. Прохождение вступительных испытаний (если требуются)
3. Участие в конкурсе на основе результатов
4. Зачисление

За подробной информацией обращайтесь в приемную комиссию: +7 (7242) 26-14-01"""

            # Документы
            elif any(word in message_lower for word in ['документ', 'справк', 'нужн']):
                return """Перечень документов для поступления:

📄 Обязательные документы:
• Заявление на поступление
• Документ об образовании (оригинал и копия)
• Удостоверение личности (оригинал и копия)
• Медицинская справка формы 086-У
• 6 фотографий размером 3х4 см

📄 Дополнительные документы (при необходимости):
• Справка о льготах
• Результаты ЕНТ/КТА
• Документы о военной службе (для мужчин)

Приемная комиссия: +7 (7242) 26-14-01"""

            # Специальности
            elif any(word in message_lower for word in ['специальност', 'программ', 'факультет']):
                return """Университет "Болашак" предлагает обучение по следующим направлениям:

🎓 Основные специальности:
• Педагогические науки
• Экономика и бизнес
• Информационные технологии
• Гуманитарные науки
• Естественные науки

📚 Формы обучения:
• Очная (дневная)
• Заочная
• Дистанционная

Для получения полного списка специальностей и требований обращайтесь в приемную комиссию: +7 (7242) 26-14-01"""

            # Контакты
            elif any(word in message_lower for word in ['контакт', 'телефон', 'адрес']):
                return """Контактная информация университета "Болашак":

📞 Приемная комиссия: +7 (7242) 26-14-01
📍 Адрес: г. Кызылорда
🕒 Время работы: понедельник-пятница 9:00-18:00

Приемная комиссия готова ответить на все ваши вопросы о поступлении!"""

            # Спасибо
            elif any(word in message_lower for word in ['спасибо', 'благодар']):
                return """Пожалуйста! Рад был помочь! 😊

Если у вас возникнут дополнительные вопросы, всегда обращайтесь в приемную комиссию университета "Болашак".

Удачи с поступлением! 🎓"""

            else:
                return """Спасибо за ваш вопрос! 

К сожалению, я не могу дать точный ответ на этот вопрос. Для получения подробной и актуальной информации рекомендую обратиться в приемную комиссию университета "Болашак".

📞 Телефон: +7 (7242) 26-14-01
Специалисты приемной комиссии предоставят вам исчерпывающую информацию по всем вопросам поступления."""

        else:  # Kazakh
            if any(word in message_lower for word in ['түс', 'қалай түс']):
                return """"Болашақ" университетіне түсу үшін:

📋 Негізгі талаптар:
• Білім туралы құжат (аттестат/диплом)
• Жеке куәлік
• Медициналық анықтама
• Фотосуреттер

📅 Түсу кезеңдері:
1. Қабылдау комиссиясына құжаттар тапсыру
2. Кіру сынақтарын тапсыру (қажет болса)
3. Нәтижелер негізінде конкурсқа қатысу
4. Қабылдау

Толық ақпарат үшін қабылдау комиссиясына хабарласыңыз: +7 (7242) 26-14-01"""

            else:
                return """Сұрағыңыз үшін рахмет!

Өкінішке орай, бұл сұраққа дәл жауап бере алмаймын. Толық және ең соңғы ақпарат алу үшін "Болашақ" университетінің қабылдау комиссиясына хабарласуыңызды ұсынамын.

📞 Телефон: +7 (7242) 26-14-01
Қабылдау комиссиясының мамандары түсуге қатысты барлық сұрақтарға толық жауап береді."""
    
    def _clean_response_from_links(self, text: str) -> str:
        """Remove any links and English words from response"""
        import re
        
        # Remove HTTP/HTTPS links
        text = re.sub(r'http[s]?://[^\s]+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+\.\S+', '', text)
        
        # Replace site references with contact instructions
        text = re.sub(r'(?i)(на нашем сайте|на сайте|сайт университета|официальный сайт)', 
                     'в приемной комиссии', text)
        text = re.sub(r'(?i)(біздің сайтта|сайтта|университет сайты|ресми сайт)', 
                     'қабылдау комиссиясында', text)
        
        # Remove common English words and replace with Russian/Kazakh
        english_replacements = {
            r'\bOK\b': 'Хорошо',
            r'\bYes\b': 'Да', 
            r'\bNo\b': 'Нет',
            r'\bHello\b': 'Здравствуйте',
            r'\bHi\b': 'Привет',
            r'\bThanks\b': 'Спасибо',
            r'\bThank you\b': 'Спасибо',
            r'\bSorry\b': 'Извините',
            r'\bPlease\b': 'Пожалуйста',
            r'\bInfo\b': 'Информация',
            r'\bInformation\b': 'Информация',
            r'\bWebsite\b': 'сайт',
            r'\bEmail\b': 'электронная почта',
            r'\bContact\b': 'контакт',
            r'\bUniversity\b': 'университет',
            r'\bStudent\b': 'студент',
            r'\bStudents\b': 'студенты',
            r'\bCourse\b': 'курс',
            r'\bCourses\b': 'курсы',
            r'\bProgram\b': 'программа',
            r'\bPrograms\b': 'программы',
            r'\bFaculty\b': 'факультет',
            r'\bDepartment\b': 'кафедра',
            r'\bAdmission\b': 'поступление',
            r'\bApplication\b': 'заявление',
            r'\bDocument\b': 'документ',
            r'\bDocuments\b': 'документы'
        }
        
        for english, russian in english_replacements.items():
            text = re.sub(english, russian, text, flags=re.IGNORECASE)
        
        # Remove any remaining English letters in isolated words
        text = re.sub(r'\b[A-Za-z]+\b', '', text)
        
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
