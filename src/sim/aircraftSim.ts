import { AircraftEntity, AircraftState, Flight } from '../types';
import { soundManager } from '../audio/soundManager';

// Waypoint coordinates in Canvas world coordinates (grid 40px per tile)
// Runway center: y = 200 (x: 200 to 1480), heading 90 deg (facing east)
// Taxiway Bravo center: y = 380 (x: 240 to 1400)
// Gate A1 apron: x = 440, y = 560
// Gate A2 apron: x = 680, y = 560
// Gate A3 apron: x = 920, y = 560
// Gate A4 apron: x = 1160, y = 560
// Cargo C1 apron: x = 1200, y = 1060

export const GATE_COORDINATES: Record<string, { x: number; y: number; heading: number }> = {
  A1: { x: 440, y: 560, heading: 0 },
  A2: { x: 680, y: 560, heading: 0 },
  A3: { x: 920, y: 560, heading: 0 },
  A4: { x: 1160, y: 560, heading: 0 },
  C1: { x: 1200, y: 1060, heading: 0 },
};

export function createAircraftFromFlight(flight: Flight, initialState?: AircraftState): AircraftEntity {
  const gateCoord = GATE_COORDINATES[flight.gate] || GATE_COORDINATES.A1;
  const state: AircraftState = initialState || flight.currentStep || 'AT_GATE';

  let x = gateCoord.x;
  let y = gateCoord.y;
  let rotation = gateCoord.heading;
  let altitude = 0;
  let speed = 0;

  if (state === 'APPROACHING') {
    x = -200;
    y = 200;
    rotation = 0; // facing east
    altitude = 60;
    speed = 120;
  } else if (state === 'LANDING') {
    x = 300;
    y = 200;
    rotation = 0;
    altitude = 15;
    speed = 90;
  } else if (state === 'TAXIING') {
    x = 800;
    y = 380;
    rotation = 0;
    altitude = 0;
    speed = 30;
  }

  return {
    id: 'ac_' + flight.id,
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    color: flight.color,
    type: flight.aircraftType,
    state,
    x,
    y,
    targetX: x,
    targetY: y,
    rotation,
    speed,
    scale: flight.aircraftType === 'B787' || flight.aircraftType === 'B777F' ? 1.25 : 1.0,
    altitude,
    assignedGate: flight.gate,
    progressInState: state === 'BOARDING' ? 65 : state === 'REFUELING' ? 40 : 20,
    serviceProgress: {
      disembark: 100,
      cleaning: state === 'BOARDING' ? 100 : 70,
      refuel: state === 'BOARDING' ? 100 : 50,
      catering: state === 'BOARDING' ? 100 : 40,
      boarding: state === 'BOARDING' ? 65 : 0,
    },
  };
}

