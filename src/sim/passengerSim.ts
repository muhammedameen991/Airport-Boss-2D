import { PassengerEntity } from '../types';

const FIRST_NAMES = ['Aarav', 'Priya', 'Rahul', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Meera', 'Arjun', 'Divya', 'Karan', 'Pooja', 'Siddharth', 'Aditi', 'Nikhil', 'Tanvi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Menon', 'Nair', 'Iyer', 'Reddy', 'Gupta', 'Singh', 'Kapoor', 'Rao', 'Das', 'Chatterjee', 'Joshi'];

// Concourse bounds in world coordinates (Terminal 1)
// Terminal is roughly x: 320 to 1280, y: 680 to 920
// Curbside Entrance: y = 920, x between 400 and 1100
// Check-in counters: y = 840, x: 420 to 700
// Security scanners: y = 780, x: 720 to 900
// Duty-Free / Concourse: y: 730, x: 400 to 1180
// Gates:
// A1: x: 440, y: 680
// A2: x: 680, y: 680
// A3: x: 920, y: 680
// A4: x: 1160, y: 680

export function createInitialPassengers(count: number = 80): PassengerEntity[] {
  const passengers: PassengerEntity[] = [];
  const gates = ['A1', 'A2', 'A3', 'A4'];

  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const assignedGate = gates[Math.floor(Math.random() * gates.length)];
    const stages: PassengerEntity['stage'][] = ['entrance', 'checkin', 'security', 'commercial', 'gate'];
    const stage = stages[Math.floor(Math.random() * stages.length)];

    let x = 400 + Math.random() * 700;
    let y = 700 + Math.random() * 200;

    if (stage === 'checkin') {
      x = 420 + Math.random() * 260;
      y = 820 + Math.random() * 30;
    } else if (stage === 'security') {
      x = 720 + Math.random() * 180;
      y = 770 + Math.random() * 25;
    } else if (stage === 'commercial') {
      x = 500 + Math.random() * 400;
      y = 725 + Math.random() * 30;
    } else if (stage === 'gate') {
      const gX = assignedGate === 'A1' ? 440 : assignedGate === 'A2' ? 680 : assignedGate === 'A3' ? 920 : 1160;
      x = gX - 40 + Math.random() * 80;
      y = 670 + Math.random() * 40;
    }

    passengers.push({
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name: `${fn} ${ln}`,
      flightNumber: assignedGate === 'A1' ? 'AI102' : assignedGate === 'A2' ? 'SG204' : assignedGate === 'A3' ? '6E318' : 'UK721',
      stage,
      x,
      y,
      targetX: x,
      targetY: y,
      speed: 15 + Math.random() * 10,
      happiness: 75 + Math.floor(Math.random() * 25),
      patience: 100,
      spentMoney: 0,
      assignedGate,
    });
  }

  return passengers;
}

export function updatePassengers(
  passengers: PassengerEntity[],
  dt: number,
  simSpeed: number,
  boardingGates: Set<string>
): PassengerEntity[] {
  if (simSpeed === 0) return passengers;
  const effectiveDt = dt * simSpeed;

  return passengers.map((p) => {
    const updated = { ...p };

    // Move smoothly towards target
    const dx = updated.targetX - updated.x;
    const dy = updated.targetY - updated.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      const move = Math.min(dist, updated.speed * effectiveDt);
      updated.x += (dx / dist) * move;
      updated.y += (dy / dist) * move;
    } else {
      // Reached target, pick next step or wander slightly
      if (updated.stage === 'entrance') {
        updated.stage = 'checkin';
        updated.targetX = 430 + Math.random() * 240;
        updated.targetY = 825 + Math.random() * 20;
      } else if (updated.stage === 'checkin') {
        if (Math.random() < 0.04 * simSpeed) {
          updated.stage = 'security';
          updated.targetX = 720 + Math.random() * 160;
          updated.targetY = 775 + Math.random() * 15;
        }
      } else if (updated.stage === 'security') {
        if (Math.random() < 0.04 * simSpeed) {
          updated.stage = 'commercial';
          updated.targetX = 520 + Math.random() * 380;
          updated.targetY = 720 + Math.random() * 25;
          updated.spentMoney += Math.floor(15 + Math.random() * 60);
        }
      } else if (updated.stage === 'commercial') {
        if (Math.random() < 0.03 * simSpeed) {
          updated.stage = 'gate';
          const gX = updated.assignedGate === 'A1' ? 440 : updated.assignedGate === 'A2' ? 680 : updated.assignedGate === 'A3' ? 920 : 1160;
          updated.targetX = gX - 30 + Math.random() * 60;
          updated.targetY = 670 + Math.random() * 30;
        } else {
          // Wander near shops
          updated.targetX = 520 + Math.random() * 380;
          updated.targetY = 720 + Math.random() * 25;
        }
      } else if (updated.stage === 'gate') {
        if (boardingGates.has(updated.assignedGate)) {
          updated.stage = 'boarding';
          const gX = updated.assignedGate === 'A1' ? 440 : updated.assignedGate === 'A2' ? 680 : updated.assignedGate === 'A3' ? 920 : 1160;
          updated.targetX = gX;
          updated.targetY = 630; // into jetway bridge
        } else {
          // Sit or wander in gate seating area
          const gX = updated.assignedGate === 'A1' ? 440 : updated.assignedGate === 'A2' ? 680 : updated.assignedGate === 'A3' ? 920 : 1160;
          updated.targetX = gX - 35 + Math.random() * 70;
          updated.targetY = 665 + Math.random() * 25;
        }
      } else if (updated.stage === 'boarding') {
        // Disappear onboard, recycle into new arriving passenger
        updated.stage = 'entrance';
        updated.x = 420 + Math.random() * 600;
        updated.y = 920;
        updated.targetX = updated.x;
        updated.targetY = 890;
        updated.happiness = 85 + Math.floor(Math.random() * 15);
      }
    }

    return updated;
  });
}
