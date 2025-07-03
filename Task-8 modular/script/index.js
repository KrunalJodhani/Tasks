import { SheetManager } from './sheetManager.js';

const grid = new SheetManager('grid-canvas', 100000, 500);
document.addEventListener('DOMContentLoaded', () => grid.canvas.focus());
