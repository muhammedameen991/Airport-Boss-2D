import { VehicleEntity } from '../types';

export function createInitialVehicles(): VehicleEntity[] {
  return [
    // Ground service vehicles
    {
      id: 'v_fuel_1',
      type: 'fuel',
      x: 220,
      y: 460,
      targetX: 470,
      targetY: 570,
      rotation: 0,
      speed: 35,
      assignedGate: 'A1',
      state: 'servicing',
      progress: 60,
    },
    {
      id: 'v_baggage_1',
      type: 'baggage',
      x: 410,
      y: 575,
      targetX: 410,
      targetY: 575,
      rotation: 0,
      speed: 30,
      assignedGate: 'A1',
      state: 'servicing',
      progress: 80,
    },
    {
      id: 'v_catering_1',
      type: 'catering',
      x: 650,
      y: 575,
      targetX: 650,
      targetY: 575,
      rotation: 0,
      speed: 25,
      assignedGate: 'A2',
      state: 'servicing',
      progress: 45,
    },
    {
      id: 'v_pushback_1',
      type: 'pushback',
      x: 680,
      y: 540,
      targetX: 680,
      targetY: 540,
      rotation: 0,
      speed: 20,
      assignedGate: 'A2',
      state: 'idle',
      progress: 0,
    },
    {
      id: 'v_bus_apron',
      type: 'bus',
      x: 520,
      y: 470,
      targetX: 880,
      targetY: 470,
      rotation: 0,
      speed: 32,
      state: 'idle',
      progress: 0,
    },
    // Curbside traffic
    {
      id: 'v_car_1',
      type: 'car',
      x: 350,
      y: 980,
      targetX: 1100,
      targetY: 980,
      rotation: 0,
      speed: 40,
      state: 'idle',
      progress: 0,
    },
    {
      id: 'v_car_2',
      type: 'car',
      x: 750,
      y: 1010,
      targetX: 250,
      targetY: 1010,
      rotation: Math.PI,
      speed: 35,
      state: 'idle',
      progress: 0,
    },
    {
      id: 'v_bus_city',
      type: 'bus',
      x: 580,
      y: 975,
      targetX: 1050,
      targetY: 975,
      rotation: 0,
      speed: 30,
      state: 'idle',
      progress: 0,
    },
  ];
}

export function updateVehicles(
  vehicles: VehicleEntity[],
  dt: number,
  simSpeed: number
): VehicleEntity[] {
  if (simSpeed === 0) return vehicles;
  const effectiveDt = dt * simSpeed;

  return vehicles.map((v) => {
    const updated = { ...v };

    // Simple patrol / movement logic
    if (v.type === 'car' || v.type === 'bus') {
      const dx = updated.targetX - updated.x;
      if (Math.abs(dx) > 4) {
        const step = Math.sign(dx) * updated.speed * effectiveDt;
        updated.x += step;
        updated.rotation = dx > 0 ? 0 : Math.PI;
      } else {
        // Reverse direction on perimeter road
        if (updated.y > 900) {
          updated.targetX = updated.targetX > 600 ? 250 : 1150;
        } else {
          // Apron bus
          updated.targetX = updated.targetX > 600 ? 400 : 980;
        }
      }
    } else if (v.type === 'fuel' || v.type === 'baggage' || v.type === 'catering') {
      // Small vibration or idle animation when servicing
      updated.progress = (updated.progress + 15 * effectiveDt) % 100;
    }

    return updated;
  });
}
