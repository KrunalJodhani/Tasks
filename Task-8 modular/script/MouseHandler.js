import RowResize from './RowResize.js';
import ColResize from './ColResize.js';
import RowSelection from './RowSelection.js';
import ColSelection from './ColSelection.js';
import CellSelection from './CellSelection.js';
import CursorMove from './CursorMove.js';
import ScrollMove from './ScrollMove.js';

/**
 * Handles mouse events and delegates them to the appropriate strategy
 */
export class MouseHandler {
    /**
     * @param {object} sheetManager
     */
    constructor(sheetManager) {
        this.sheet = sheetManager;

        this.strategies = [
            new ColResize(sheetManager),
            new RowResize(sheetManager),
            new ColSelection(sheetManager),
            new RowSelection(sheetManager),
            new CellSelection(sheetManager),
            new ScrollMove(sheetManager),
        ];

        this.cursorStrategy = new CursorMove(sheetManager);
        this.activeStrategy = null;

        this.attachEvents();
    }

    /**
     * Attaches mouse event listeners to the sheet's canvas and window
     */
    attachEvents() {
        this.sheet.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.sheet.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    }

    getMousePosition(e) {
    const rect = this.sheet.canvas.getBoundingClientRect();
    const dpr = this.sheet.dpr || window.devicePixelRatio || 1;

    return {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr
    };
}

/**
 * 
 * @param {PointerEvent} e 
 * @returns which strategy to use based on the pointer position
 */
    onPointerDown(e) {
        this.sheet.hideCellEditor();
        const pos = this.getMousePosition(e);

        for (const strategy of this.strategies) {
            if (strategy.hitTest(pos.x, pos.y)) {
                this.activeStrategy = strategy;
                if (strategy.onPointerDown) strategy.onPointerDown(e, pos.x, pos.y);
                return;
            }
        }
    }

     /**
      * 
      * @param {PointerEvent} e 
      */
    onPointerMove(e) {
        const pos = this.getMousePosition(e);

        if (this.activeStrategy && this.activeStrategy.onPointerMove) {
            this.activeStrategy.onPointerMove(e, pos.x, pos.y);
        } else {
            this.cursorStrategy.updateCursor(pos.x, pos.y);
        }
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    onPointerUp(e) {
        const pos = this.getMousePosition(e);

        if (this.activeStrategy && this.activeStrategy.onPointerUp) {
            this.activeStrategy.onPointerUp(e, pos.x, pos.y);
        }

        this.activeStrategy = null;
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    onDoubleClick(e) {
        const pos = this.getMousePosition(e);
        const cell = this.sheet.getCellFromPoint(pos.x, pos.y);
        if (cell) {
            this.sheet.showCellEditor(cell.row, cell.col);
        }
    }
}