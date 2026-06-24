import './style.css';
import { Game } from './Game';
const canvas = document.getElementById('gameCanvas');
if (!canvas)
    throw new Error('Canvas not found');
const game = new Game(canvas);
game.start();
