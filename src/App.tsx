import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AirportSimState, createInitialSimState } from './sim/airportState';
import { createAircraftFromFlight, updateAircraft } from './sim/aircraftSim';
import { createInitialPassengers, updatePassengers } from './sim/passengerSim';
import { createInitialVehicles, updateVehicles } from './sim/vehicleSim';
import {
  initRainParticles,
  updateRainParticles,
  advanceGameClock,
  cycleWeather,
  RainDrop,
} from './sim/weatherSim';
import { calculateDailyFinances } from './sim/economySim';
import { saveGameState, loadGameState, clearGameState } from './sim/saveManager';
import { soundManager } from './audio/soundManager';
import { AirportRenderer } from './canvas/AirportRenderer';
import { BuildingDef, PlacedBuilding, Flight, GameMode } from './types';

// UI Components
import { TopHUD } from './components/TopHUD';
import { Sidebar, ActiveModal } from './components/Sidebar';
import { FlightInspector } from './components/FlightInspector';
import { EventsFeed } from './components/EventsFeed';
import { FlightScheduleWidget } from './components/FlightScheduleWidget';
import { MinimapWidget } from './components/MinimapWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { FinancesWidget } from './components/FinancesWidget';
import { BottomBar } from './components/BottomBar';

// Modals
import { BuildCatalogModal } from './components/modals/BuildCatalogModal';
import { FlightSchedulerModal } from './components/modals/FlightSchedulerModal';
import { AircraftFleetModal } from './components/modals/AircraftFleetModal';
import { PassengerRosterModal } from './components/modals/PassengerRosterModal';
import { BaggageSystemModal } from './components/modals/BaggageSystemModal';
import { StaffManagementModal } from './components/modals/StaffManagementModal';
import { FinancesModal } from './components/modals/FinancesModal';
import { StatisticsModal } from './components/modals/StatisticsModal';
import { ResearchTreeModal } from './components/modals/ResearchTreeModal';
import { CityWorldModal } from './components/modals/CityWorldModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { TutorialModal } from './components/modals/TutorialModal';

