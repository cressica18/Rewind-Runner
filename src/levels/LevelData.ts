import { Platform } from '../entities/Platform';
import { Hazard } from '../entities/Hazard';
import { Collectible, Switch, Door, Portal, Checkpoint } from '../entities/Interactables';

export interface LevelConfig {
  name: string;
  subtitle: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  platforms: Platform[];
  hazards: Hazard[];
  collectibles: Collectible[];
  switches: Switch[];
  doors: Door[];
  portal: Portal;
  checkpoints: Checkpoint[];
  bgStyle: 'city' | 'factory' | 'void' | 'ruins';
  firePositions: { x: number; y: number }[];
}

export function buildLevel1(): LevelConfig {
  // Level 1: Tutorial - "The First Step Back"
  const platforms: Platform[] = [
    // Ground
    new Platform(0, 680, 800, 40, 'solid'),
    new Platform(860, 680, 400, 40, 'solid'),
    new Platform(1320, 680, 300, 40, 'solid'),
    new Platform(1700, 680, 600, 40, 'solid'),
    new Platform(2400, 680, 300, 40, 'solid'),
    new Platform(2760, 680, 600, 40, 'solid'),
    // Steps
    new Platform(400, 580, 120, 24, 'solid'),
    new Platform(560, 480, 120, 24, 'solid'),
    // Crumbling intro
    new Platform(720, 580, 100, 24, 'crumbling'),
    new Platform(860, 500, 120, 24, 'solid'),
    // Moving platform intro
    new Platform(1060, 540, 100, 24, 'moving', { moveAxis: 'x', moveRange: 80, moveSpeed: 60 }),
    // Gap with solid land
    new Platform(1320, 500, 160, 24, 'solid'),
    // Rewind-only platform intro
    new Platform(1560, 480, 100, 24, 'rewind_only'),
    new Platform(1700, 500, 160, 24, 'solid'),
    // Checkpoint area
    new Platform(1900, 560, 200, 24, 'solid'),
    // Moving platforms section
    new Platform(2160, 500, 80, 24, 'moving', { moveAxis: 'y', moveRange: 100, moveSpeed: 70 }),
    new Platform(2320, 440, 80, 24, 'moving', { moveAxis: 'x', moveRange: 60, moveSpeed: 80 }),
    // Spikes section
    new Platform(2400, 640, 160, 40, 'spike', { spikeCount: 8 }),
    new Platform(2600, 640, 100, 40, 'spike', { spikeCount: 5 }),
    // Final approach
    new Platform(2760, 520, 200, 24, 'solid'),
    new Platform(2980, 460, 160, 24, 'crumbling'),
    new Platform(3160, 500, 240, 24, 'solid'),
  ];

  const switches: Switch[] = [
    new Switch(1180, 656, 'door1', 3),
  ];
  const doors: Door[] = [
    new Door(1280, 580, 32, 100, 'door1'),
  ];

  const hazards: Hazard[] = [
    new Hazard(970, 672, 'blade', { w: 40, h: 40, amplitude: 0, frequency: 0 }),
    new Hazard(2060, 640, 'blade', { w: 36, h: 36, amplitude: 50, frequency: 1.5, phase: 0 }),
    new Hazard(2220, 630, 'blade', { w: 36, h: 36, amplitude: 50, frequency: 1.5, phase: Math.PI }),
  ];

  const collectibles: Collectible[] = [
    new Collectible(450, 550),
    new Collectible(610, 450),
    new Collectible(910, 470),
    new Collectible(1380, 470),
    new Collectible(1760, 470),
    new Collectible(2800, 490),
    new Collectible(3220, 470),
    new Collectible(1590, 450, true), // Star secret
  ];

  const checkpoints: Checkpoint[] = [
    new Checkpoint(1960, 580, 0),
    new Checkpoint(2780, 540, 1),
  ];

  return {
    name: 'Level 1',
    subtitle: 'The First Step Back',
    width: 3600,
    height: 720,
    playerStart: { x: 80, y: 620 },
    platforms, hazards, collectibles, switches, doors,
    portal: new Portal(3340, 500),
    checkpoints,
    bgStyle: 'city',
    firePositions: [{ x: 820, y: 668 }, { x: 1660, y: 668 }],
  };
}

