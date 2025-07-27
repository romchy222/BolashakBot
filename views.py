import time
import logging
from flask import render_template, request, jsonify, session, current_app
from models import UserQuery, FAQ, Category
from database import db
from mistral_client import MistralClient

mistral_client = MistralClient()

def register_views(app):
    """Register all view functions with the app"""
    
    @app.route('/')
    def index():
        """Main page with embedded chat widget"""
        return render_template('index.html')

    @app.route('/api/chat', methods=['POST'])
    def chat_api():
        """API endpoint for chat widget"""
        try:
            start_time = time.time()
            
            data = request.get_json()
            if not data or 'message' not in data:
                return jsonify({'error': 'Message is required'}), 400
            
            user_message = data['message'].strip()
            language = data.get('language', 'ru')  # Default to Russian
            
            if not user_message:
                return jsonify({'error': 'Message cannot be empty'}), 400
            
            # Get context from FAQ database
            context = get_faq_context(language)
            
            # Get AI response
            ai_response = mistral_client.get_chat_response(user_message, language, context)
            
            response_time = time.time() - start_time
            
            # Log the query
            user_query = UserQuery(
                user_query=user_message,
                bot_response=ai_response,
                language=language,
                user_ip=request.remote_addr,
                session_id=session.get('session_id', ''),
                response_time=response_time
            )
            
            db.session.add(user_query)
            db.session.commit()
            
            return jsonify({
                'response': ai_response,
                'language': language,
                'response_time': round(response_time, 2)
            })
            
        except Exception as e:
            logging.error(f"Error in chat API: {str(e)}")
            error_message = {
                'ru': 'Извините, произошла ошибка. Попробуйте позже.',
                'kk': 'Кешіріңіз, қате орын алды. Кейінірек қайталап көріңіз.'
            }
            return jsonify({
                'response': error_message.get(language, error_message['ru']),
                'error': True
            }), 500

    @app.route('/widget')
    def widget():
        """Standalone widget page for embedding"""
        return render_template('widget.html')

    @app.route('/user-settings')
    def user_settings():
        """User settings page for chat customization"""
        return render_template('user-settings.html')

    @app.route('/debug')
    def debug():
        """Debug page for testing chat functionality"""
        return render_template('debug.html')

    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('500.html'), 500

def get_faq_context(language='ru'):
    """Get FAQ context for AI responses"""
    try:
        faqs = FAQ.query.filter_by(is_active=True).all()
        context = []
        
        for faq in faqs:
            if language == 'kk':
                question = faq.question_kk
                answer = faq.answer_kk
                category_name = faq.category.name_kk
            else:
                question = faq.question_ru
                answer = faq.answer_ru
                category_name = faq.category.name_ru
                
            context.append(f"Категория: {category_name}\nВопрос: {question}\nОтвет: {answer}")
        
        return "\n\n".join(context)
    except Exception as e:
        logging.error(f"Error getting FAQ context: {str(e)}")
        return ""
