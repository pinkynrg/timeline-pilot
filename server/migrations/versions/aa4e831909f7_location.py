"""location

Revision ID: aa4e831909f7
Revises: 
Create Date: 2024-08-31 17:58:25.670015

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'aa4e831909f7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_geospatial_table('locations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('coordinates', Geometry(geometry_type='POINT', srid=3857, spatial_index=False, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
  


def downgrade() -> None:
    op.drop_geospatial_table('locations')
    # ### end Alembic commands ###