export function buildLevel2(): LevelConfig {
  const platforms: Platform[] = [
    new Platform(0, 680, 500, 40, 'solid'),
    new Platform(560, 680, 200, 40, 'solid'),
    new Platform(820, 620, 120, 24, 'crumbling'),
    new Platform(1000, 560, 120, 24, 'crumbling'),
    new Platform(1180, 500, 100, 24, 'crumbling'),
    new Platform(1340, 520, 160, 24, 'solid'),
    new Platform(1560, 480, 80, 24, 'moving', { moveAxis: 'x', moveRange: 120, moveSpeed: 90 }),
    new Platform(1760, 520, 140, 24, 'solid'),
    new Platform(1960, 460, 80, 24, 'moving', { moveAxis: 'y', moveRange: 140, moveSpeed: 100 }),
    new Platform(2100, 400, 200, 24, 'solid'),
    new Platform(2360, 380, 80, 24, 'rewind_only'),
    new Platform(2500, 360, 80, 24, 'rewind_only'),
    new Platform(2640, 380, 80, 24, 'rewind_only'),
    new Platform(2800, 400, 200, 24, 'solid'),
    new Platform(3060, 440, 120, 24, 'bouncy'),
    new Platform(3100, 220, 200, 24, 'solid'),
    new Platform(3360, 260, 160, 24, 'solid'),
    new Platform(3580, 300, 120, 24, 'crumbling'),
    new Platform(3760, 340, 300, 24, 'solid'),
    new Platform(0, 660, 60, 60, 'spike', { spikeCount: 3 }),
    new Platform(500, 660, 60, 60, 'spike', { spikeCount: 3 }),
    new Platform(760, 660, 60, 60, 'spike', { spikeCount: 3 }),
  ];

  const switches: Switch[] = [
    new Switch(2140, 376, 'door2a', 4),
    new Switch(1400, 496, 'door2b', 0),
  ];
  const doors: Door[] = [
    new Door(2320, 280, 32, 120, 'door2a'),
    new Door(1520, 380, 32, 140, 'door2b'),
  ];

  const hazards: Hazard[] = [
    new Hazard(660, 680, 'blade', { w: 40, h: 40, amplitude: 60, frequency: 1.2 }),
    new Hazard(910, 580, 'blade', { w: 36, h: 36, amplitude: 0 }),
    new Hazard(1800, 640, 'blade', { w: 40, h: 40, amplitude: 100, frequency: 0.8 }),
    new Hazard(2900, 640, 'blade', { w: 40, h: 40, amplitude: 80, frequency: 1.0 }),
    new Hazard(3200, 200, 'laser', { laserLength: 300 }),
  ];

  const collectibles: Collectible[] = [
    new Collectible(580, 650), new Collectible(870, 590),
    new Collectible(1200, 470), new Collectible(1400, 490),
    new Collectible(1800, 490), new Collectible(2150, 370),
    new Collectible(2840, 370), new Collectible(3140, 190),
    new Collectible(3800, 310),
    new Collectible(2500, 330, true), // rewind-only secret
    new Collectible(3420, 230, true),
  ];

  const checkpoints: Checkpoint[] = [
    new Checkpoint(1400, 540, 0),
    new Checkpoint(2840, 420, 1),
  ];

  return {
    name: 'Level 2',
    subtitle: 'The Cascade',
    width: 4200,
    height: 720,
    playerStart: { x: 80, y: 620 },
    platforms, hazards, collectibles, switches, doors,
    portal: new Portal(3940, 300),
    checkpoints,
    bgStyle: 'factory',
    firePositions: [{ x: 200, y: 668 }, { x: 700, y: 668 }, { x: 1200, y: 668 }],
  };
}

