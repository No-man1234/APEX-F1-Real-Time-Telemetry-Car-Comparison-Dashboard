import React, { useMemo } from 'react';
import type { Driver, Meeting } from '../types/f1';
import { Compass, Flag } from 'lucide-react';
import { generateMonzaTrackCoordinates } from '../services/sampleData';

interface TrackMinimapProps {
  meeting: Meeting | null;
  driver1: Driver | null;
  driver2: Driver | null;
  progressPercentage: number;
  locations?: { x: number; y: number }[];
}

export const TrackMinimap: React.FC<TrackMinimapProps> = ({
  meeting,
  driver1,
  driver2,
  progressPercentage,
  locations,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Fallback to Monza track points if location points not available
  const trackPoints = useMemo(() => {
    if (locations && locations.length > 20) {
      return locations;
    }
    return generateMonzaTrackCoordinates();
  }, [locations]);

  // Normalize points to SVG coordinate space
  const { pathString, c1Pos, c2Pos } = useMemo(() => {
    if (!trackPoints.length) return { pathString: '', c1Pos: { x: 250, y: 150 }, c2Pos: { x: 250, y: 150 } };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    trackPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = 40;
    const svgW = 500;
    const svgH = 320;
    const scaleX = (svgW - pad * 2) / (maxX - minX || 1);
    const scaleY = (svgH - pad * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (svgW - (maxX - minX) * scale) / 2;
    const offsetY = (svgH - (maxY - minY) * scale) / 2;

    const toSvg = (p: { x: number; y: number }) => ({
      x: offsetX + (p.x - minX) * scale,
      y: offsetY + (p.y - minY) * scale,
    });

    const mapped = trackPoints.map(toSvg);
    const d = mapped.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';

    const ratio = Math.max(0, Math.min(1, progressPercentage / 100));
    const idx1 = Math.floor(ratio * (mapped.length - 1));
    const idx2 = Math.max(0, Math.min(mapped.length - 1, idx1 - 2));

    return {
      pathString: d,
      c1Pos: mapped[idx1] || mapped[0],
      c2Pos: mapped[idx2] || mapped[0],
    };
  }, [trackPoints, progressPercentage]);

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1f2331]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#e10600]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-f1">
              Live Track GPS & Circuit Minimap
            </h2>
          </div>
          <p className="text-xs text-[#8f96a8]">
            {meeting?.circuit_short_name || 'Autodromo Nazionale Monza'} • 5.793 km • Clockwise
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c1Color }} />
            <span className="text-white font-bold">{driver1?.name_acronym || 'CAR 1'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c2Color }} />
            <span className="text-white font-bold">{driver2?.name_acronym || 'CAR 2'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flag className="w-3.5 h-3.5" />
            <span>Finish Line</span>
          </div>
        </div>
      </div>

      {/* SVG Circuit Canvas */}
      <div className="relative w-full h-[320px] bg-[#0b0c12] rounded-xl border border-[#232735] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full p-2 select-none"
        >
          {/* Subtle circuit glow backdrop */}
          <path
            d={pathString}
            fill="none"
            stroke="#1d2233"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Actual asphalt trace */}
          <path
            d={pathString}
            fill="none"
            stroke="#343b52"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Track apex racing line */}
          <path
            d={pathString}
            fill="none"
            stroke="#e10600"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Start/Finish Line marker */}
          <circle cx="250" cy="48" r="4" fill="#ffffff" stroke="#e10600" strokeWidth="2" />

          {/* CAR 2 GPS Position Marker */}
          {c2Pos && (
            <g transform={`translate(${c2Pos.x}, ${c2Pos.y})`}>
              <circle r="12" fill={c2Color} opacity="0.25" className="animate-ping" />
              <circle r="7" fill={c2Color} stroke="#ffffff" strokeWidth="2" />
              <text
                y="-11"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                className="select-none"
              >
                {driver2?.name_acronym || 'C2'}
              </text>
            </g>
          )}

          {/* CAR 1 GPS Position Marker */}
          {c1Pos && (
            <g transform={`translate(${c1Pos.x}, ${c1Pos.y})`}>
              <circle r="14" fill={c1Color} opacity="0.3" className="animate-ping" />
              <circle r="8" fill={c1Color} stroke="#ffffff" strokeWidth="2" />
              <text
                y="-12"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                className="select-none"
              >
                {driver1?.name_acronym || 'C1'}
              </text>
            </g>
          )}
        </svg>

        {/* Turn Annotations Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#161822]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#2b3042] text-[11px] font-mono text-[#8f96a8]">
          Track Sector: <span className="text-white font-bold">{progressPercentage < 33 ? 'Sector 1' : progressPercentage < 66 ? 'Sector 2' : 'Sector 3'}</span>
        </div>
      </div>
    </div>
  );
};