export function updateAircraft(
  aircraftList: AircraftEntity[],
  flights: Flight[],
  dt: number,
  simSpeed: number,
  onFlightStepChange?: (flightId: string, newState: AircraftState, message?: string) => void
): { updatedAircraft: AircraftEntity[]; updatedFlights: Flight[] } {
  if (simSpeed === 0) return { updatedAircraft: aircraftList, updatedFlights: flights };

  const effectiveDt = dt * simSpeed;
  const updatedAircraft = [...aircraftList];
  const updatedFlights = [...flights];

  for (let i = 0; i < updatedAircraft.length; i++) {
    const ac = { ...updatedAircraft[i] };
    const flightIdx = updatedFlights.findIndex((f) => f.id === ac.flightId);
    const gateCoord = GATE_COORDINATES[ac.assignedGate] || GATE_COORDINATES.A1;

    switch (ac.state) {
      case 'APPROACHING': {
        ac.speed = 140;
        ac.x += (ac.speed * effectiveDt);
        ac.altitude = Math.max(10, ac.altitude - (15 * effectiveDt));
        ac.rotation = 0; // heading east

        if (ac.x >= 280) {
          ac.state = 'LANDING';
          soundManager.playJetLanding();
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'Arriving',
              currentStep: 'LANDING',
            };
            onFlightStepChange?.(ac.flightId, 'LANDING', `Flight ${ac.flightNumber} touched down on Runway 27`);
          }
        }
        break;
      }

      case 'LANDING': {
        // Roll out on runway and decelerate
        ac.speed = Math.max(25, ac.speed - (28 * effectiveDt));
        ac.x += (ac.speed * effectiveDt);
        ac.altitude = 0;

        if (ac.x >= 850) {
          // Exit onto taxiway Bravo
          ac.state = 'TAXIING';
          ac.targetX = gateCoord.x;
          ac.targetY = 380;
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'On time',
              currentStep: 'TAXIING',
            };
            onFlightStepChange?.(ac.flightId, 'TAXIING', `Flight ${ac.flightNumber} taxiing via Taxiway Bravo to Gate ${ac.assignedGate}`);
          }
        }
        break;
      }

      case 'TAXIING': {
        ac.speed = 30;
        // Move towards gate turnoff
        const targetTurnX = gateCoord.x;
        if (Math.abs(ac.x - targetTurnX) > 8) {
          ac.y = 380;
          if (ac.x < targetTurnX) {
            ac.x += ac.speed * effectiveDt;
            ac.rotation = 0;
          } else {
            ac.x -= ac.speed * effectiveDt;
            ac.rotation = Math.PI;
          }
        } else {
          // Turn south into gate apron
          ac.x = targetTurnX;
          ac.rotation = Math.PI / 2; // South
          ac.y += ac.speed * effectiveDt;

          if (ac.y >= gateCoord.y) {
            ac.y = gateCoord.y;
            ac.rotation = 0; // Park facing north
            ac.state = 'AT_GATE';
            ac.progressInState = 0;
            ac.serviceProgress = { disembark: 0, cleaning: 0, refuel: 0, catering: 0, boarding: 0 };
            if (flightIdx >= 0) {
              updatedFlights[flightIdx] = {
                ...updatedFlights[flightIdx],
                status: 'On time',
                currentStep: 'AT_GATE',
              };
              onFlightStepChange?.(ac.flightId, 'AT_GATE', `Flight ${ac.flightNumber} parked at Gate ${ac.assignedGate}. Passenger bridge connected.`);
            }
          }
        }
        break;
      }

      case 'AT_GATE':
      case 'DISEMBARKING': {
        // Disembarking progress
        ac.progressInState = Math.min(100, ac.progressInState + 12 * effectiveDt);
        ac.serviceProgress.disembark = ac.progressInState;
        if (ac.progressInState >= 100) {
          ac.state = 'REFUELING';
          ac.progressInState = 0;
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              currentStep: 'REFUELING',
            };
          }
        }
        break;
      }

      case 'REFUELING':
      case 'CLEANING':
      case 'CATERING': {
        // Ground servicing in progress simultaneously
        ac.serviceProgress.refuel = Math.min(100, ac.serviceProgress.refuel + 10 * effectiveDt);
        ac.serviceProgress.cleaning = Math.min(100, ac.serviceProgress.cleaning + 14 * effectiveDt);
        ac.serviceProgress.catering = Math.min(100, ac.serviceProgress.catering + 12 * effectiveDt);
        ac.progressInState = (ac.serviceProgress.refuel + ac.serviceProgress.cleaning + ac.serviceProgress.catering) / 3;

        if (ac.serviceProgress.refuel >= 100 && ac.serviceProgress.cleaning >= 100 && ac.serviceProgress.catering >= 100) {
          ac.state = 'BOARDING';
          ac.progressInState = 0;
          soundManager.playChime();
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'Boarding',
              currentStep: 'BOARDING',
            };
            onFlightStepChange?.(ac.flightId, 'BOARDING', `Flight ${ac.flightNumber} is now boarding at Gate ${ac.assignedGate}`);
          }
        }
        break;
      }

      case 'BOARDING': {
        ac.serviceProgress.boarding = Math.min(100, ac.serviceProgress.boarding + 8 * effectiveDt);
        ac.progressInState = ac.serviceProgress.boarding;

        if (ac.serviceProgress.boarding >= 100) {
          ac.state = 'READY';
          ac.progressInState = 0;
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'Departing',
              currentStep: 'READY',
            };
          }
        }
        break;
      }

      case 'READY': {
        // Ready for pushback tug
        ac.state = 'PUSHBACK';
        ac.progressInState = 0;
        if (flightIdx >= 0) {
          updatedFlights[flightIdx] = {
            ...updatedFlights[flightIdx],
            currentStep: 'PUSHBACK',
          };
          onFlightStepChange?.(ac.flightId, 'PUSHBACK', `Pushback tug attached to Flight ${ac.flightNumber}`);
        }
        break;
      }

      case 'PUSHBACK': {
        // Push backwards out of gate onto taxiway
        ac.speed = 12;
        ac.y -= ac.speed * effectiveDt;
        ac.rotation = Math.PI / 2; // Facing down while pushing back

        if (ac.y <= 380) {
          ac.y = 380;
          ac.rotation = 0;
          ac.state = 'TAXI_TO_RUNWAY';
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              currentStep: 'TAXI_TO_RUNWAY',
            };
            onFlightStepChange?.(ac.flightId, 'TAXI_TO_RUNWAY', `Flight ${ac.flightNumber} taxiing to Runway 27 threshold`);
          }
        }
        break;
      }

      case 'TAXI_TO_RUNWAY': {
        ac.speed = 28;
        // Taxi towards runway threshold on left (x = 240)
        if (ac.x > 240) {
          ac.x -= ac.speed * effectiveDt;
          ac.rotation = Math.PI; // heading west
        } else {
          // Line up on runway
          ac.x = 240;
          ac.y = 200;
          ac.rotation = 0; // Heading east for takeoff
          ac.state = 'TAKING_OFF';
          ac.speed = 30;
          soundManager.playJetTakeoff();
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'Departing',
              currentStep: 'TAKING_OFF',
            };
            onFlightStepChange?.(ac.flightId, 'TAKING_OFF', `Flight ${ac.flightNumber} cleared for takeoff Runway 27`);
          }
        }
        break;
      }

      case 'TAKING_OFF': {
        // Accelerate down runway
        ac.speed += 45 * effectiveDt;
        ac.x += ac.speed * effectiveDt;

        if (ac.x >= 700) {
          // Rotate and climb
          ac.altitude += 22 * effectiveDt;
        }

        if (ac.x >= 1650) {
          ac.state = 'DEPARTED';
          soundManager.playCash();
          if (flightIdx >= 0) {
            updatedFlights[flightIdx] = {
              ...updatedFlights[flightIdx],
              status: 'Departed',
              currentStep: 'DEPARTED',
            };
            onFlightStepChange?.(ac.flightId, 'DEPARTED', `Flight ${ac.flightNumber} departed on schedule. Revenue collected.`);
          }
          // Reset this flight or turnaround to schedule after 15 seconds
          ac.state = 'APPROACHING';
          ac.x = -350;
          ac.y = 200;
          ac.altitude = 70;
          ac.progressInState = 0;
          ac.serviceProgress = { disembark: 0, cleaning: 0, refuel: 0, catering: 0, boarding: 0 };
        }
        break;
      }
    }

    updatedAircraft[i] = ac;
  }

  return { updatedAircraft, updatedFlights };
}
