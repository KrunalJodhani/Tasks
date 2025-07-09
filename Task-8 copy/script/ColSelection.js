export default class ColSelection {
    constructor(sheet) {
        this.sheet = sheet;
        this.active = false;
    }

    hitTest(x, y) {
        const isOnScrollbar = this.sheet.getScrollbarInfo(x, y);
        if (y > this.sheet.headerHeight || x < this.sheet.headerWidth || isOnScrollbar) return false;
    
        const cell = this.sheet.getCellFromPoint(x, this.sheet.headerHeight + 1);
        if (!cell) return false;
    
        this.targetCol = cell.col;
        return true;
    }
    
    onPointerDown(e, x, y) {
        this.active = true;

        const isMultiSelect = e.ctrlKey || e.metaKey;

        this.sheet.selection.startRowColDrag(0, this.targetCol, 'column');
        this.sheet.selection.selectCol(this.targetCol, isMultiSelect);
        this.sheet.updateCellReference();
        this.sheet.render();
    }

    onPointerMove(e, x, y) {
        if (!this.active || !this.sheet.selection.isDraggingRowCol) return;

        const cell = this.sheet.getCellFromPoint(x, this.sheet.headerHeight + 1);
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
