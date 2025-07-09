export default class RowResize {
    constructor(sheet) {
        this.sheet = sheet;
        this.active = false;
    }

    hitTest(x, y) {
        if (x > this.sheet.headerWidth) return false;

        let currentY = this.sheet.headerHeight - this.sheet.scrollY;
        const tolerance = 5;

        for (let row = 0; row < this.sheet.cellData.rows; row++) {
            const height = this.sheet.cellData.getRowHeight(row);
            currentY += height;
            if (Math.abs(y - currentY) <= tolerance) {
                this.targetRow = row;
                return true;
            }
        }

        return false;
    }

    onPointerDown(e, x, y) {
        this.active = true;
        this.startY = y;
        this.initialHeight = this.sheet.cellData.getRowHeight(this.targetRow);
    }

    onPointerMove(e, x, y) {
        if (!this.active) return;

        const delta = y - this.startY;
        const newHeight = Math.max(30, this.initialHeight + delta);
        this.sheet.cellData.setRowHeight(this.targetRow, newHeight);
        this.sheet.render();
    }

    onPointerUp() {
        if (!this.active) return;

        const finalHeight = this.sheet.cellData.getRowHeight(this.targetRow);
        if (finalHeight !== this.initialHeight) {
            this.sheet.commandManager.executeResize(
                'row',
                this.targetRow,
                finalHeight,
                this.initialHeight,
                this.sheet
            );
        }

        this.active = false;
    }
}
