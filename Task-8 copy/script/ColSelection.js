import { SheetManager } from "./sheetManager.js";

export default class ColSelection {
    /**
     * @param {*SheetManager} sheet
     */
    constructor(sheet) {
        /** 
         * @type {SheetManager} 
         */
        this.sheet = sheet;
    }

    /**
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     * @returns {Boolean} returns true if the pointer is over the column header area
     */
    hitTest(x, y) {
        const isOnScrollbar = this.sheet.getScrollbarInfo(x, y);
        if (y > this.sheet.headerHeight || x < this.sheet.headerWidth || isOnScrollbar) return false;
    
        const cell = this.sheet.getCellFromPoint(x, this.sheet.headerHeight + 1);
        if (!cell) return false;
    
        this.targetCol = cell.col;
        return true;
    }
    
    /**
     * 
     * @param {PointerEvent} e 
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerDown(e, x, y) {
        const isMultiSelect = e.ctrlKey || e.metaKey;

        this.sheet.selection.startRowColDrag(0, this.targetCol, 'column');
        this.sheet.selection.selectCol(this.targetCol, isMultiSelect);
        this.sheet.updateCellReference();
        this.sheet.render();
    }

    /**
     * 
     * @param {PointerEvent} e
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerMove(e, x, y) {
        if (!this.sheet.selection.isDraggingRowCol) return;

        const cell = this.sheet.getCellFromPoint(x, this.sheet.headerHeight + 1);
        if (cell) {
            this.sheet.selection.updateRowColDrag(cell.row, cell.col);
            this.sheet.render();
        }
    }

    /**
     * @param {PointerEvent} e 
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerUp(e, x, y) {
        this.sheet.selection.endRowColDrag();
        this.sheet.updateStatusBar();
    }
}
