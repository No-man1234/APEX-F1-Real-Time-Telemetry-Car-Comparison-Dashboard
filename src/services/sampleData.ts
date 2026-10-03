import type {
  Driver,
  Session,
  Meeting,
  CarTelemetry,
  Weather
} from '../types/f1';

export const SAMPLE_MEETING: Meeting = {
  meeting_key: 1244,
  meeting_name: "Italian Grand Prix",
  meeting_official_name: "FORMULA 1 PIRELLI GRAN PREMIO D’ITALIA 2024",
  location: "Monza",
  country_key: 13,
  country_code: "ITA",
  country_name: "Italy",
  country_flag: "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/italy-flag.png",
  circuit_key: 39,
  circuit_short_name: "Monza",
  circuit_type: "Permanent",
  circuit_image: "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Italy%20carbon.png",
  gmt_offset: "02:00:00",
  date_start: "2024-08-30T11:30:00+00:00",
  date_end: "2024-09-01T15:00:00+00:00",
  year: 2024
};

export const SAMPLE_SESSION: Session = {
  session_key: 9662,
  session_type: "Race",
  session_name: "Race",
  date_start: "2024-09-01T13:00:00+00:00",
  date_end: "2024-09-01T15:00:00+00:00",
  meeting_key: 1244,
  circuit_key: 39,
  circuit_short_name: "Monza",
  country_key: 13,
  country_code: "ITA",
  country_name: "Italy",
  location: "Monza",
  gmt_offset: "02:00:00",
  year: 2024
};

export const SAMPLE_DRIVERS: Driver[] = [
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 1,
    broadcast_name: "M VERSTAPPEN",
    full_name: "Max VERSTAPPEN",
    name_acronym: "VER",
    team_name: "Red Bull Racing",
    team_colour: "3671C6",
    first_name: "Max",
    last_name: "Verstappen",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 4,
    broadcast_name: "L NORRIS",
    full_name: "Lando NORRIS",
    name_acronym: "NOR",
    team_name: "McLaren",
    team_colour: "FF8000",
    first_name: "Lando",
    last_name: "Norris",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 16,
    broadcast_name: "C LECLERC",
    full_name: "Charles LECLERC",
    name_acronym: "LEC",
    team_name: "Ferrari",
    team_colour: "E80020",
    first_name: "Charles",
    last_name: "Leclerc",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 44,
    broadcast_name: "L HAMILTON",
    full_name: "Lewis HAMILTON",
    name_acronym: "HAM",
    team_name: "Mercedes",
    team_colour: "27F4D2",
    first_name: "Lewis",
    last_name: "Hamilton",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 81,
    broadcast_name: "O PIASTRI",
    full_name: "Oscar PIASTRI",
    name_acronym: "PIA",
    team_name: "McLaren",
    team_colour: "FF8000",
    first_name: "Oscar",
    last_name: "Piastri",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 55,
    broadcast_name: "C SAINZ",
    full_name: "Carlos SAINZ",
    name_acronym: "SAI",
    team_name: "Ferrari",
    team_colour: "E80020",
    first_name: "Carlos",
    last_name: "Sainz",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 63,
    broadcast_name: "G RUSSELL",
    full_name: "George RUSSELL",
    name_acronym: "RUS",
    team_name: "Mercedes",
    team_colour: "27F4D2",
    first_name: "George",
    last_name: "Russell",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png"
  },
  {
    meeting_key: 1244,
    session_key: 9662,
    driver_number: 14,
    broadcast_name: "F ALONSO",
    full_name: "Fernando ALONSO",
    name_acronym: "ALO",
    team_name: "Aston Martin",
    team_colour: "229971",
    first_name: "Fernando",
    last_name: "Alonso",
    headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png"
  }
];

export const SAMPLE_WEATHER: Weather = {
  date: "2024-09-01T13:00:00+00:00",
  air_temperature: 30.2,
  track_temperature: 52.6,
  humidity: 41,
  pressure: 998.2,
  rainfall: 0,
  wind_direction: 180,
  wind_speed: 1.8
};

