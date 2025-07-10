export default class CellSelection {
    /**
     * @param {*obejet} sheet
     */
    constructor(sheet) {
        this.sheet = sheet;
        this.active = false;
        this.autoScrollInterval = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    /**
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     * @returns {Boolean} returns true if the pointer is over the cells
     */
    hitTest(x, y) {
        const isOnScrollbar = this.sheet.getScrollbarInfo(x, y);
        return x >= this.sheet.headerWidth &&
               y >= this.sheet.headerHeight &&
               !isOnScrollbar;
    }
    
    /**
     * 
     * @param {PointerEvent} e 
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerDown(e, x, y) {
        const cell = this.sheet.getCellFromPoint(x, y);
        if (!cell) return;

        if (e.shiftKey) {
            this.sheet.selection.updateSelection(cell.row, cell.col);
        } else {
            this.sheet.selection.startSelection(cell.row, cell.col);
            this.active = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.autoScrollInterval = setInterval(() => this.autoScroll(), 50);
        }

        this.sheet.updateCellReference();
        this.sheet.selection.selectedRanges = [];
        this.sheet.render();
    }

    /**
     * @param {PointerEvent} e 
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerMove(e, x, y) {
        if (!this.active) return;

        const cell = this.sheet.getCellFromPoint(x, y);
        if (cell) {
            this.sheet.selection.updateSelection(cell.row, cell.col);
            this.sheet.render();
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    /**
     * 
     * @param {PointerEvent} e 
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerUp(e, x, y) {
        if (!this.active) return;

        this.sheet.selection.endSelection();
        this.sheet.updateStatusBar();

        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }

        this.active = false;
    }

    /**
     * Automatically scroll the sheet when the mouse is near the edges.
     */
    autoScroll() {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX;
        const mouseY = this.lastMouseY;
        const threshold = 40;
        const speed = 40;
        let scrolled = false;

        if (mouseX < rect.left + threshold) {
            this.sheet.scrollX = Math.max(0, this.sheet.scrollX - speed);
            scrolled = true;
        } else if (mouseX > rect.right - threshold) {
            this.sheet.scrollX += speed;
            scrolled = true;
        }

        if (mouseY < rect.top + threshold) {
            this.sheet.scrollY = Math.max(0, this.sheet.scrollY - speed);
            scrolled = true;
        } else if (mouseY > rect.bottom - threshold) {
            this.sheet.scrollY += speed;
            scrolled = true;
        }

        if (scrolled) {
            const localX = mouseX - rect.left;
            const localY = mouseY - rect.top;
            const cell = this.sheet.getCellFromPoint(localX, localY);
            if (cell) {
                this.sheet.selection.updateSelection(cell.row, cell.col);
            }
            this.sheet.render();
        }
    }
}
