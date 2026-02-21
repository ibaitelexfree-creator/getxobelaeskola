-- Create table for IoT wind readings
create table if not exists iot_wind_readings (
  id bigint generated always as identity primary key,
  sensor_id text not null,
  speed_knots numeric not null,
  direction_deg numeric not null,
  gust_knots numeric,
  battery_level numeric,
  timestamp timestamptz not null default now()
);

-- Enable RLS
alter table iot_wind_readings enable row level security;

-- Create policy for public read access
create policy "Allow public read access"
  on iot_wind_readings
  for select
  to public
  using (true);

-- Create policy for service role insert (API only)
create policy "Allow service role insert"
  on iot_wind_readings
  for insert
  to service_role
  with check (true);

-- Create index on timestamp for faster queries
create index if not exists idx_iot_wind_readings_timestamp on iot_wind_readings(timestamp desc);

-- Enable Realtime for this table
alter publication supabase_realtime add table iot_wind_readings;
