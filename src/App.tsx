import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Meeting,
  Session,
  Driver,
  CarTelemetry,
  Lap,
  Stint,
  Interval,
  Weather,
  CarTelemetryComparisonPoint,
  CarAnalysisStats
} from './types/f1';
import {
  getLatestSession,
  getMeetings,
  getSessions,
  getDrivers,
  getLaps,
  getCarData,
  getLocation,
  getStints,
  getIntervals,
  getWeather,
  alignTelemetryForComparison,
  calculateCarStats
} from './services/f1Api';
import {
  SAMPLE_MEETING,
  SAMPLE_SESSION,
  SAMPLE_DRIVERS,
  SAMPLE_WEATHER,
  generateSyntheticLapTelemetry
} from './services/sampleData';
import { Header } from './components/Header';
import { DriverPicker } from './components/DriverPicker';
import { CockpitHUD } from './components/CockpitHUD';
import { CarTelemetryComparison } from './components/CarTelemetryComparison';
import { TrackMinimap } from './components/TrackMinimap';
import { LiveTimingTower } from './components/LiveTimingTower';
import { HeadToHeadRadar } from './components/HeadToHeadRadar';
import { StintsStrategy } from './components/StintsStrategy';
import { SessionSummaryBanner } from './components/SessionSummaryBanner';
import { FloatingReplayBar } from './components/FloatingReplayBar';

