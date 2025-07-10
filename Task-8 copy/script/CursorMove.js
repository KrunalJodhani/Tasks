import { SheetManager } from "./sheetManager.js";

export default class CursorMove {
    /**
     * @param {SheetManager} sheet 
     */
    constructor(sheet) {
        this.sheet = sheet;
    }

    /**
     * Update the cursor style based on the pointer position.
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    updateCursor(x, y) {
        const resizeInfo = this.sheet.getResizeInfo(x, y);
        const scrollbarInfo = this.sheet.getScrollbarInfo(x, y);

        if (resizeInfo) {
            this.sheet.canvas.style.cursor = resizeInfo.type === 'col' ? 'ew-resize' : 'ns-resize';
        } else if (scrollbarInfo) {
            this.sheet.canvas.style.cursor = 'pointer';
        } else {
            this.sheet.canvas.style.cursor = 'cell';
        }
    }
}