// Generates high precision synthetic telemetry resembling Monza
export function generateSyntheticLapTelemetry(driverNum: number, speedOffset: number = 0): CarTelemetry[] {
  const points: CarTelemetry[] = [];
  const totalPoints = 180;

  for (let i = 0; i < totalPoints; i++) {
    let speed = 280;
    let throttle = 100;
    let brake = 0;
    let gear = 7;
    let rpm = 11200;
    let drs = 0;

    // Rettifilo chicane
    if (i >= 15 && i <= 22) {
      const p = (i - 15) / 7;
      speed = 345 - p * 265;
      throttle = 0;
      brake = p < 0.7 ? 100 : 40;
      gear = Math.max(2, 7 - Math.floor(p * 5));
      rpm = 10500 - p * 3000;
    } else if (i > 22 && i <= 30) {
      const p = (i - 22) / 8;
      speed = 80 + p * 180;
      throttle = Math.min(100, Math.floor(p * 120));
      brake = 0;
      gear = Math.min(6, 2 + Math.floor(p * 4));
      rpm = 9500 + p * 2000;
    } else if (i > 30 && i <= 48) {
      speed = 260 + (i - 30) * 4.5;
      throttle = 100;
      gear = 7;
      rpm = 11500;
      if (i > 38) drs = 1;
    } else if (i > 48 && i <= 55) {
      const p = (i - 48) / 7;
      speed = 330 - p * 215;
      throttle = 0;
      brake = 100;
      gear = Math.max(3, 7 - Math.floor(p * 4));
      rpm = 9000;
    } else if (i > 55 && i <= 75) {
      if (i >= 62 && i <= 66) {
        speed = 175;
        throttle = 40;
        brake = 35;
        gear = 4;
        rpm = 10200;
      } else if (i >= 71 && i <= 75) {
        speed = 160;
        throttle = 45;
        brake = 40;
        gear = 4;
        rpm = 10000;
      } else {
        speed = 240;
        throttle = 90;
        gear = 5;
        rpm = 11000;
      }
    } else if (i > 75 && i <= 100) {
      const p = (i - 75) / 25;
      speed = 240 + p * 95;
      throttle = 100;
      gear = 7;
      rpm = 11800;
      drs = 1;
    } else if (i > 100 && i <= 112) {
      const p = (i - 100) / 12;
      speed = 335 - Math.sin(p * Math.PI) * 160;
      throttle = p < 0.4 ? 0 : 75;
      brake = p < 0.4 ? 90 : 0;
      gear = p < 0.5 ? 4 : 5;
      rpm = 10500;
    } else if (i > 112 && i <= 135) {
      const p = (i - 112) / 23;
      speed = 250 + p * 105;
      throttle = 100;
      gear = 7;
      rpm = 12100;
      drs = 1;
    } else if (i > 135 && i <= 148) {
      const p = (i - 135) / 13;
      speed = 345 - p * 150;
      throttle = p < 0.3 ? 0 : 60;
      brake = p < 0.3 ? 95 : 0;
      gear = Math.max(4, 7 - Math.floor(p * 3));
      rpm = 10800;
    } else {
      const p = (i - 148) / 32;
      speed = 195 + p * 150;
      throttle = Math.min(100, 60 + p * 50);
      brake = 0;
      gear = Math.min(8, 4 + Math.floor(p * 4));
      rpm = 11200 + p * 800;
      if (i > 165) drs = 1;
    }

    const adjustedSpeed = Math.round(speed + speedOffset + Math.sin(i * 0.4) * 2);
    const adjustedThrottle = Math.max(0, Math.min(100, Math.round(throttle + (driverNum === 4 ? 2 : 0))));
    const adjustedRpm = Math.min(12800, Math.max(4500, Math.round(rpm + (driverNum === 4 ? 120 : -80))));

    points.push({
      date: new Date(Date.now() - (totalPoints - i) * 500).toISOString(),
      session_key: 9662,
      driver_number: driverNum,
      speed: Math.max(50, adjustedSpeed),
      throttle: adjustedThrottle,
      brake: Math.min(100, Math.max(0, brake)),
      rpm: adjustedRpm,
      n_gear: gear,
      drs: drs
    });
  }

  return points;
}

export function generateMonzaTrackCoordinates(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const count = 120;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * 2 * Math.PI;
    const x = Math.cos(t) * 180 + Math.sin(2 * t) * 60;
    const y = Math.sin(t) * 90 + Math.cos(2 * t) * 45;
    points.push({ x: Math.round(x * 10), y: Math.round(y * 10) });
  }
  return points;
}
