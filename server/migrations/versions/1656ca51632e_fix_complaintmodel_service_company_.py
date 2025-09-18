"""Fix ComplaintModel service_company relationship

Revision ID: 1656ca51632e
Revises: 
Create Date: 2025-09-18 14:35:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1656ca51632e'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add service_company_id column first
    op.add_column('complaint_model', 
                 sa.Column('service_company_id', sa.Integer(), nullable=True))
    
    # Set a default value for existing records (you'll need to choose an appropriate default)
    op.execute("UPDATE complaint_model SET service_company_id = 1 WHERE service_company_id IS NULL")
    
    # Make the column non-nullable
    op.alter_column('complaint_model', 'service_company_id', nullable=False)
    
    # Create the foreign key
    op.create_foreign_key(
        'fk_complaint_service_company',
        'complaint_model', 'service_company_model',
        ['service_company_id'], ['id']
    )
    
    # Drop the old service_company column if it exists
    try:
        op.drop_column('complaint_model', 'service_company')
    except:
        pass

def downgrade():
    # Add back the old column
    op.add_column('complaint_model',
                 sa.Column('service_company', sa.String(255), nullable=True))