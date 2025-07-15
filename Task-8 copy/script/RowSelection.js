import { SheetManager } from "./sheetManager.js";

export default class RowSelection {
    /**
     * @param {SheetManager} sheet
     */
    constructor(sheet) {
        // /**@type {SheetManager} */
        this.sheet = sheet;
    }

    /**
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     * @returns {Boolean} returns true if the pointer is over the row header area
     */
    hitTest(x, y) {
        const isOnScrollbar = this.sheet.getScrollbarInfo(x, y);
        if (x > this.sheet.headerWidth || y < this.sheet.headerHeight || isOnScrollbar) return false;
    
        const cell = this.sheet.getCellFromPoint(this.sheet.headerWidth + 1, y);
        if (!cell) return false;
    
        this.targetRow = cell.row;
        return true;
    }
    
    /**
     * @param {PointerEvent} e
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerDown(e, x, y) {
        const isMultiSelect = e.ctrlKey || e.metaKey;

        this.sheet.selection.startRowColDrag(this.targetRow, 0, 'row');
        this.sheet.selection.selectRow(this.targetRow, isMultiSelect);
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

        const cell = this.sheet.getCellFromPoint(this.sheet.headerWidth + 1, y);
        if (cell) {
            this.sheet.selection.updateRowColDrag(cell.row, cell.col);
            this.sheet.render();
        }
    }

    /**
     * This method is called when the pointer is released.
     * @param {PointerEvent} e
     * @param {Number} x pointer x position
     * @param {Number} y pointer y position
     */
    onPointerUp(e, x, y) {
        this.sheet.selection.endRowColDrag();
        this.sheet.updateStatusBar();
    }
}