export function buildLevel3(): LevelConfig {
  const platforms: Platform[] = [
    new Platform(0, 680, 300, 40, 'solid'),
    new Platform(360, 640, 80, 24, 'crumbling'),
    new Platform(500, 580, 80, 24, 'crumbling'),
    new Platform(640, 520, 80, 24, 'crumbling'),
    new Platform(780, 460, 80, 24, 'moving', { moveAxis: 'y', moveRange: 80, moveSpeed: 110 }),
    new Platform(940, 500, 160, 24, 'solid'),
    new Platform(1160, 500, 80, 24, 'rewind_only'),
    new Platform(1300, 500, 80, 24, 'rewind_only'),
    new Platform(1440, 500, 80, 24, 'rewind_only'),
    new Platform(1600, 520, 200, 24, 'solid'),
    new Platform(1860, 480, 80, 24, 'bouncy'),
    new Platform(2000, 260, 200, 24, 'solid'),
    new Platform(2260, 300, 80, 24, 'moving', { moveAxis: 'x', moveRange: 100, moveSpeed: 100 }),
    new Platform(2440, 340, 120, 24, 'solid'),
    new Platform(2620, 380, 80, 24, 'crumbling'),
    new Platform(2760, 420, 80, 24, 'crumbling'),
    new Platform(2900, 380, 160, 24, 'solid'),
    new Platform(3100, 340, 80, 24, 'rewind_only'),
    new Platform(3240, 300, 80, 24, 'rewind_only'),
    new Platform(3380, 260, 80, 24, 'rewind_only'),
    new Platform(3520, 280, 200, 24, 'solid'),
    new Platform(3780, 320, 160, 24, 'moving', { moveAxis: 'y', moveRange: 120, moveSpeed: 120 }),
    new Platform(3980, 360, 300, 24, 'solid'),
    // Spike hazards
    new Platform(300, 660, 60, 60, 'spike', { spikeCount: 3 }),
    new Platform(680, 660, 80, 60, 'spike', { spikeCount: 4 }),
  ];

  const switches: Switch[] = [
    new Switch(980, 476, 'door3a', 5),
    new Switch(2040, 236, 'door3b', 0),
    new Switch(2960, 356, 'door3c', 4),
  ];
  const doors: Door[] = [
    new Door(1100, 380, 32, 140, 'door3a'),
    new Door(2200, 160, 32, 160, 'door3b'),
    new Door(3060, 220, 32, 160, 'door3c'),
  ];

  const hazards: Hazard[] = [
    new Hazard(450, 640, 'blade', { w: 36, h: 36, amplitude: 40, frequency: 2 }),
    new Hazard(870, 460, 'blade', { w: 40, h: 40, amplitude: 60, frequency: 1.5, phase: 1 }),
    new Hazard(1700, 540, 'blade', { w: 44, h: 44, amplitude: 80, frequency: 1.2 }),
    new Hazard(2350, 300, 'blade', { w: 40, h: 40, amplitude: 60, frequency: 2, phase: 1 }),
    new Hazard(2000, 300, 'laser', { laserLength: 200 }),
    new Hazard(3550, 280, 'laser', { laserLength: 250 }),
    new Hazard(3200, 640, 'blade', { w: 48, h: 48, amplitude: 120, frequency: 1 }),
    new Hazard(3700, 640, 'blade', { w: 48, h: 48, amplitude: 100, frequency: 1.3, phase: 0.5 }),
  ];

  const collectibles: Collectible[] = [
    new Collectible(400, 610), new Collectible(540, 550), new Collectible(680, 490),
    new Collectible(980, 470), new Collectible(1640, 490), new Collectible(2040, 230),
    new Collectible(2480, 310), new Collectible(2940, 350), new Collectible(3560, 250),
    new Collectible(4020, 330),
    new Collectible(1300, 470, true), new Collectible(3380, 230, true),
  ];

  const checkpoints: Checkpoint[] = [
    new Checkpoint(1640, 540, 0),
    new Checkpoint(2940, 400, 1),
    new Checkpoint(3560, 300, 2),
  ];

  return {
    name: 'Level 3',
    subtitle: 'The Fracture',
    width: 4600,
    height: 720,
    playerStart: { x: 60, y: 620 },
    platforms, hazards, collectibles, switches, doors,
    portal: new Portal(4220, 320),
    checkpoints,
    bgStyle: 'void',
    firePositions: [{ x: 100, y: 668 }, { x: 940, y: 668 }, { x: 2450, y: 668 }, { x: 3600, y: 668 }],
  };
}

export const LEVEL_BUILDERS = [buildLevel1, buildLevel2, buildLevel3];
