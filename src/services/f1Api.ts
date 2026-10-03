import type {
  Meeting,
  Session,
  Driver,
  CarTelemetry,
  Lap,
  LocationPoint,
  Stint,
  Interval,
  Position,
  Weather,
  CarTelemetryComparisonPoint,
  CarAnalysisStats
} from '../types/f1';

const BASE_URL = 'https://api.openf1.org/v1';

// In-memory cache to prevent repeated rate-limited API calls
const cache = new Map<string, { data: unknown; expiry: number }>();

async function fetchWithCache<T>(url: string, ttlMs: number = 60000): Promise<T> {
  const cached = cache.get(url);
  const now = Date.now();
  if (cached && cached.expiry > now) {
    return cached.data as T;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache.set(url, { data, expiry: now + ttlMs });
    return data as T;
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error);
    if (cached) {
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Get the latest active or most recent session
 */
export async function getLatestSession(): Promise<Session | null> {
  try {
    const data = await fetchWithCache<Session[]>(`${BASE_URL}/sessions?session_key=latest`, 30000);
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Failed to get latest session', err);
    return null;
  }
}

/**
 * Get sessions for a given year and optional meeting key
 */
export async function getSessions(year: number, meetingKey?: number): Promise<Session[]> {
  try {
    let url = `${BASE_URL}/sessions?year=${year}`;
    if (meetingKey) {
      url += `&meeting_key=${meetingKey}`;
    }
    const data = await fetchWithCache<Session[]>(url, 120000);
    return data || [];
  } catch (err) {
    console.error('Failed to get sessions', err);
    return [];
  }
}

/**
 * Get all meetings (Grand Prix weekends) for a given year
 */
export async function getMeetings(year: number): Promise<Meeting[]> {
  try {
    const url = `${BASE_URL}/meetings?year=${year}`;
    const data = await fetchWithCache<Meeting[]>(url, 300000);
    // Sort meetings by date_start ascending
    return (data || []).sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  } catch (err) {
    console.error(`Failed to get meetings for year ${year}`, err);
    return [];
  }
}

/**
 * Get all drivers participating in a session
 */
export async function getDrivers(sessionKey: number): Promise<Driver[]> {
  try {
    const url = `${BASE_URL}/drivers?session_key=${sessionKey}`;
    const data = await fetchWithCache<Driver[]>(url, 300000);
    // Remove duplicates if any and sort by driver number
    const uniqueMap = new Map<number, Driver>();
    (data || []).forEach(d => {
      if (!uniqueMap.has(d.driver_number)) {
        uniqueMap.set(d.driver_number, d);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => a.driver_number - b.driver_number);
  } catch (err) {
    console.error(`Failed to get drivers for session ${sessionKey}`, err);
    return [];
  }
}

/**
 * Get lap times for a session and optional driver
 */
export async function getLaps(sessionKey: number, driverNumber?: number): Promise<Lap[]> {
  try {
    let url = `${BASE_URL}/laps?session_key=${sessionKey}`;
    if (driverNumber !== undefined) {
      url += `&driver_number=${driverNumber}`;
    }
    const data = await fetchWithCache<Lap[]>(url, 45000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get laps for session ${sessionKey}`, err);
    return [];
  }
}

/**
 * Get car telemetry data for a driver in a session
 */
export async function getCarData(
  sessionKey: number,
  driverNumber: number,
  dateStart?: string,
  dateEnd?: string
): Promise<CarTelemetry[]> {
  try {
    let url = `${BASE_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`;
    if (dateStart) url += `&date>=${encodeURIComponent(dateStart)}`;
    if (dateEnd) url += `&date<=${encodeURIComponent(dateEnd)}`;
    
    const data = await fetchWithCache<CarTelemetry[]>(url, 30000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get car data for driver ${driverNumber}`, err);
    return [];
  }
}

/**
 * Get track location points (X, Y, Z coordinates)
 */
export async function getLocation(
  sessionKey: number,
  driverNumber: number,
  dateStart?: string,
  dateEnd?: string
): Promise<LocationPoint[]> {
  try {
    let url = `${BASE_URL}/location?session_key=${sessionKey}&driver_number=${driverNumber}`;
    if (dateStart) url += `&date>=${encodeURIComponent(dateStart)}`;
    if (dateEnd) url += `&date<=${encodeURIComponent(dateEnd)}`;
    
    const data = await fetchWithCache<LocationPoint[]>(url, 60000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get location for driver ${driverNumber}`, err);
    return [];
  }
}

/**
 * Get tyre stints for a session
 */
export async function getStints(sessionKey: number): Promise<Stint[]> {
  try {
    const url = `${BASE_URL}/stints?session_key=${sessionKey}`;
    const data = await fetchWithCache<Stint[]>(url, 60000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get stints for session ${sessionKey}`, err);
    return [];
  }
}

/**
 * Get race intervals and gaps
 */
export async function getIntervals(sessionKey: number): Promise<Interval[]> {
  try {
    const url = `${BASE_URL}/intervals?session_key=${sessionKey}`;
    const data = await fetchWithCache<Interval[]>(url, 20000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get intervals for session ${sessionKey}`, err);
    return [];
  }
}

/**
 * Get positions for a session
 */
export async function getPositions(sessionKey: number): Promise<Position[]> {
  try {
    const url = `${BASE_URL}/position?session_key=${sessionKey}`;
    const data = await fetchWithCache<Position[]>(url, 20000);
    return data || [];
  } catch (err) {
    console.error(`Failed to get positions for session ${sessionKey}`, err);
    return [];
  }
}

/**
 * Get session weather
 */
export async function getWeather(sessionKey: number): Promise<Weather | null> {
  try {
    const url = `${BASE_URL}/weather?session_key=${sessionKey}`;
    const data = await fetchWithCache<Weather[]>(url, 45000);
    return data && data.length > 0 ? data[data.length - 1] : null;
  } catch (err) {
    console.error(`Failed to get weather for session ${sessionKey}`, err);
    return null;
  }
}

/**
 * Align and normalize two telemetry datasets for direct comparison.
 * Interpolates both cars to 120 equidistant points (0% to 100% of lap distance).
 */
export function alignTelemetryForComparison(
  car1Data: CarTelemetry[],
  car2Data: CarTelemetry[]
): CarTelemetryComparisonPoint[] {
  if (!car1Data.length || !car2Data.length) return [];

  const pointsCount = 120;
  const result: CarTelemetryComparisonPoint[] = [];

  const sample = (arr: CarTelemetry[], ratio: number): CarTelemetry => {
    const idx = Math.min(arr.length - 1, Math.max(0, Math.floor(ratio * (arr.length - 1))));
    return arr[idx];
  };

  let cumulativeTimeDelta = 0;

  for (let i = 0; i < pointsCount; i++) {
    const ratio = i / (pointsCount - 1);
    const c1 = sample(car1Data, ratio);
    const c2 = sample(car2Data, ratio);

    const speedDelta = c1.speed - c2.speed;
    cumulativeTimeDelta += (speedDelta / 3.6) * 0.005;

    result.push({
      index: i,
      percentage: Math.round(ratio * 100),
      distance: Math.round(ratio * 5300),
      c1Speed: c1.speed,
      c1Throttle: c1.throttle,
      c1Brake: c1.brake,
      c1Rpm: c1.rpm,
      c1Gear: c1.n_gear,
      c1Drs: c1.drs,
      c2Speed: c2.speed,
      c2Throttle: c2.throttle,
      c2Brake: c2.brake,
      c2Rpm: c2.rpm,
      c2Gear: c2.n_gear,
      c2Drs: c2.drs,
      speedDelta,
      timeDelta: parseFloat(cumulativeTimeDelta.toFixed(3))
    });
  }

  return result;
}

/**
 * Calculate deep statistics for a single car telemetry run
 */
export function calculateCarStats(data: CarTelemetry[]): CarAnalysisStats {
  if (!data.length) {
    return {
      topSpeed: 0,
      apexSpeed: 0,
      avgThrottle: 0,
      hardBrakingEvents: 0,
      avgRpm: 0,
      maxGear: 8,
      timeUnderFullThrottle: 0,
      drsUsage: 0
    };
  }

  let maxSpeed = 0;
  let minSpeed = 999;
  let totalThrottle = 0;
  let fullThrottleCount = 0;
  let hardBrakingCount = 0;
  let totalRpm = 0;
  let maxGear = 1;
  let drsOpenCount = 0;

  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    if (pt.speed > maxSpeed) maxSpeed = pt.speed;
    if (pt.speed > 50 && pt.speed < minSpeed) minSpeed = pt.speed;
    totalThrottle += pt.throttle;
    if (pt.throttle >= 95) fullThrottleCount++;
    if (pt.brake > 50) hardBrakingCount++;
    totalRpm += pt.rpm;
    if (pt.n_gear > maxGear) maxGear = pt.n_gear;
    if (pt.drs > 0) drsOpenCount++;
  }

  return {
    topSpeed: maxSpeed,
    apexSpeed: minSpeed === 999 ? 0 : minSpeed,
    avgThrottle: Math.round(totalThrottle / data.length),
    hardBrakingEvents: hardBrakingCount,
    avgRpm: Math.round(totalRpm / data.length),
    maxGear,
    timeUnderFullThrottle: Math.round((fullThrottleCount / data.length) * 100),
    drsUsage: Math.round((drsOpenCount / data.length) * 100)
  };
}
