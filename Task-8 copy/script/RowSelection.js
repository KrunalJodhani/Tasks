export default class RowSelection {
    constructor(sheet) {
        this.sheet = sheet;
        this.active = false;
    }

    hitTest(x, y) {
        const isOnScrollbar = this.sheet.getScrollbarInfo(x, y);
        if (x > this.sheet.headerWidth || y < this.sheet.headerHeight || isOnScrollbar) return false;
    
        const cell = this.sheet.getCellFromPoint(this.sheet.headerWidth + 1, y);
        if (!cell) return false;
    
        this.targetRow = cell.row;
        return true;
    }
    
    onPointerDown(e, x, y) {
        this.active = true;

        const isMultiSelect = e.ctrlKey || e.metaKey;

        this.sheet.selection.startRowColDrag(this.targetRow, 0, 'row');
        this.sheet.selection.selectRow(this.targetRow, isMultiSelect);
        this.sheet.updateCellReference();
        this.sheet.render();
    }

    onPointerMove(e, x, y) {
        if (!this.active || !this.sheet.selection.isDraggingRowCol) return;

        const cell = this.sheet.getCellFromPoint(this.sheet.headerWidth + 1, y);
        if (cell) {
            this.sheet.selection.updateRowColDrag(cell.row, cell.col);
            this.sheet.render();
        }
    }

    onPointerUp(e, x, y) {
        if (!this.active) return;

        this.sheet.selection.endRowColDrag();
        this.sheet.updateStatusBar();
        this.active = false;
    }
}
