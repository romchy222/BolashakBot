from flask import Blueprint, render_template, request, redirect, url_for, flash
from models import Category, FAQ, UserQuery
from flask import current_app
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func, distinct

admin_bp = Blueprint('admin_panel', __name__)

@admin_bp.route('/')
def index():
    """Admin dashboard"""
    total_queries = UserQuery.query.count()
    total_faqs = FAQ.query.count()
    total_categories = Category.query.count()
    recent_queries = UserQuery.query.order_by(UserQuery.created_at.desc()).limit(10).all()
    
    return render_template('admin/index.html', 
                         total_queries=total_queries,
                         total_faqs=total_faqs,
                         total_categories=total_categories,
                         recent_queries=recent_queries)

@admin_bp.route('/categories')
def categories():
    """List all categories"""
    categories = Category.query.all()
    return render_template('admin/category_list.html', categories=categories)

@admin_bp.route('/categories/new', methods=['GET', 'POST'])
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
def faqs():
    """List all FAQs"""
    page = request.args.get('page', 1, type=int)
    faqs = FAQ.query.order_by(FAQ.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False)
    return render_template('admin/faq_list.html', faqs=faqs)

@admin_bp.route('/faqs/new', methods=['GET', 'POST'])
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
        return redirect(url_for('admin.faqs'))
    
    categories = Category.query.all()
    return render_template('admin/faq_form.html', categories=categories)

@admin_bp.route('/faqs/<int:id>/edit', methods=['GET', 'POST'])
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
        return redirect(url_for('admin.faqs'))
    
    categories = Category.query.all()
    return render_template('admin/faq_form.html', faq=faq, categories=categories)

@admin_bp.route('/queries')
def queries():
    """List user queries"""
    page = request.args.get('page', 1, type=int)
    queries = UserQuery.query.order_by(UserQuery.created_at.desc()).paginate(
        page=page, per_page=50, error_out=False)
    return render_template('admin/query_list.html', queries=queries)

@admin_bp.route('/analytics')
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
def scrape_university():
    """Парсинг сайта университета"""
    if request.method == 'POST':
        try:
            from web_scraper import run_university_scraper
            saved_count = run_university_scraper()
            flash(f'Успешно создано {saved_count} FAQ записей из данных сайта университета', 'success')
        except Exception as e:
            flash(f'Ошибка при парсинге сайта: {str(e)}', 'error')
        
        return redirect(url_for('admin.scrape_university'))
    
    return render_template('admin/scrape_university.html')
