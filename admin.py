from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from models import Category, FAQ, UserQuery, Document, DataSource
from flask import current_app
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func, distinct
from auth import login_required, check_credentials
import document_processor
import web_scraper
import os

admin_bp = Blueprint('admin_panel', __name__)

@admin_bp.route('/')
@login_required
def index():
    """Admin dashboard"""
    total_queries = UserQuery.query.count()
    total_faqs = FAQ.query.count()
    total_categories = Category.query.count()
    total_documents = Document.query.filter_by(is_active=True).count()
    total_sources = DataSource.query.filter_by(is_active=True).count()
    recent_queries = UserQuery.query.order_by(UserQuery.created_at.desc()).limit(10).all()
    recent_documents = Document.query.filter_by(is_active=True).order_by(Document.upload_date.desc()).limit(5).all()
    
    return render_template('admin/index.html', 
                         total_queries=total_queries,
                         total_faqs=total_faqs,
                         total_categories=total_categories,
                         total_documents=total_documents,
                         total_sources=total_sources,
                         recent_queries=recent_queries,
                         recent_documents=recent_documents)

@admin_bp.route('/categories')
@login_required
def categories():
    """List all categories"""
    categories = Category.query.all()
    return render_template('admin/category_list.html', categories=categories)

@admin_bp.route('/categories/new', methods=['GET', 'POST'])
@login_required
def new_category():
    """Create new category"""
    if request.method == 'POST':
        category = Category()
        category.name_ru = request.form['name_ru']
        category.name_kk = request.form['name_kk']
        category.description_ru = request.form['description_ru']
        category.description_kk = request.form['description_kk']
        db.session.add(category)
        db.session.commit()
        flash('Категория успешно создана', 'success')
        return redirect(url_for('admin.categories'))
    
    return render_template('admin/category_form.html')

@admin_bp.route('/faqs')
@login_required
def faqs():
    """List all FAQs"""
    page = request.args.get('page', 1, type=int)
    faqs = FAQ.query.order_by(FAQ.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False)
    return render_template('admin/faq_list.html', faqs=faqs)

@admin_bp.route('/faqs/new', methods=['GET', 'POST'])
@login_required
def new_faq():
    """Create new FAQ"""
    if request.method == 'POST':
        faq = FAQ()
        faq.question_ru = request.form['question_ru']
        faq.question_kk = request.form['question_kk']
        faq.answer_ru = request.form['answer_ru']
        faq.answer_kk = request.form['answer_kk']
        faq.category_id = request.form['category_id']
        faq.is_active = request.form.get('is_active') == 'on'
        db.session.add(faq)
        db.session.commit()
        flash('FAQ успешно создан', 'success')
        return redirect(url_for('admin_panel.faqs'))
    
    categories = Category.query.all()
    return render_template('admin/faq_form.html', categories=categories)

