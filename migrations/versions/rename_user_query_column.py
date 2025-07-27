"""rename user_query column to query_text

Revision ID: 7f2a3b4c5d6e
Revises: 
Create Date: 2025-07-27

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7f2a3b4c5d6e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # PostgreSQL не поддерживает прямое переименование колонок через ALTER TABLE как в SQLite
    # Поэтому добавляем новую колонку, копируем данные, затем удаляем старую

    # Добавляем новую колонку
    op.add_column('user_query', sa.Column('query_text', sa.Text(), nullable=True))

    # Копируем данные из старой колонки в новую
    # Используем raw SQL, так как это более надежный способ
    op.execute('UPDATE user_query SET query_text = user_query WHERE user_query IS NOT NULL')

    # Делаем новую колонку not null
    op.alter_column('user_query', 'query_text', nullable=False)

    # Удаляем старую колонку
    op.drop_column('user_query', 'user_query')


def downgrade():
    # Для отката выполняем обратные действия
    op.add_column('user_query', sa.Column('user_query', sa.Text(), nullable=True))
    op.execute('UPDATE user_query SET user_query = query_text WHERE query_text IS NOT NULL')
    op.alter_column('user_query', 'user_query', nullable=False)
    op.drop_column('user_query', 'query_text')
