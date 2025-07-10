export default class ColResize {

    /**
     * @param {Object} sheet
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
        if (y > this.sheet.headerHeight) return false;

        let currentX = this.sheet.headerWidth - this.sheet.scrollX;
        const tolerance = 5;

        for (let col = 0; col < this.sheet.cellData.cols; col++) {
            const width = this.sheet.cellData.getColWidth(col);
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

        const delta = x - this.startX;
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