@admin_bp.route('/faqs/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_faq(id):
    """Edit FAQ"""
    faq = FAQ.query.get_or_404(id)
    
    if request.method == 'POST':
        faq.question_ru = request.form['question_ru']
        faq.question_kk = request.form['question_kk']
        faq.answer_ru = request.form['answer_ru']
        faq.answer_kk = request.form['answer_kk']
        faq.category_id = request.form['category_id']
        faq.is_active = request.form.get('is_active') == 'on'
        
        db.session.commit()
        flash('FAQ успешно обновлен', 'success')
        return redirect(url_for('admin_panel.faqs'))
    
    categories = Category.query.all()
    return render_template('admin/faq_form.html', faq=faq, categories=categories)

@admin_bp.route('/queries')
@login_required
def queries():
    """List user queries"""
    page = request.args.get('page', 1, type=int)
    queries = UserQuery.query.order_by(UserQuery.created_at.desc()).paginate(
        page=page, per_page=50, error_out=False)
    return render_template('admin/query_list.html', queries=queries)

@admin_bp.route('/analytics')
@login_required
def analytics():
    """Analytics dashboard"""
    today = datetime.utcnow().date()
    
    # Today's requests
    today_requests = UserQuery.query.filter(
        func.date(UserQuery.created_at) == today
    ).count()
    
    # Average response time
    avg_response_time = db.session.query(
        func.avg(UserQuery.response_time)
    ).scalar() or 0
    
    # Unique users (by IP)
    unique_users = db.session.query(
        func.count(distinct(UserQuery.ip_address))
    ).scalar() or 0
    
    # Language distribution
    language_stats = db.session.query(
        UserQuery.language,
        func.count(UserQuery.id)
    ).group_by(UserQuery.language).all()
    
    ru_count = 0
    kk_count = 0
    for lang, count in language_stats:
        if lang == 'ru':
            ru_count = count
        elif lang == 'kk':
            kk_count = count
    
    total_lang = ru_count + kk_count
    language_distribution = [
        round((ru_count / total_lang * 100) if total_lang > 0 else 50, 1),
        round((kk_count / total_lang * 100) if total_lang > 0 else 50, 1)
    ]
    
    # Requests by day (last 7 days)
    dates = []
    requests_data = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        dates.append(date.strftime('%d.%m'))
        count = UserQuery.query.filter(
            func.date(UserQuery.created_at) == date
        ).count()
        requests_data.append(count)
    
    # Average session time estimation
    avg_session_time = 3.5  # Placeholder estimation
    
    # Popular categories (mock data based on common FAQ categories)
    popular_categories = [
        {'name': 'Поступление', 'count': ru_count // 3, 'percentage': 35.0},
        {'name': 'Документы', 'count': ru_count // 4, 'percentage': 25.0},
        {'name': 'Программы', 'count': ru_count // 5, 'percentage': 20.0},
        {'name': 'Расписание', 'count': ru_count // 6, 'percentage': 20.0},
    ]
    
    return render_template('analytics.html',
                         today_requests=today_requests,
                         avg_response_time=avg_response_time,
                         unique_users=unique_users,
                         language_distribution=language_distribution,
                         requests_labels=dates,
                         requests_data=requests_data,
                         avg_session_time=avg_session_time,
                         popular_categories=popular_categories)

@admin_bp.route('/scrape-university', methods=['GET', 'POST'])
@login_required
def scrape_university():
    """Парсинг сайта университета - DEPRECATED, use data sources instead"""
    flash('Данная функция заменена на "Источники данных". Используйте новый раздел для добавления сайтов.', 'info')
    return redirect(url_for('admin_panel.data_sources'))

# New Document Management Routes
@admin_bp.route('/documents')
@login_required
def documents():
    """List all uploaded documents"""
    page = request.args.get('page', 1, type=int)
    documents = Document.query.filter_by(is_active=True).order_by(Document.upload_date.desc()).paginate(
        page=page, per_page=20, error_out=False)
    return render_template('admin/document_list.html', documents=documents)

@admin_bp.route('/documents/upload', methods=['GET', 'POST'])
@login_required
def upload_document():
    """Upload new document"""
    if request.method == 'POST':
        try:
            # Check if file was uploaded
            if 'file' not in request.files:
                flash('Файл не выбран', 'error')
                return redirect(request.url)
            
            file = request.files['file']
            if file.filename == '':
                flash('Файл не выбран', 'error')
                return redirect(request.url)
            
            # Save file
            file_info = document_processor.save_uploaded_file(file)
            if not file_info:
                flash('Ошибка при сохранении файла', 'error')
                return redirect(request.url)
            
            # Extract text content
            content_text = document_processor.extract_text_from_file(
                file_info['file_path'], file_info['file_type'])
            content_text = document_processor.clean_extracted_text(content_text)
            
            # Create document record
            document = Document()
            document.filename = file_info['filename']
            document.original_filename = file_info['original_filename']
            document.file_type = file_info['file_type']
            document.file_size = file_info['file_size']
            document.file_path = file_info['file_path']
            document.content_text = content_text
            document.description = request.form.get('description', '')
            document.last_processed = datetime.utcnow()
            
            db.session.add(document)
            db.session.commit()
            
            flash(f'Документ "{file_info["original_filename"]}" успешно загружен и обработан', 'success')
            return redirect(url_for('admin_panel.documents'))
            
        except Exception as e:
            flash(f'Ошибка при загрузке документа: {str(e)}', 'error')
            return redirect(request.url)
    
    return render_template('admin/document_upload.html')

@admin_bp.route('/documents/<int:id>')
@login_required
def view_document(id):
    """View document details"""
    document = Document.query.get_or_404(id)
    return render_template('admin/document_view.html', document=document)

@admin_bp.route('/documents/<int:id>/delete', methods=['POST'])
@login_required
def delete_document(id):
    """Delete document"""
    document = Document.query.get_or_404(id)
    
    # Delete file from disk
    document_processor.delete_file(document.file_path)
    
    # Delete from database
    db.session.delete(document)
    db.session.commit()
    
    flash(f'Документ "{document.original_filename}" удален', 'success')
    return redirect(url_for('admin_panel.documents'))

# Data Sources Management Routes
@admin_bp.route('/data-sources')
@login_required
def data_sources():
    """List all data sources"""
    sources = DataSource.query.order_by(DataSource.created_at.desc()).all()
    return render_template('admin/data_source_list.html', sources=sources)

@admin_bp.route('/data-sources/new', methods=['GET', 'POST'])
@login_required
def new_data_source():
    """Create new data source"""
    if request.method == 'POST':
        try:
            source = DataSource()
            source.name = request.form['name']
            source.url = request.form['url']
            source.source_type = request.form['source_type']
            source.crawl_frequency = int(request.form.get('crawl_frequency', 24))
            
            # Perform initial crawl
            if source.source_type == 'website':
                scraper = web_scraper.UniversityScraper(source.url)
                content = scraper.get_website_text_content(source.url)
                source.extracted_content = content
                source.last_crawled = datetime.utcnow()
            
            db.session.add(source)
            db.session.commit()
            
            flash(f'Источник данных "{source.name}" создан', 'success')
            return redirect(url_for('admin_panel.data_sources'))
            
        except Exception as e:
            flash(f'Ошибка при создании источника данных: {str(e)}', 'error')
    
    return render_template('admin/data_source_form.html')

@admin_bp.route('/data-sources/<int:id>/crawl', methods=['POST'])
@login_required
def crawl_data_source(id):
    """Manually crawl data source"""
    source = DataSource.query.get_or_404(id)
    
    try:
        if source.source_type == 'website':
            scraper = web_scraper.UniversityScraper(source.url)
            content = scraper.get_website_text_content(source.url)
            source.extracted_content = content
            source.last_crawled = datetime.utcnow()
            db.session.commit()
            
            flash(f'Источник "{source.name}" успешно обновлен', 'success')
        else:
            flash('Автоматическое обновление поддерживается только для веб-сайтов', 'info')
            
    except Exception as e:
        flash(f'Ошибка при обновлении источника: {str(e)}', 'error')
    
    return redirect(url_for('admin_panel.data_sources'))

@admin_bp.route('/data-sources/<int:id>/delete', methods=['POST'])
@login_required
def delete_data_source(id):
    """Delete data source"""
    source = DataSource.query.get_or_404(id)
    db.session.delete(source)
    db.session.commit()
    
    flash(f'Источник данных "{source.name}" удален', 'success')
    return redirect(url_for('admin_panel.data_sources'))