export const App: React.FC = () => {
  // Navigation & Session State
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Theme & Appearance State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('apex_theme', theme);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Optional Comparison Mode (Solo Car vs Dual-Car Comparison)
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(true);
  const handleToggleComparisonMode = () => {
    setIsComparisonMode((prev) => !prev);
  };

  // Live Auto-Sync
  const [isLivePolling, setIsLivePolling] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('telemetry');

  // Drivers & Data
  const [drivers, setDrivers] = useState<Driver[]>(SAMPLE_DRIVERS);
  const [driver1, setDriver1] = useState<Driver | null>(SAMPLE_DRIVERS[0]);
  const [driver2, setDriver2] = useState<Driver | null>(SAMPLE_DRIVERS[1]);

  // Telemetry & Comparison State
  const [car1Telemetry, setCar1Telemetry] = useState<CarTelemetry[]>([]);
  const [car2Telemetry, setCar2Telemetry] = useState<CarTelemetry[]>([]);
  const [trackLocations, setTrackLocations] = useState<{ x: number; y: number }[]>([]);

  // Synchronized Playback & Scrubbing State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // Default strictly 1x
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);

  // Timing & Track State
  const [laps, setLaps] = useState<Lap[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [weather, setWeather] = useState<Weather | null>(SAMPLE_WEATHER);

  // 1. Initial Load: Auto-detect latest session immediately on enter
  const initLatestSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const latest = await getLatestSession();
      if (latest) {
        setSelectedYear(latest.year || 2026);
        const yearMeetings = await getMeetings(latest.year || 2026);
        setMeetings(yearMeetings.length ? yearMeetings : [SAMPLE_MEETING]);

        const matchingMeeting =
          yearMeetings.find((m) => m.meeting_key === latest.meeting_key) ||
          yearMeetings[yearMeetings.length - 1] ||
          SAMPLE_MEETING;
        setSelectedMeeting(matchingMeeting);

        const meetingSessions = await getSessions(latest.year || 2026, matchingMeeting.meeting_key);
        setSessions(meetingSessions.length ? meetingSessions : [latest]);
        setSelectedSession(latest);

        // Fetch drivers & laps in parallel immediately to identify P1 player
        const [sessionDrivers, sessionLaps] = await Promise.all([
          getDrivers(latest.session_key),
          getLaps(latest.session_key),
        ]);
        setLaps(sessionLaps);

        if (sessionDrivers.length >= 2) {
          const bestMap = new Map<number, number>();
          sessionLaps.forEach((l) => {
            if (!l.lap_duration || l.is_pit_out_lap) return;
            const cur = bestMap.get(l.driver_number);
            if (!cur || l.lap_duration < cur) {
              bestMap.set(l.driver_number, l.lap_duration);
            }
          });

          // Sort drivers strictly by fastest lap duration (P1, P2, P3...)
          const sorted = [...sessionDrivers].sort((a, b) => {
            const aT = bestMap.get(a.driver_number) ?? Infinity;
            const bT = bestMap.get(b.driver_number) ?? Infinity;
            return aT - bT;
          });

          setDrivers(sorted);
          // Requirement 4: The default player will be the P1 player from latest race!
          setDriver1(sorted[0]);
          setDriver2(sorted[1]);
        }
      } else {
        const yearMeetings = await getMeetings(2024);
        setMeetings(yearMeetings.length ? yearMeetings : [SAMPLE_MEETING]);
        const m = yearMeetings[yearMeetings.length - 1] || SAMPLE_MEETING;
        setSelectedMeeting(m);
        const s = await getSessions(2024, m.meeting_key);
        setSessions(s.length ? s : [SAMPLE_SESSION]);
        setSelectedSession(s[s.length - 1] || SAMPLE_SESSION);
      }
    } catch (err) {
      console.warn('Could not auto-fetch latest session, using fallback', err);
      setMeetings([SAMPLE_MEETING]);
      setSelectedMeeting(SAMPLE_MEETING);
      setSessions([SAMPLE_SESSION]);
      setSelectedSession(SAMPLE_SESSION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initLatestSession();
  }, [initLatestSession]);

  // 2. Year change: update meetings
  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setIsLoading(true);
    try {
      const mList = await getMeetings(year);
      if (mList.length) {
        setMeetings(mList);
        const lastMeeting = mList[mList.length - 1];
        setSelectedMeeting(lastMeeting);
        const sList = await getSessions(year, lastMeeting.meeting_key);
        setSessions(sList);
        setSelectedSession(sList.length ? sList[sList.length - 1] : null);
      } else {
        setMeetings([SAMPLE_MEETING]);
        setSelectedMeeting(SAMPLE_MEETING);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Meeting change: update sessions
  const handleMeetingChange = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsLoading(true);
    try {
      const sList = await getSessions(selectedYear, meeting.meeting_key);
      setSessions(sList.length ? sList : [SAMPLE_SESSION]);
      setSelectedSession(sList.length ? sList[sList.length - 1] : SAMPLE_SESSION);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Session change: load drivers and session telemetry
  const loadSessionData = useCallback(async (sessionKey: number) => {
    setIsLoading(true);
    try {
      const [driverList, lapList, stintList, intervalList, weatherData] = await Promise.all([
        getDrivers(sessionKey),
        getLaps(sessionKey),
        getStints(sessionKey),
        getIntervals(sessionKey),
        getWeather(sessionKey),
      ]);

      if (driverList.length >= 2) {
        const bestMap = new Map<number, number>();
        lapList.forEach((l) => {
          if (!l.lap_duration || l.is_pit_out_lap) return;
          const cur = bestMap.get(l.driver_number);
          if (!cur || l.lap_duration < cur) {
            bestMap.set(l.driver_number, l.lap_duration);
          }
        });

        const sorted = [...driverList].sort((a, b) => {
          const aT = bestMap.get(a.driver_number) ?? Infinity;
          const bT = bestMap.get(b.driver_number) ?? Infinity;
          return aT - bT;
        });

        setDrivers(sorted);
        setDriver1((prev) => (prev ? sorted.find((d) => d.driver_number === prev.driver_number) || sorted[0] : sorted[0]));
        setDriver2((prev) => (prev ? sorted.find((d) => d.driver_number === prev.driver_number) || sorted[1] : sorted[1]));
      } else {
        setDrivers(SAMPLE_DRIVERS);
      }

      setLaps(lapList);
      setStints(stintList);
      setIntervals(intervalList);
      if (weatherData) setWeather(weatherData);
    } catch (err) {
      console.warn('Error loading session data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSession?.session_key) {
      loadSessionData(selectedSession.session_key);
    }
  }, [selectedSession, loadSessionData]);

  // 5. Driver selection change: fetch genuine lap-bounded telemetry and GPS track points
  const loadTelemetryForDrivers = useCallback(async () => {
    if (!selectedSession || !driver1) return;

    try {
      // Find Driver 1's best flying lap to bound the OpenF1 query window
      const d1Laps = laps.filter(
        (l) => l.driver_number === driver1.driver_number && l.lap_duration && !l.is_pit_out_lap
      );
      const d1Best = d1Laps.reduce<Lap | null>(
        (min, cur) => (!min || (cur.lap_duration && cur.lap_duration < (min.lap_duration || Infinity)) ? cur : min),
        null
      );

      let d1Start: string | undefined;
      let d1End: string | undefined;
      if (d1Best?.date_start && d1Best?.lap_duration) {
        d1Start = d1Best.date_start;
        d1End = new Date(new Date(d1Start).getTime() + (d1Best.lap_duration + 1.5) * 1000).toISOString();
      }

      // Find Driver 2's best flying lap if in comparison mode
      let d2Start: string | undefined;
      let d2End: string | undefined;
      if (driver2) {
        const d2Laps = laps.filter(
          (l) => l.driver_number === driver2.driver_number && l.lap_duration && !l.is_pit_out_lap
        );
        const d2Best = d2Laps.reduce<Lap | null>(
          (min, cur) => (!min || (cur.lap_duration && cur.lap_duration < (min.lap_duration || Infinity)) ? cur : min),
          null
        );
        if (d2Best?.date_start && d2Best?.lap_duration) {
          d2Start = d2Best.date_start;
          d2End = new Date(new Date(d2Start).getTime() + (d2Best.lap_duration + 1.5) * 1000).toISOString();
        }
      }

      const sanitize = (data: CarTelemetry[]): CarTelemetry[] => {
        return data.map((pt) => ({
          ...pt,
          throttle: Math.min(100, Math.max(0, pt.throttle === 104 ? 0 : pt.throttle)),
          brake: Math.min(100, Math.max(0, pt.brake === 104 ? 0 : pt.brake)),
          drs: pt.drs > 14 ? 0 : pt.drs,
        }));
      };

      const [c1Raw, c2Raw, locRaw] = await Promise.all([
        getCarData(selectedSession.session_key, driver1.driver_number, d1Start, d1End),
        driver2 ? getCarData(selectedSession.session_key, driver2.driver_number, d2Start, d2End) : Promise.resolve([]),
        d1Start && d1End
          ? getLocation(selectedSession.session_key, driver1.driver_number, d1Start, d1End)
          : getLocation(selectedSession.session_key, driver1.driver_number),
      ]);

      if (c1Raw && c1Raw.length >= 10) {
        setCar1Telemetry(sanitize(c1Raw));
      } else {
        setCar1Telemetry(generateSyntheticLapTelemetry(driver1.driver_number, 0));
      }

      if (c2Raw && c2Raw.length >= 10 && driver2) {
        setCar2Telemetry(sanitize(c2Raw));
      } else if (driver2) {
        setCar2Telemetry(generateSyntheticLapTelemetry(driver2.driver_number, -4));
      } else {
        setCar2Telemetry([]);
      }

      if (locRaw && locRaw.length >= 20) {
        setTrackLocations(locRaw.map((p) => ({ x: p.x, y: p.y })));
      } else {
        setTrackLocations([]);
      }
    } catch (err) {
      console.warn('Telemetry fetch error, using synthetic telemetry', err);
      if (driver1) setCar1Telemetry(generateSyntheticLapTelemetry(driver1.driver_number, 0));
      if (driver2) setCar2Telemetry(generateSyntheticLapTelemetry(driver2.driver_number, -4));
      setTrackLocations([]);
    }
  }, [selectedSession, driver1, driver2, laps]);

  useEffect(() => {
    loadTelemetryForDrivers();
  }, [loadTelemetryForDrivers]);

  // 6. Live Polling Loop
  useEffect(() => {
    if (!isLivePolling || !selectedSession) return;

    const intervalId = setInterval(async () => {
      try {
        const [lapList, intervalList] = await Promise.all([
          getLaps(selectedSession.session_key),
          getIntervals(selectedSession.session_key),
        ]);
        if (lapList.length) setLaps(lapList);
        if (intervalList.length) setIntervals(intervalList);
      } catch (e) {
        // Silent error during background poll
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLivePolling, selectedSession]);

  // Swap Drivers
  const handleSwapDrivers = () => {
    const temp = driver1;
    setDriver1(driver2);
    setDriver2(temp);
  };

  // Lap times map & Driver List sorted strictly by lap time ascending
  const { driverLapsMap, sortedDrivers } = useMemo(() => {
    const map = new Map<number, { best: number }>();
    laps.forEach((lap) => {
      if (!lap.lap_duration || lap.is_pit_out_lap) return;
      const current = map.get(lap.driver_number);
      if (!current || lap.lap_duration < current.best) {
        map.set(lap.driver_number, { best: lap.lap_duration });
      }
    });

    const sorted = [...drivers].sort((a, b) => {
      const aTime = map.get(a.driver_number)?.best ?? (80.5 + (a.driver_number % 20) * 0.15);
      const bTime = map.get(b.driver_number)?.best ?? (80.5 + (b.driver_number % 20) * 0.15);
      return aTime - bTime;
    });

    return { driverLapsMap: map, sortedDrivers: sorted };
  }, [drivers, laps]);

  // Synchronized telemetry comparison array
  const comparisonData: CarTelemetryComparisonPoint[] = useMemo(() => {
    return alignTelemetryForComparison(car1Telemetry, car2Telemetry);
  }, [car1Telemetry, car2Telemetry]);

  // Performance statistics for Car 1 and Car 2
  const stats1: CarAnalysisStats = useMemo(() => {
    return calculateCarStats(car1Telemetry);
  }, [car1Telemetry]);

  const stats2: CarAnalysisStats = useMemo(() => {
    return calculateCarStats(car2Telemetry);
  }, [car2Telemetry]);

  const currentPoint = comparisonData[currentPointIndex] || comparisonData[0] || null;

  // Selected driver lap duration for authentic 1x pacing
  const selectedPlayerLapDuration = useMemo(() => {
    if (!driver1) return 90;
    const recorded = driverLapsMap.get(driver1.driver_number)?.best;
    return recorded && recorded > 30 && recorded < 180 ? recorded : 90;
  }, [driver1, driverLapsMap]);

  // Global synchronized playback loop across all views/tabs
  useEffect(() => {
    if (!isPlaying || !comparisonData.length) return;

    const baseDuration = selectedPlayerLapDuration > 0 ? selectedPlayerLapDuration : 90;
    const stepIntervalMs = Math.max(
      16,
      Math.round((baseDuration / comparisonData.length) * (1000 / playbackSpeed))
    );

    const interval = setInterval(() => {
      setCurrentPointIndex((prev) => {
        const next = prev + 1;
        if (next >= comparisonData.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, stepIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, comparisonData.length, playbackSpeed, selectedPlayerLapDuration]);

  return (
    <div className="min-h-screen bg-pitwall-bg text-pitwall-textBright flex flex-col font-f1">
      {/* Header & Controls */}
      <Header
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onMeetingChange={handleMeetingChange}
        sessions={sessions}
        selectedSession={selectedSession}
        onSessionChange={(s) => setSelectedSession(s)}
        isLivePolling={isLivePolling}
        onToggleLivePolling={() => setIsLivePolling(!isLivePolling)}
        onFetchLatest={initLatestSession}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isComparisonMode={isComparisonMode}
        onToggleComparisonMode={handleToggleComparisonMode}
      />

      {/* Main Pit-Wall Dashboard */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-4 pb-28">
        {/* Session Status Strip */}
        <SessionSummaryBanner
          meeting={selectedMeeting}
          session={selectedSession}
          weather={weather}
        />

        {/* Dual-Channel Driver Picker */}
        <DriverPicker
          drivers={sortedDrivers}
          driver1={driver1}
          driver2={driver2}
          onSelectDriver1={setDriver1}
          onSelectDriver2={setDriver2}
          onSwapDrivers={handleSwapDrivers}
          isComparisonMode={isComparisonMode}
          onToggleComparisonMode={handleToggleComparisonMode}
          driverLapsMap={driverLapsMap}
        />

        {/* Active View Container */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <CarTelemetryComparison
              driver1={driver1}
              driver2={driver2}
              data={comparisonData}
              currentPointIndex={currentPointIndex}
              onScrub={setCurrentPointIndex}
              stats1={stats1}
              stats2={stats2}
              selectedYear={selectedYear}
              isComparisonMode={isComparisonMode}
              theme={theme}
              lapDurationSec={selectedPlayerLapDuration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
            />
            <CockpitHUD
              driver1={driver1}
              driver2={driver2}
              currentPoint={currentPoint}
              selectedYear={selectedYear}
              isComparisonMode={isComparisonMode}
            />
          </div>
        )}

        {activeTab === 'cockpit' && (
          <div className="space-y-4">
            <CockpitHUD
              driver1={driver1}
              driver2={driver2}
              currentPoint={currentPoint}
              selectedYear={selectedYear}
              isComparisonMode={isComparisonMode}
            />
            <CarTelemetryComparison
              driver1={driver1}
              driver2={driver2}
              data={comparisonData}
              currentPointIndex={currentPointIndex}
              onScrub={setCurrentPointIndex}
              stats1={stats1}
              stats2={stats2}
              selectedYear={selectedYear}
              isComparisonMode={isComparisonMode}
              theme={theme}
              lapDurationSec={selectedPlayerLapDuration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
            />
          </div>
        )}

        {activeTab === 'timing' && (
          <LiveTimingTower
            drivers={sortedDrivers}
            laps={laps}
            stints={stints}
            intervals={intervals}
            driver1={driver1}
            driver2={driver2}
            onSelectDriver1={(d) => {
              setDriver1(d);
              setActiveTab('telemetry');
            }}
            onSelectDriver2={(d) => {
              setDriver2(d);
              if (!isComparisonMode) setIsComparisonMode(true);
              setActiveTab('telemetry');
            }}
            isComparisonMode={isComparisonMode}
          />
        )}

        {activeTab === 'track' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrackMinimap
                meeting={selectedMeeting}
                driver1={driver1}
                driver2={driver2}
                progressPercentage={currentPoint?.percentage || 0}
                locations={trackLocations}
                onTrackClick={(pct) => {
                  const targetIdx = Math.round((pct / 100) * (comparisonData.length - 1));
                  setCurrentPointIndex(targetIdx);
                }}
                isComparisonMode={isComparisonMode}
                theme={theme}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onResetReplay={() => {
                  setIsPlaying(false);
                  setCurrentPointIndex(0);
                }}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                currentSpeed={currentPoint?.c1Speed}
                c2Speed={currentPoint?.c2Speed}
              />
            </div>
            <div>
              <CockpitHUD
                driver1={driver1}
                driver2={driver2}
                currentPoint={currentPoint}
                selectedYear={selectedYear}
                isComparisonMode={isComparisonMode}
              />
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <HeadToHeadRadar
            driver1={driver1}
            driver2={driver2}
            stats1={stats1}
            stats2={stats2}
            selectedYear={selectedYear}
            isComparisonMode={isComparisonMode}
            currentPoint={currentPoint}
          />
        )}

        {activeTab === 'stints' && (
          <StintsStrategy
            driver1={driver1}
            driver2={driver2}
            stints={stints}
            isComparisonMode={isComparisonMode}
          />
        )}
      </main>

      {/* Floating Global Replay Dock */}
      <FloatingReplayBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        currentPointIndex={currentPointIndex}
        totalPoints={comparisonData.length}
        onScrub={setCurrentPointIndex}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
        driver1={driver1}
        driver2={driver2}
        currentPoint={currentPoint}
        lapDurationSec={selectedPlayerLapDuration}
        selectedYear={selectedYear}
        isComparisonMode={isComparisonMode}
        theme={theme}
      />

      {/* Engineering Footer */}
      <footer className="border-t border-pitwall-border bg-pitwall-panel py-3 px-4 text-xs text-pitwall-textMuted font-mono">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>OpenF1 v1 API Integration • Automatic Session Discovery</span>
          </div>
          <div>
            Data sourced directly from official timing feeds without manual maintenance.
          </div>
          <div>
            APEX Telemetry Workbench
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
