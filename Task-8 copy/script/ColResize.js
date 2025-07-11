import { SheetManager } from "./sheetManager.js";


export default class ColResize {

    /**
     * @param {SheetManager} sheet
     */
    constructor(sheet) {
        this.sheet = sheet;
        this.active = false;
    }

    /**
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     * @returns {Boolean} returns true if the pointer is over the column resize area
     */
    hitTest(x, y) {
        const dpr = this.sheet.dpr || window.devicePixelRatio || 1;
        if (y > this.sheet.headerHeight * dpr) return false;

        let currentX = (this.sheet.headerWidth - this.sheet.scrollX) * dpr;
        const tolerance = 5 * dpr; // Scale tolerance with DPR

        for (let col = 0; col < this.sheet.cellData.cols; col++) {
            const width = this.sheet.cellData.getColWidth(col) * dpr;
            currentX += width;
            if (Math.abs(x - currentX) <= tolerance) {
                this.targetCol = col;
                return true;
            }
        }

        return false;
    }

    /**
     * @param {PointerEvent} e
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerDown(e, x, y) {
        this.active = true;
        this.startX = x;
        this.initialWidth = this.sheet.cellData.getColWidth(this.targetCol);
    }

    /**
     * @param {PointerEvent} e
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerMove(e, x, y) {
        if (!this.active) return;

        const dpr = this.sheet.dpr || window.devicePixelRatio || 1;
        const delta = (x - this.startX) / dpr;
        const newWidth = Math.max(30, this.initialWidth + delta);
        this.sheet.cellData.setColWidth(this.targetCol, newWidth);
        this.sheet.render();
    }

    /**
     * This method is called when the pointer is released.
     */
    onPointerUp() {
        if (!this.active) return;

        const finalWidth = this.sheet.cellData.getColWidth(this.targetCol);
        if (finalWidth !== this.initialWidth) {
            this.sheet.commandManager.executeResize(
                'col',
                this.targetCol,
                finalWidth,
                this.initialWidth,
                this.sheet
            );
        }

        this.active = false;
    }
}
