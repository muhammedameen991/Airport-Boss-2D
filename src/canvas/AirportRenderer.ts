import { PlacedBuilding, AircraftEntity, PassengerEntity, VehicleEntity, WeatherState } from '../types';
import { getAmbientLighting, RainDrop } from '../sim/weatherSim';

export class AirportRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get Canvas 2D context');
    this.ctx = ctx;
  }

  public render(
    buildings: PlacedBuilding[],
    aircraftList: AircraftEntity[],
    passengers: PassengerEntity[],
    vehicles: VehicleEntity[],
    camera: { x: number; y: number; zoom: number },
    weather: WeatherState,
    timeString: string,
    rainDrops: RainDrop[],
    selectedEntityId: string | null,
    buildPreviewDef: { x: number; y: number; width: number; height: number; name: string } | null
  ) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.animFrameTime += 0.016;

    // Clear background
    ctx.fillStyle = '#166534'; // rich airport lawn grass
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Camera transform: Center view on camera.x, camera.y
    ctx.translate(width / 2, height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw base terrain & grass patterning
    this.drawTerrain();

    // 2. Draw roads, curbside, parking lot, roundabout fountain
    this.drawRoadNetwork();

    // 3. Draw Runways & Taxiways
    this.drawRunwaysAndTaxiways(buildings);

    // 4. Draw Apron concrete & Gate markings
    this.drawApronAndGates(buildings);

    // 5. Draw Buildings (Terminal, ATC, Hangar, Fuel Depot, Hotel, Cargo)
    this.drawBuildings(buildings);

    // 6. Draw Passengers inside Terminal
    this.drawPassengers(passengers);

    // 7. Draw Ground Vehicles
    this.drawVehicles(vehicles);

    // 8. Draw Aircraft
    this.drawAircraft(aircraftList, selectedEntityId);

    // 9. Draw Build Preview ghost if active
    if (buildPreviewDef) {
      this.drawBuildPreview(buildPreviewDef);
    }

    // 10. Ambient Lighting (Day/Night cycle)
    this.drawAmbientLighting(timeString);

    // 11. Weather Effects (Rain streaks, Fog)
    if (weather.current === 'rain' || weather.current === 'heavy_rain' || weather.current === 'thunderstorm') {
      this.drawRain(rainDrops, weather.current === 'thunderstorm');
    } else if (weather.current === 'fog') {
      this.drawFog();
    }

    ctx.restore();
  }

  private drawTerrain() {
    const ctx = this.ctx;
    // World bounds roughly -400 to 2200, -200 to 1600
    ctx.fillStyle = '#1e3a1f';
    ctx.fillRect(-600, -400, 2800, 2000);

    // Airport main perimeter boundary
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.roundRect(80, 60, 1640, 1180, 24);
    ctx.fill();

    // Airport airfield concrete apron under all operations
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(140, 300, 1500, 360, 16);
    ctx.fill();
  }

  private drawRoadNetwork() {
    const ctx = this.ctx;

    // Curbside main road (y: 950 to 1030)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(160, 950, 1420, 80);

    // Road markings (dashed white center line)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 16]);
    ctx.beginPath();
    ctx.moveTo(160, 990);
    ctx.lineTo(1580, 990);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosswalk zebra stripes in front of terminal doors
    for (let x = 450; x <= 1100; x += 180) {
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 5; s++) {
        ctx.fillRect(x + s * 14, 955, 8, 70);
      }
    }

    // Center Roundabout with Water Fountain (x: 800, y: 1160)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(800, 1160, 75, 0, Math.PI * 2);
    ctx.fill();

    // Fountain basin
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(800, 1160, 48, 0, Math.PI * 2);
    ctx.fill();

    // Fountain water ripples
    const ripple = (Math.sin(this.animFrameTime * 4) + 1) * 12;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(800, 1160, 15 + ripple, 0, Math.PI * 2);
    ctx.stroke();

    // Fountain center spout
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(800, 1160, 6, 0, Math.PI * 2);
    ctx.fill();

    // Parking lot (x: 200 to 420, y: 1060 to 1320)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(200, 1060, 240, 260);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(200, 1060, 240, 260);

    // Parking spaces & parked cars
    const carColors = ['#ef4444', '#3b82f6', '#ffffff', '#eab308', '#10b981', '#64748b', '#000000', '#a855f7'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        const px = 215 + c * 52;
        const py = 1075 + r * 48;
        // Parking stall line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, 38, 26);

        // Draw car
        const carCol = carColors[(r * 4 + c) % carColors.length];
        ctx.fillStyle = carCol;
        ctx.beginPath();
        ctx.roundRect(px + 4, py + 3, 30, 20, 4);
        ctx.fill();
        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 12, py + 5, 8, 16);
      }
    }

    // Parking 'P' badge
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(300, 1170, 36, 36, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 318, 1188);

    // Palm trees and decorative green islands
    this.drawTree(160, 920);
    this.drawTree(175, 1040);
    this.drawTree(460, 1050);
    this.drawTree(700, 1100);
    this.drawTree(900, 1100);
    this.drawTree(1140, 1050);
    this.drawTree(1440, 920);
    this.drawTree(1450, 1040);
  }

  private drawTree(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRunwaysAndTaxiways(buildings: PlacedBuilding[]) {
    const ctx = this.ctx;

    // Main Runway 27/09 (x: 200 to 1480, y: 160 to 240, height 80px)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(200, 160, 1280, 80);

    // Runway blast pads (chevron markings at ends)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(160, 160, 40, 80);
    ctx.fillRect(1480, 160, 40, 80);

    // Piano keys threshold markings (west end)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(215 + i * 14, 168, 8, 64);
      ctx.fillRect(1350 + i * 14, 168, 8, 64);
    }

    // Runway numbers
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('09', 360, 200);
    ctx.fillText('27', 1310, 200);

    // Runway Centerline dashed stripes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 25]);
    ctx.beginPath();
    ctx.moveTo(420, 200);
    ctx.lineTo(1250, 200);
    ctx.stroke();
    ctx.setLineDash([]);

    // Touchdown zone double bars
    ctx.fillRect(480, 172, 50, 8);
    ctx.fillRect(480, 220, 50, 8);
    ctx.fillRect(1150, 172, 50, 8);
    ctx.fillRect(1150, 220, 50, 8);

    // Runway edge lights (white along edges, green threshold, red end)
    for (let rx = 200; rx <= 1480; rx += 45) {
      // North and south white lights
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(rx, 160, 2.5, 0, Math.PI * 2);
      ctx.arc(rx, 240, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Green threshold lights at 200
    ctx.fillStyle = '#22c55e';
    for (let ry = 165; ry <= 235; ry += 12) {
      ctx.beginPath();
      ctx.arc(202, ry, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red rollout lights at 1480
    ctx.fillStyle = '#ef4444';
    for (let ry = 165; ry <= 235; ry += 12) {
      ctx.beginPath();
      ctx.arc(1478, ry, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallel Taxiway Bravo (y: 360 to 400, height 40px)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(220, 360, 1240, 40);

    // High-speed exit taxiway links from runway to taxiway
    ctx.fillRect(360, 240, 40, 120);
    ctx.fillRect(800, 240, 40, 120);
    ctx.fillRect(1320, 240, 40, 120);

    // Yellow taxiway centerlines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(220, 380);
    ctx.lineTo(1460, 380);
    ctx.moveTo(380, 240);
    ctx.lineTo(380, 380);
    ctx.moveTo(820, 240);
    ctx.lineTo(820, 380);
    ctx.moveTo(1340, 240);
    ctx.lineTo(1340, 380);
    ctx.stroke();

    // Taxiway blue edge lights
    for (let tx = 220; tx <= 1460; tx += 40) {
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(tx, 360, 2, 0, Math.PI * 2);
      ctx.arc(tx, 400, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawApronAndGates(buildings: PlacedBuilding[]) {
    const ctx = this.ctx;
    const gatePositions = [
      { code: 'A1', x: 440, y: 560 },
      { code: 'A2', x: 680, y: 560 },
      { code: 'A3', x: 920, y: 560 },
      { code: 'A4', x: 1160, y: 560 },
    ];

    gatePositions.forEach((g) => {
      // Yellow lead-in curved centerline from taxiway down to gate
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(g.x, 380);
      ctx.lineTo(g.x, g.y);
      ctx.stroke();

      // Yellow stop bar
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(g.x - 30, g.y);
      ctx.lineTo(g.x + 30, g.y);
      ctx.stroke();

      // Red aircraft safety clearance box (hashed perimeter)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(g.x - 70, g.y - 70, 140, 130);
      ctx.setLineDash([]);

      // Aerobridge / Telescoping Jetway from Terminal (y: 660) to Aircraft Door (g.x - 22, g.y + 10)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(g.x - 32, 630, 20, 35);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(g.x - 30, 595, 16, 40);

      // Glass windows on jetway
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(g.x - 28, 605, 12, 18);

      // Gate sign badge (e.g. "A1")
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(g.x - 22, 625, 44, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.code, g.x, 636);
    });
  }

  private drawBuildings(buildings: PlacedBuilding[]) {
    const ctx = this.ctx;

    // 1. MAIN TERMINAL (x: 320 to 1280, y: 660 to 920)
    // Terminal outer glass shell & roof structure
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(320, 660, 960, 260);

    // Concourse polished terrazzo floor interior
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(326, 666, 948, 248);

    // Interior Glass Dividers & Gate Departure Lounges
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(340, 675, 920, 70); // airside gate concourse
    ctx.strokeRect(340, 760, 920, 55); // security & duty free
    ctx.strokeRect(340, 830, 920, 75); // check-in counters & landside

    // Check-in Desks (Counters along landside)
    for (let c = 0; c < 12; c++) {
      const cx = 360 + c * 75;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx, 845, 45, 14);
      // Desk monitor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 16, 840, 12, 5);
      // Desk agent dot
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx + 22, 856, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // TSA Security Scanners (metal detector archways & conveyor belts)
    for (let s = 0; s < 4; s++) {
      const sx = 640 + s * 90;
      // Conveyor X-ray box
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx, 775, 45, 20);
      // Metal detector archway
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 50, 772, 14, 26);
    }

    // Concourse shops / cafes / duty-free kiosks
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(380, 715, 80, 20); // Duty Free Perfumes
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(540, 715, 80, 20); // Coffee & Bakery
    ctx.fillStyle = '#059669';
    ctx.fillRect(720, 715, 80, 20); // Bookshop / Convenience
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(900, 715, 90, 20); // Business Lounge

    // Gate Waiting Area Blue Benches
    for (let b = 0; b < 4; b++) {
      const bx = 420 + b * 240;
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(bx - 30, 680, 60, 8);
      ctx.fillRect(bx - 30, 692, 60, 8);
    }

    // Signage: "DEPARTURES" and "ARRIVALS"
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(400, 672, 120, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✈ DEPARTURES', 460, 683);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(1080, 672, 110, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🛬 ARRIVALS', 1135, 683);

    // Glass Roof Trusses & Modern Skylight Grid
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    for (let x = 320; x <= 1280; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 660);
      ctx.lineTo(x, 920);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 2. ATC TOWER (x: 1340, y: 560)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(1340, 580, 34, 0, Math.PI * 2);
    ctx.fill();
    // Glass Cab on top
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(1340, 580, 26, 0, Math.PI * 2);
    ctx.fill();
    // Spinning Radar Antenna
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    const radarAngle = this.animFrameTime * 3;
    ctx.beginPath();
    ctx.moveTo(1340, 580);
    ctx.lineTo(1340 + Math.cos(radarAngle) * 32, 580 + Math.sin(radarAngle) * 32);
    ctx.stroke();

    // 3. MAINTENANCE HANGAR (x: 1320, y: 400)
    ctx.fillStyle = '#334155';
    ctx.fillRect(1320, 360, 180, 110);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(1320, 360, 180, 110);
    // Hangar label
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(1350, 365, 120, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MAINTENANCE', 1410, 376);

    // Small stationary aircraft inside hangar for realism
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(1395, 410, 30, 40);
    ctx.fillRect(1380, 430, 60, 10);

    // 4. HELIPAD (x: 1410, y: 580)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(1420, 580, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1420, 580, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('H', 1420, 581);

    // 5. JET-A1 FUEL DEPOT (x: 180, y: 420)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(180, 420, 130, 100);
    // 2 Large white fuel tanks
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(215, 465, 24, 0, Math.PI * 2);
    ctx.arc(275, 465, 24, 0, Math.PI * 2);
    ctx.fill();
    // Fuel tanks hazard yellow stripe
    ctx.fillStyle = '#eab308';
    ctx.fillRect(195, 462, 40, 6);
    ctx.fillRect(255, 462, 40, 6);
    // Fuel station badge
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(190, 425, 110, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FUEL STATION', 245, 435);

    // 6. AIRPORT HOTEL (x: 480, y: 1060)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(480, 1060, 170, 110);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(480, 1060, 170, 110);
    // Hotel windows
    for (let hx = 495; hx <= 630; hx += 20) {
      for (let hy = 1075; hy <= 1145; hy += 18) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hx, hy, 12, 10);
      }
    }
    // Hotel badge
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.roundRect(505, 1048, 120, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AIRPORT HOTEL', 565, 1059);

    // 7. CARGO TERMINAL (x: 1140, y: 1060)
    ctx.fillStyle = '#334155';
    ctx.fillRect(1140, 1060, 200, 110);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(1140, 1060, 200, 110);
    // Cargo loading docks
    for (let d = 0; d < 3; d++) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1160 + d * 60, 1145, 40, 25);
    }
    // Cargo badge
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(1170, 1048, 140, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CARGO TERMINAL', 1240, 1059);
  }

  private drawPassengers(passengers: PassengerEntity[]) {
    const ctx = this.ctx;
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#38bdf8'];

    passengers.forEach((p, idx) => {
      // Body dot
      ctx.fillStyle = colors[idx % colors.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Luggage bag dot trailing slightly
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x - 2, p.y + 2, 2.5, 2.5);
    });
  }

  private drawVehicles(vehicles: VehicleEntity[]) {
    const ctx = this.ctx;

    vehicles.forEach((v) => {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.rotation);

      if (v.type === 'fuel') {
        // Yellow fuel bowser truck
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(-16, -9, 32, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff'; // Tank cylinder
        ctx.beginPath();
        ctx.roundRect(-12, -7, 18, 14, 2);
        ctx.fill();
      } else if (v.type === 'baggage') {
        // Baggage tug + luggage carts
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-10, -6, 14, 12);
        // Cart 1 & 2
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, -5, 10, 10);
        ctx.fillRect(22, -5, 10, 10);
      } else if (v.type === 'catering') {
        // White catering truck with scissor lift box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -8, 28, 16);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(-6, -6, 16, 12);
      } else if (v.type === 'pushback') {
        // Low heavy pushback tug
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-12, -8, 24, 16);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-4, -6, 8, 12);
      } else if (v.type === 'bus') {
        // Airport transit bus
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(-24, -9, 48, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#bae6fd';
        for (let bx = -16; bx <= 16; bx += 8) {
          ctx.fillRect(bx, -7, 6, 4);
          ctx.fillRect(bx, 3, 6, 4);
        }
      } else {
        // Car or Yellow Taxi
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.roundRect(-14, -7, 28, 14, 4);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -5, 12, 10);
      }

      ctx.restore();
    });
  }

  private drawAircraft(aircraftList: AircraftEntity[], selectedEntityId: string | null) {
    const ctx = this.ctx;

    aircraftList.forEach((ac) => {
      ctx.save();
      ctx.translate(ac.x, ac.y);
      ctx.rotate(ac.rotation);
      ctx.scale(ac.scale, ac.scale);

      const isSelected = selectedEntityId === ac.flightId || selectedEntityId === ac.id;

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Aircraft shadow (shifts further away when high in the air)
      const shadowOffset = ac.altitude * 0.4 + 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      // Fuselage shadow
      ctx.ellipse(shadowOffset, shadowOffset, 36, 9, 0, 0, Math.PI * 2);
      // Wings shadow
      ctx.ellipse(shadowOffset, shadowOffset, 12, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Aircraft Body (Fuselage)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      // Nose cone facing east (0 radians)
      ctx.ellipse(0, 0, 38, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Airline Livery Tail & Accents
      ctx.fillStyle = ac.color;
      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(-44, -18);
      ctx.lineTo(-40, -18);
      ctx.lineTo(-24, 0);
      ctx.closePath();
      ctx.fill();

      // Horizontal Stabilizers
      ctx.fillStyle = ac.color;
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(-42, -18);
      ctx.lineTo(-38, -18);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-38, 18);
      ctx.lineTo(-42, 18);
      ctx.closePath();
      ctx.fill();

      // Main Wings (Swept-back)
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-18, -44);
      ctx.lineTo(-12, -44);
      ctx.lineTo(12, 0);
      ctx.lineTo(-12, 44);
      ctx.lineTo(-18, 44);
      ctx.closePath();
      ctx.fill();

      // Twin Jet Engines
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-4, -20, 14, 6, 2);
      ctx.roundRect(-4, 14, 14, 6, 2);
      ctx.fill();

      // Cockpit Windshield (Black glasses)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(24, -4);
      ctx.lineTo(30, 0);
      ctx.lineTo(24, 4);
      ctx.closePath();
      ctx.fill();

      // Wingtip Navigation Lights
      // Port wing (left = -44): Red
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-15, -44, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Starboard wing (right = +44): Green
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-15, 44, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Flashing White Wingtip Strobe (every 1 second)
      if (Math.floor(this.animFrameTime * 2) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-15, -44, 4, 0, Math.PI * 2);
        ctx.arc(-15, 44, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Red Beacon Light on top fuselage (flashing)
      if (Math.floor(this.animFrameTime * 3) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(4, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aircraft Label (Flight number)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ac.flightNumber, 0, 0);

      ctx.restore();
    });
  }

  private drawBuildPreview(preview: { x: number; y: number; width: number; height: number; name: string }) {
    const ctx = this.ctx;
    const px = preview.x * 40;
    const py = preview.y * 40;
    const pw = preview.width * 40;
    const ph = preview.height * 40;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(px, py, pw, ph);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(px, py, pw, ph);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+ Place: ${preview.name}`, px + pw / 2, py + ph / 2);
  }

  private drawAmbientLighting(timeString: string) {
    const ctx = this.ctx;
    const { ambientAlpha, ambientColor } = getAmbientLighting(timeString);

    if (ambientAlpha > 0) {
      ctx.fillStyle = ambientColor;
      ctx.globalAlpha = ambientAlpha;
      ctx.fillRect(-600, -400, 2800, 2000);
      ctx.globalAlpha = 1.0;
    }
  }

  private drawRain(drops: RainDrop[], isThunderstorm: boolean) {
    const ctx = this.ctx;

    // Thunderstorm lightning flash (brief white screen flash)
    if (isThunderstorm && Math.random() < 0.008) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(-600, -400, 2800, 2000);
    }

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    drops.forEach((d) => {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.length * 0.35, d.y + d.length);
    });
    ctx.stroke();
  }

  private drawFog() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.fillRect(-600, -400, 2800, 2000);
  }
}
