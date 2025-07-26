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
        
    def get_chat_response(self, user_message: str, language: str = 'ru', context: str = "") -> str:
        """Get structured response from Mistral AI without links"""
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
                return self._get_fallback_response(language)
                
        except requests.exceptions.Timeout:
            logging.error("Mistral API timeout")
            return self._get_fallback_response(language)
        except requests.exceptions.RequestException as e:
            logging.error(f"Mistral API request error: {str(e)}")
            return self._get_fallback_response(language)
        except Exception as e:
            logging.error(f"Unexpected error with Mistral API: {str(e)}")
            return self._get_fallback_response(language)
    
    def _get_fallback_response(self, language: str) -> str:
        """Fallback response when AI is unavailable - NO LINKS"""
        fallback_responses = {
            'ru': """Извините, временно возникли технические сложности с AI-помощником. 
Пожалуйста, обратитесь в приемную комиссию университета "Болашак" для получения актуальной информации.
Контактный телефон: +7 (7242) 26-14-01""",
            'kk': """Кешіріңіз, AI көмекшісімен уақытша техникалық қиындықтар туындады.
"Болашақ" университетінің қабылдау комиссиясына жаңа ақпарат алу үшін хабарласыңыз.
Байланыс телефоны: +7 (7242) 26-14-01"""
        }
        return fallback_responses.get(language, fallback_responses['ru'])
    
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
