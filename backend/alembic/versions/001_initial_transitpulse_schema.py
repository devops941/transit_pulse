"""Initial TransitPulse Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-21 10:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. dataset_sources
    op.create_table(
        'dataset_sources',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('source_code', sa.String(length=50), nullable=False),
        sa.Column('authority_name', sa.String(length=255), nullable=False),
        sa.Column('geographic_coverage', sa.String(length=255), nullable=False),
        sa.Column('license_type', sa.String(length=100), nullable=False),
        sa.Column('source_url', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_dataset_sources_source_code', 'dataset_sources', ['source_code'], unique=True)

    # 2. agencies
    op.create_table(
        'agencies',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('agency_id', sa.String(length=50), nullable=False),
        sa.Column('agency_name', sa.String(length=255), nullable=False),
        sa.Column('agency_url', sa.String(length=255), nullable=True),
        sa.Column('agency_timezone', sa.String(length=50), nullable=True),
        sa.Column('agency_lang', sa.String(length=10), nullable=True),
        sa.Column('agency_phone', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_agencies_agency_id', 'agencies', ['agency_id'], unique=True)

    # 3. routes
    op.create_table(
        'routes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('route_id', sa.String(length=50), nullable=False),
        sa.Column('agency_id', sa.String(length=50), nullable=False),
        sa.Column('route_short_name', sa.String(length=50), nullable=False),
        sa.Column('route_long_name', sa.String(length=255), nullable=False),
        sa.Column('route_type', sa.Integer(), nullable=True),
        sa.Column('route_color', sa.String(length=10), nullable=True),
        sa.Column('route_text_color', sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(['agency_id'], ['agencies.agency_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_routes_route_id', 'routes', ['route_id'], unique=True)
    op.create_index('ix_routes_route_short_name', 'routes', ['route_short_name'])

    # 4. stops
    op.create_table(
        'stops',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('stop_id', sa.String(length=50), nullable=False),
        sa.Column('stop_name', sa.String(length=255), nullable=False),
        sa.Column('stop_lat', sa.Float(), nullable=True),
        sa.Column('stop_lon', sa.Float(), nullable=True),
        sa.Column('zone_id', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_stops_stop_id', 'stops', ['stop_id'], unique=True)
    op.create_index('ix_stops_stop_name', 'stops', ['stop_name'])

    # 5. service_calendars
    op.create_table(
        'service_calendars',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('service_id', sa.String(length=50), nullable=False),
        sa.Column('monday', sa.Boolean(), nullable=True),
        sa.Column('tuesday', sa.Boolean(), nullable=True),
        sa.Column('wednesday', sa.Boolean(), nullable=True),
        sa.Column('thursday', sa.Boolean(), nullable=True),
        sa.Column('friday', sa.Boolean(), nullable=True),
        sa.Column('saturday', sa.Boolean(), nullable=True),
        sa.Column('sunday', sa.Boolean(), nullable=True),
        sa.Column('start_date', sa.String(length=10), nullable=False),
        sa.Column('end_date', sa.String(length=10), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_service_calendars_service_id', 'service_calendars', ['service_id'], unique=True)

    # 6. trips
    op.create_table(
        'trips',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('trip_id', sa.String(length=50), nullable=False),
        sa.Column('route_id', sa.String(length=50), nullable=False),
        sa.Column('service_id', sa.String(length=50), nullable=False),
        sa.Column('trip_headsign', sa.String(length=255), nullable=True),
        sa.Column('direction_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['route_id'], ['routes.route_id'], ),
        sa.ForeignKeyConstraint(['service_id'], ['service_calendars.service_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_trips_trip_id', 'trips', ['trip_id'], unique=True)

    # 7. scheduled_stop_times
    op.create_table(
        'scheduled_stop_times',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('trip_id', sa.String(length=50), nullable=False),
        sa.Column('stop_id', sa.String(length=50), nullable=False),
        sa.Column('arrival_time', sa.String(length=10), nullable=False),
        sa.Column('departure_time', sa.String(length=10), nullable=False),
        sa.Column('stop_sequence', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['stop_id'], ['stops.stop_id'], ),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.trip_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('trip_id', 'stop_sequence', name='uq_trip_stop_seq')
    )

    # 8. actual_arrival_observations
    op.create_table(
        'actual_arrival_observations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('observation_id', sa.String(length=50), nullable=False),
        sa.Column('trip_id', sa.String(length=50), nullable=False),
        sa.Column('route_id', sa.String(length=50), nullable=False),
        sa.Column('stop_id', sa.String(length=50), nullable=False),
        sa.Column('observation_date', sa.String(length=10), nullable=False),
        sa.Column('scheduled_arrival_time', sa.String(length=10), nullable=False),
        sa.Column('actual_arrival_time', sa.String(length=10), nullable=False),
        sa.Column('delay_minutes', sa.Float(), nullable=False),
        sa.Column('delay_status', sa.String(length=20), nullable=False),
        sa.Column('time_period', sa.String(length=20), nullable=False),
        sa.Column('day_of_week', sa.String(length=20), nullable=False),
        sa.Column('is_weekend', sa.Boolean(), nullable=True),
        sa.Column('vehicle_id', sa.String(length=50), nullable=True),
        sa.Column('observation_source', sa.String(length=50), nullable=True),
        sa.Column('weather_condition', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['route_id'], ['routes.route_id'], ),
        sa.ForeignKeyConstraint(['stop_id'], ['stops.stop_id'], ),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.trip_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('trip_id', 'stop_id', 'observation_date', name='uq_obs_trip_stop_date')
    )
    op.create_index('ix_actual_arrival_observations_observation_id', 'actual_arrival_observations', ['observation_id'], unique=True)
    op.create_index('ix_obs_route_date', 'actual_arrival_observations', ['route_id', 'observation_date'])

    # 9. data_import_history
    op.create_table(
        'data_import_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('import_timestamp', sa.DateTime(), nullable=False),
        sa.Column('source_code', sa.String(length=50), nullable=False),
        sa.Column('raw_records_count', sa.Integer(), nullable=True),
        sa.Column('valid_records_count', sa.Integer(), nullable=True),
        sa.Column('rejected_records_count', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['source_code'], ['dataset_sources.source_code'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('data_import_history')
    op.drop_table('actual_arrival_observations')
    op.drop_table('scheduled_stop_times')
    op.drop_table('trips')
    op.drop_table('service_calendars')
    op.drop_table('stops')
    op.drop_table('routes')
    op.drop_table('agencies')
    op.drop_table('dataset_sources')
