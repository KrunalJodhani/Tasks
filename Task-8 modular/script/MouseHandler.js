// MouseHandler.js

import { MouseDownHandler } from './MouseDownHandler.js';
import { MouseMoveHandler } from './MouseMoveHandler.js';
import { MouseUpHandler } from './MouseUpHandler.js';
import { DoubleClickHandler } from './DoubleClickHandler.js';
import { CursorManager } from './CursorManager.js';

export class MouseHandler {
    constructor(sheet) {
        this.sheet = sheet;
        this.canvas = sheet.canvas;

        // Initialize individual handlers
        this.cursorManager = new CursorManager(sheet);
        this.mouseDownHandler = new MouseDownHandler(sheet);
        this.mouseMoveHandler = new MouseMoveHandler(sheet, this.cursorManager);
        this.mouseUpHandler = new MouseUpHandler(sheet);
        this.doubleClickHandler = new DoubleClickHandler(sheet);

        this.init();
    }

    init() {
        this.canvas.addEventListener('pointerdown', this.mouseDownHandler.handleMouseDown);
        window.addEventListener('pointermove', this.mouseMoveHandler.handleMouseMove);
        window.addEventListener('pointerup', this.mouseUpHandler.handleMouseUp);
        this.canvas.addEventListener('dblclick', this.doubleClickHandler.handleDoubleClick);
    }
}
