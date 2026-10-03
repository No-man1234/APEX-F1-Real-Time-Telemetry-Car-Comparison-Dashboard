/**
 * Utility functions for 2026+ active aero vs pre-2026 DRS, timing formatting, and sorting
 */

export interface AeroModeDetails {
  systemName: string;
  activeLabel: string;
  inactiveLabel: string;
  badgeLabel: string;
  code: string;
}

export function getAeroModeDetails(year: number, isActive: boolean): AeroModeDetails {
  if (year >= 2026) {
    return {
      systemName: 'ACTIVE AERO / OVERRIDE',
      activeLabel: 'X-MODE (LOW DRAG)',
      inactiveLabel: 'Z-MODE (HIGH DOWNFORCE)',
      badgeLabel: isActive ? 'X-MODE ACTIVE' : 'Z-MODE ENGAGED',
      code: isActive ? 'X-MODE' : 'Z-MODE',
    };
  }

  return {
    systemName: 'DRS (DRAG REDUCTION SYSTEM)',
    activeLabel: 'DRS OPEN',
    inactiveLabel: 'DRS CLOSED',
    badgeLabel: isActive ? 'DRS ACTIVE' : 'DRS CLOSED',
    code: isActive ? 'DRS' : '---',
  };
}

export function formatLapTime(sec: number | null | undefined): string {
  if (!sec || sec <= 0 || isNaN(sec)) return '-:--.---';
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(3);
  return `${m}:${s.padStart(6, '0')}`;
}
