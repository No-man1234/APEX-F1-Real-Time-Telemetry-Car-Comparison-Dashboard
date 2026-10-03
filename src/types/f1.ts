export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  country_flag?: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type?: string;
  circuit_image?: string;
  gmt_offset: string;
  date_start: string;
  date_end: string;
  year: number;
  is_cancelled?: boolean;
}

export interface Session {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  country_key: number;
  country_code: string;
  country_name: string;
  location: string;
  gmt_offset: string;
  year: number;
  is_cancelled?: boolean;
}

export interface Driver {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url?: string;
  country_code?: string | null;
}

export interface CarTelemetry {
  date: string;
  session_key: number;
  driver_number: number;
  meeting_key?: number;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  n_gear: number;
  drs: number;
  distance?: number; // Calculated cumulative distance along lap
}

export interface Lap {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
  segments_sector_1?: (number | null)[];
  segments_sector_2?: (number | null)[];
  segments_sector_3?: (number | null)[];
}

export interface LocationPoint {
  date: string;
  session_key: number;
  driver_number: number;
  meeting_key?: number;
  x: number;
  y: number;
  z: number;
}

export interface Stint {
  meeting_key: number;
  session_key: number;
  stint_number: number;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;
  tyre_age_at_start: number;
}

export interface Interval {
  date: string;
  session_key: number;
  meeting_key?: number;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
}

export interface Position {
  date: string;
  session_key: number;
  meeting_key?: number;
  driver_number: number;
  position: number;
}

export interface Weather {
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  wind_direction: number;
  wind_speed: number;
}

export interface DriverTimingSummary {
  driver: Driver;
  position: number;
  gapToLeader: string;
  interval: string;
  lastLapTime: string;
  bestLapTime: string;
  bestLapNumber: number | null;
  sector1: string;
  sector2: string;
  sector3: string;
  s1Status: 'fastest' | 'personal' | 'normal';
  s2Status: 'fastest' | 'personal' | 'normal';
  s3Status: 'fastest' | 'personal' | 'normal';
  currentTyre: string;
  tyreAge: number;
  pitStops: number;
  topSpeed: number;
  status: 'ON_TRACK' | 'PIT' | 'OUT' | 'FINISHED';
}

export interface CarTelemetryComparisonPoint {
  index: number;
  percentage: number;
  distance: number; // in meters
  // Car 1
  c1Speed: number;
  c1Throttle: number;
  c1Brake: number;
  c1Rpm: number;
  c1Gear: number;
  c1Drs: number;
  // Car 2
  c2Speed: number;
  c2Throttle: number;
  c2Brake: number;
  c2Rpm: number;
  c2Gear: number;
  c2Drs: number;
  // Delta
  speedDelta: number; // c1Speed - c2Speed
  timeDelta: number; // accumulated time delta in seconds (+ means c1 ahead, - means c2 ahead)
}

export interface CarAnalysisStats {
  topSpeed: number;
  apexSpeed: number;
  avgThrottle: number;
  hardBrakingEvents: number;
  avgRpm: number;
  maxGear: number;
  timeUnderFullThrottle: number; // percentage
  drsUsage: number; // percentage
}