export default function App() {
  const [state, setState] = useState<AirportSimState>(() => {
    const saved = loadGameState();
    if (saved) return saved;
    const initial = createInitialSimState();
    // Pre-populate aircraft from initial flights
    initial.aircraft = initial.flights.map((f) => createAircraftFromFlight(f));
    initial.passengers = createInitialPassengers(80);
    initial.vehicles = createInitialVehicles();
    return initial;
  });

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedBuildingDef, setSelectedBuildingDef] = useState<BuildingDef | null>(null);

  // Canvas & Simulation references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<AirportRenderer | null>(null);
  const simStateRef = useRef<AirportSimState>(state);
  simStateRef.current = state;

  const rainDropsRef = useRef<RainDrop[]>(initRainParticles(180));
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);

  // Initialize Canvas & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new AirportRenderer(canvas);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Simulation Loop with requestAnimationFrame
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let weatherTimer = 0;
    let autoSaveTimer = 0;

    const gameLoop = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const currentState = { ...simStateRef.current };
      const speed = currentState.simSpeed;

      if (speed > 0) {
        // 1. Advance Game Clock & Day/Night
        const { newTimeString, newGameDay, dayChanged } = advanceGameClock(
          currentState.timeString,
          currentState.gameDay,
          dt,
          speed
        );
        currentState.timeString = newTimeString;
        currentState.gameDay = newGameDay;

        // 2. Weather Cycle (every ~180 seconds)
        weatherTimer += dt * speed;
        if (weatherTimer > 180) {
          weatherTimer = 0;
          currentState.weather = cycleWeather(currentState.weather);
        }

        // Update rain particles
        if (
          currentState.weather.current === 'rain' ||
          currentState.weather.current === 'heavy_rain' ||
          currentState.weather.current === 'thunderstorm'
        ) {
          rainDropsRef.current = updateRainParticles(rainDropsRef.current, dt * speed);
        }

        // 3. Update Aircraft State Machine
        const { updatedAircraft, updatedFlights } = updateAircraft(
          currentState.aircraft,
          currentState.flights,
          dt,
          speed,
          (flightId, newState, message) => {
            if (message) {
              const newEvent = {
                id: 'ev_' + Date.now() + Math.random().toString(36).substring(2, 5),
                title: message,
                description: `Flight ${flightId} status update`,
                time: currentState.timeString,
                type: 'info' as const,
              };
              currentState.events = [newEvent, ...currentState.events.slice(0, 15)];
            }
          }
        );
        currentState.aircraft = updatedAircraft;
        currentState.flights = updatedFlights;

        // 4. Update Passengers
        const boardingGates = new Set<string>();
        currentState.flights.forEach((f) => {
          if (f.status === 'Boarding') boardingGates.add(f.gate);
        });
        currentState.passengers = updatePassengers(currentState.passengers, dt, speed, boardingGates);

        // 5. Update Ground Service Vehicles
        currentState.vehicles = updateVehicles(currentState.vehicles, dt, speed);

        // 6. Update Active Research Progress
        currentState.research = currentState.research.map((res) => {
          if (res.researching && !res.unlocked) {
            const addedProgress = (dt * speed / res.researchTimeSeconds) * 100;
            const newProgress = Math.min(100, res.progress + addedProgress);
            if (newProgress >= 100) {
              soundManager.playCash();
              return { ...res, progress: 100, unlocked: true, researching: false };
            }
            return { ...res, progress: Math.round(newProgress) };
          }
          return res;
        });

        // 7. Day Changed: Calculate daily finances & add to ledger
        if (dayChanged) {
          const { dailyIncome, dailyExpenses, netProfit, breakdown } = calculateDailyFinances(
            currentState.buildings,
            currentState.staff,
            currentState.contracts,
            currentState.totalPassengersProcessed
          );

          currentState.finances = {
            cash: currentState.finances.cash + netProfit,
            dailyIncome,
            dailyExpenses,
            netProfit,
            breakdown,
            dailyHistory: [
              ...currentState.finances.dailyHistory.slice(-4),
              { day: newGameDay - 1, income: dailyIncome, expenses: dailyExpenses, net: netProfit },
            ],
          };

          // Level Progression check
          const addedXp = 80;
          let newXp = currentState.xp + addedXp;
          let newLevel = currentState.level;
          if (newXp >= currentState.xpToNextLevel && newLevel < 5) {
            newLevel += 1;
            newXp = newXp - currentState.xpToNextLevel;
            soundManager.playCash();
          }
          currentState.xp = newXp;
          currentState.level = newLevel;
          currentState.totalPassengersProcessed += Math.floor(120 + Math.random() * 60);
        }

        // Camera follow mode: smoothly center camera on followed entity
        if (currentState.camera.followingEntityId) {
          const targetAc = currentState.aircraft.find(
            (a) => a.id === currentState.camera.followingEntityId || a.flightId === currentState.camera.followingEntityId
          );
          if (targetAc) {
            currentState.camera.x += (targetAc.x - currentState.camera.x) * 0.08;
            currentState.camera.y += (targetAc.y - currentState.camera.y) * 0.08;
          } else {
            const targetP = currentState.passengers.find((p) => p.id === currentState.camera.followingEntityId);
            if (targetP) {
              currentState.camera.x += (targetP.x - currentState.camera.x) * 0.08;
              currentState.camera.y += (targetP.y - currentState.camera.y) * 0.08;
            }
          }
        }

        // Auto-save every 30 seconds
        autoSaveTimer += dt;
        if (autoSaveTimer > 30) {
          autoSaveTimer = 0;
          saveGameState(currentState);
        }

        setState(currentState);
      }

      // Render the current scene
      if (rendererRef.current && canvasRef.current) {
        let buildPreview = null;
        if (selectedBuildingDef) {
          const tileX = Math.floor(lastMousePosRef.current.x / 40);
          const tileY = Math.floor(lastMousePosRef.current.y / 40);
          buildPreview = {
            x: tileX,
            y: tileY,
            width: selectedBuildingDef.width,
            height: selectedBuildingDef.height,
            name: selectedBuildingDef.name,
          };
        }

        rendererRef.current.render(
          currentState.buildings,
          currentState.aircraft,
          currentState.passengers,
          currentState.vehicles,
          currentState.camera,
          currentState.weather,
          currentState.timeString,
          rainDropsRef.current,
          currentState.selectedEntityId,
          buildPreview
        );
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [selectedBuildingDef]);

  // Keyboard navigation (WASD / Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 40;
      setState((prev) => {
        const cam = { ...prev.camera, followingEntityId: null };
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') cam.y -= step;
        else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') cam.y += step;
        else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') cam.x -= step;
        else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') cam.x += step;
        else return prev;
        return { ...prev, camera: cam };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pointer & Touch Controls (Drag to Pan, Wheel to Zoom)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert screen coordinates to world coordinates for build preview
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = (screenX - canvas.width / 2) / state.camera.zoom + state.camera.x;
    const worldY = (screenY - canvas.height / 2) / state.camera.zoom + state.camera.y;
    lastMousePosRef.current = { x: worldX, y: worldY };

    if (!isDraggingRef.current) return;

    const dx = (e.clientX - dragStartRef.current.x) / state.camera.zoom;
    const dy = (e.clientY - dragStartRef.current.y) / state.camera.zoom;

    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setState((prev) => ({
      ...prev,
      camera: {
        ...prev.camera,
        x: prev.camera.x - dx,
        y: prev.camera.y - dy,
        followingEntityId: null, // manual pan breaks camera lock
      },
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - touchDistRef.current;
      touchDistRef.current = dist;

      const zoomFactor = delta > 0 ? 1.03 : 0.97;
      setState((prev) => ({
        ...prev,
        camera: {
          ...prev.camera,
          zoom: Math.max(0.35, Math.min(2.5, prev.camera.zoom * zoomFactor)),
        },
      }));
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

    setState((prev) => {
      const newZoom = Math.max(0.35, Math.min(2.5, prev.camera.zoom * zoomFactor));
      return {
        ...prev,
        camera: { ...prev.camera, zoom: newZoom },
      };
    });
  };

  // Canvas Click: Hit-test Aircraft or Place Building
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = (screenX - canvas.width / 2) / state.camera.zoom + state.camera.x;
    const worldY = (screenY - canvas.height / 2) / state.camera.zoom + state.camera.y;

    // 1. Build Mode: Place building
    if (selectedBuildingDef) {
      const tileX = Math.floor(worldX / 40);
      const tileY = Math.floor(worldY / 40);

      if (state.finances.cash >= selectedBuildingDef.cost) {
        soundManager.playBuild();
        const newBuilding: PlacedBuilding = {
          id: 'b_' + Date.now(),
          defId: selectedBuildingDef.id,
          name: selectedBuildingDef.name,
          category: selectedBuildingDef.category,
          x: tileX,
          y: tileY,
          width: selectedBuildingDef.width,
          height: selectedBuildingDef.height,
          level: 1,
        };

        setState((prev) => ({
          ...prev,
          buildings: [...prev.buildings, newBuilding],
          finances: {
            ...prev.finances,
            cash: prev.finances.cash - selectedBuildingDef.cost,
          },
        }));
        setSelectedBuildingDef(null);
      }
      return;
    }

    // 2. Click on aircraft to inspect
    for (const ac of state.aircraft) {
      const dist = Math.hypot(ac.x - worldX, ac.y - worldY);
      if (dist < 45) {
        soundManager.playClick();
        setState((prev) => ({
          ...prev,
          selectedFlightId: ac.flightId,
          selectedEntityId: ac.flightId,
        }));
        return;
      }
    }
  };

  // Handlers for UI actions
  const handleFollowAircraft = (flightId: string) => {
    const ac = state.aircraft.find((a) => a.flightId === flightId);
    if (ac) {
      setState((prev) => ({
        ...prev,
        selectedFlightId: flightId,
        selectedEntityId: flightId,
        camera: {
          ...prev.camera,
          x: ac.x,
          y: ac.y,
          zoom: 1.2, // zoom into aircraft view
          followingEntityId: ac.id,
        },
      }));
    }
  };

  const handleFollowPassenger = (passengerId: string) => {
    const p = state.passengers.find((item) => item.id === passengerId);
    if (p) {
      setState((prev) => ({
        ...prev,
        selectedEntityId: passengerId,
        camera: {
          ...prev.camera,
          x: p.x,
          y: p.y,
          zoom: 1.8, // Close passenger view!
          followingEntityId: p.id,
        },
      }));
    }
  };

  const handleToggleBuildMode = () => {
    if (state.buildModeActive) {
      setState((prev) => ({ ...prev, buildModeActive: false }));
      setSelectedBuildingDef(null);
    } else {
      setActiveModal('build');
      setState((prev) => ({ ...prev, buildModeActive: true }));
    }
  };

  const handleSelectBuildingDef = (def: BuildingDef) => {
    setSelectedBuildingDef(def);
    setState((prev) => ({ ...prev, buildModeActive: true }));
  };

  const handleToggleContract = (contractId: string) => {
    soundManager.playCash();
    setState((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) => (c.id === contractId ? { ...c, active: !c.active } : c)),
    }));
  };

  const handleAddFlight = (flight: Flight) => {
    const newAc = createAircraftFromFlight(flight, 'APPROACHING');
    setState((prev) => ({
      ...prev,
      flights: [flight, ...prev.flights],
      aircraft: [newAc, ...prev.aircraft],
    }));
  };

  const handleCancelFlight = (flightId: string) => {
    setState((prev) => ({
      ...prev,
      flights: prev.flights.filter((f) => f.id !== flightId),
      aircraft: prev.aircraft.filter((a) => a.flightId !== flightId),
    }));
  };

  const handleUpdateStaffCount = (depId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === depId ? { ...s, count: Math.max(1, s.count + delta) } : s
      ),
    }));
  };

  const handleStartResearch = (techId: string) => {
    setState((prev) => ({
      ...prev,
      research: prev.research.map((r) =>
        r.id === techId ? { ...r, researching: true, progress: 5 } : r
      ),
      finances: {
        ...prev.finances,
        cash: prev.finances.cash - (prev.research.find((r) => r.id === techId)?.cost || 0),
      },
    }));
  };

  const handleBuildCityFacility = (facilityId: string) => {
    const fac = state.cityFacilities.find((f) => f.id === facilityId);
    if (!fac || state.finances.cash < fac.cost) return;

    setState((prev) => ({
      ...prev,
      cityFacilities: prev.cityFacilities.map((f) => (f.id === facilityId ? { ...f, built: true } : f)),
      finances: { ...prev.finances, cash: prev.finances.cash - fac.cost },
    }));
  };

  const handleUnlockHub = (hubId: string) => {
    const hub = state.worldHubs.find((h) => h.id === hubId);
    if (!hub || state.finances.cash < hub.unlockCost) return;

    setState((prev) => ({
      ...prev,
      worldHubs: prev.worldHubs.map((h) => (h.id === hubId ? { ...h, unlocked: true } : h)),
      finances: { ...prev.finances, cash: prev.finances.cash - hub.unlockCost },
    }));
  };

  const handleSaveGame = () => {
    saveGameState(state);
  };

  const handleResetGame = () => {
    clearGameState();
    const fresh = createInitialSimState();
    fresh.aircraft = fresh.flights.map((f) => createAircraftFromFlight(f));
    fresh.passengers = createInitialPassengers(80);
    fresh.vehicles = createInitialVehicles();
    setState(fresh);
  };

  const handleSelectGameMode = (mode: GameMode) => {
    setState((prev) => ({
      ...prev,
      gameMode: mode,
      finances: {
        ...prev.finances,
        cash: mode === 'sandbox' ? 99000000 : prev.finances.cash,
      },
    }));
  };

  const selectedFlight = state.flights.find((f) => f.id === state.selectedFlightId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Airport Canvas 2D Engine */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Build Mode Active Notification Banner */}
      {selectedBuildingDef && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-sky-600/90 backdrop-blur-md border border-sky-400 text-white px-5 py-2 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xs font-bold">Placing: {selectedBuildingDef.name}</span>
          <span className="text-[11px] opacity-80">(Click anywhere on the airport grounds to build)</span>
          <button
            onClick={() => setSelectedBuildingDef(null)}
            className="text-xs bg-sky-800 hover:bg-sky-900 px-2 py-0.5 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 2. Top HUD Bar */}
      <TopHUD
        state={state}
        onSpeedChange={(speed) => setState((prev) => ({ ...prev, simSpeed: speed }))}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      {/* 3. Left Sidebar */}
      <Sidebar
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        buildModeActive={state.buildModeActive}
        onToggleBuildMode={handleToggleBuildMode}
      />

      {/* 4. Top Right: Flight Inspector */}
      <div className="absolute right-3 top-16 z-20">
        <FlightInspector flight={selectedFlight} onFollowAircraft={handleFollowAircraft} />
      </div>

      {/* 5. Bottom Right: Recent Events Feed */}
      <div className="absolute right-3 bottom-16 z-20">
        <EventsFeed events={state.events} />
      </div>

      {/* 6. Bottom Panels (Flight Schedule, Minimap, Weather, Finances) */}
      <div className="absolute left-16 md:left-40 bottom-16 z-20 flex items-end gap-3 pointer-events-auto">
        <FlightScheduleWidget
          flights={state.flights}
          selectedFlightId={state.selectedFlightId}
          onSelectFlight={(id) => {
            setState((prev) => ({ ...prev, selectedFlightId: id, selectedEntityId: id }));
            handleFollowAircraft(id);
          }}
          onViewAll={() => setActiveModal('flights')}
        />

        <MinimapWidget
          buildings={state.buildings}
          aircraftList={state.aircraft}
          camera={state.camera}
          onMoveCamera={(x, y) =>
            setState((prev) => ({
              ...prev,
              camera: { ...prev.camera, x, y, followingEntityId: null },
            }))
          }
          onZoom={(delta) =>
            setState((prev) => ({
              ...prev,
              camera: {
                ...prev.camera,
                zoom: Math.max(0.35, Math.min(2.5, prev.camera.zoom + delta)),
              },
            }))
          }
          onResetCamera={() =>
            setState((prev) => ({
              ...prev,
              camera: { ...prev.camera, x: 1000, y: 750, zoom: 0.65, followingEntityId: null },
            }))
          }
        />

        <WeatherWidget weather={state.weather} />

        <FinancesWidget finances={state.finances} onClickFinances={() => setActiveModal('finances')} />
      </div>

      {/* 7. Bottom Bar */}
      <BottomBar
        level={state.level}
        xp={state.xp}
        xpToNextLevel={state.xpToNextLevel}
        dailyIncome={state.finances.dailyIncome}
        dailyExpenses={state.finances.dailyExpenses}
        netProfit={state.finances.netProfit}
        buildModeActive={state.buildModeActive}
        onToggleBuildMode={handleToggleBuildMode}
      />

      {/* 8. Modals */}
      {activeModal === 'build' && (
        <BuildCatalogModal
          cash={state.finances.cash}
          airportLevel={state.level}
          onClose={() => setActiveModal(null)}
          onSelectBuildingDef={handleSelectBuildingDef}
        />
      )}

      {activeModal === 'flights' && (
        <FlightSchedulerModal
          flights={state.flights}
          contracts={state.contracts}
          reputation={state.reputation}
          onClose={() => setActiveModal(null)}
          onToggleContract={handleToggleContract}
          onAddFlight={handleAddFlight}
          onCancelFlight={handleCancelFlight}
        />
      )}

      {activeModal === 'aircraft' && (
        <AircraftFleetModal
          aircraftList={state.aircraft}
          onClose={() => setActiveModal(null)}
          onFollowAircraft={handleFollowAircraft}
        />
      )}

      {activeModal === 'passengers' && (
        <PassengerRosterModal
          passengers={state.passengers}
          totalProcessed={state.totalPassengersProcessed}
          onClose={() => setActiveModal(null)}
          onFollowPassenger={handleFollowPassenger}
        />
      )}

      {activeModal === 'baggage' && <BaggageSystemModal onClose={() => setActiveModal(null)} />}

      {activeModal === 'staff' && (
        <StaffManagementModal
          staff={state.staff}
          cash={state.finances.cash}
          onClose={() => setActiveModal(null)}
          onUpdateStaffCount={handleUpdateStaffCount}
        />
      )}

      {activeModal === 'finances' && (
        <FinancesModal finances={state.finances} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'statistics' && (
        <StatisticsModal state={state} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'research' && (
        <ResearchTreeModal
          research={state.research}
          cash={state.finances.cash}
          onClose={() => setActiveModal(null)}
          onStartResearch={handleStartResearch}
        />
      )}

      {activeModal === 'city' && (
        <CityWorldModal
          cityFacilities={state.cityFacilities}
          worldHubs={state.worldHubs}
          cash={state.finances.cash}
          airportLevel={state.level}
          onClose={() => setActiveModal(null)}
          onBuildFacility={handleBuildCityFacility}
          onUnlockHub={handleUnlockHub}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          soundEnabled={soundManager.enabled}
          gameMode={state.gameMode}
          onClose={() => setActiveModal(null)}
          onToggleSound={() => {
            soundManager.enabled = !soundManager.enabled;
          }}
          onSaveGame={handleSaveGame}
          onResetGame={handleResetGame}
          onSelectGameMode={handleSelectGameMode}
        />
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
