"""Added DefectMode table and associations

Revision ID: b5449e639cb3
Revises: a69e049cfdbe
Create Date: 2025-04-09 13:51:13.748598

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b5449e639cb3'
down_revision = 'a69e049cfdbe'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('defect', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.String(length=500), nullable=True))
        batch_op.drop_column('defect_rate')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('defect', schema=None) as batch_op:
        batch_op.add_column(sa.Column('defect_rate', sa.VARCHAR(length=100), nullable=True))
        batch_op.drop_column('description')

    # ### end Alembic commands ###
