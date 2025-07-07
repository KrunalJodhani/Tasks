
 export class SelectionManager {
    constructor() {
        this.activeCell = {
            row: 0,
            col: 0
        };
        this.selectedRanges = [];
        this.isSelecting = false;
        this.selectionStart = null;
        this.copiedCells = null;
        this.selectionType = 'cell';
        this.selectedRows = [];
        this.selectedCols = [];
    }
    selectRow(row, isMultiSelect = false) {
        this.selectionType = 'row';
        if (!isMultiSelect) {
            this.selectedRows = [];
            this.selectedCols = [];
        }
        const index = this.selectedRows.indexOf(row);
        if (index > -1) {
            this.selectedRows.splice(index, 1);
        } else {
            this.selectedRows.push(row);
        }
        this.activeCell = { row, col: 0 };
        this.selectedRanges = this.selectedRows.map(r => ({
            startRow: r,
            startCol: 0,
            endRow: r,
            endCol: this.maxCols - 1,
        }));
    }
    selectCol(col, isMultiSelect = false) {
        this.selectionType = 'column';
        if (!isMultiSelect) {
            this.selectedRows = [];
            this.selectedCols = [];
        }
        const index = this.selectedCols.indexOf(col);
        if (index > -1) {
            this.selectedCols.splice(index, 1);
        } else {
            this.selectedCols.push(col);
        }
        this.activeCell = { row: 0, col };
        this.selectedRanges = this.selectedCols.map(c => ({
            startRow: 0,
            startCol: c,
            endRow: this.maxRows - 1,
            endCol: c,
        }));
    }
     setActiveCell(row, col) {
        this.selectionType = 'cell';
        this.selectedRows = [];  
        this.selectedCols = [];  
        this.activeCell = { row, col };
        this.selectedRanges = [{
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        }];
    }
     startSelection(row, col) {
        this.selectionType = 'cell';
        this.selectedRows = [];  
        this.selectedCols = [];  
        this.isSelecting = true;
        this.selectionStart = { row, col };
        this.activeCell = { row, col };
    }
    updateSelection(row, col) {
        if (!this.isSelecting) return;
        this.selectedRanges = [{
            startRow: Math.min(this.selectionStart.row, row),
            startCol: Math.min(this.selectionStart.col, col),
            endRow: Math.max(this.selectionStart.row, row),
            endCol: Math.max(this.selectionStart.col, col)
        }];
    }
    endSelection() {
        this.isSelecting = false;
        this.selectionStart = null;
    }
    isSelected(row, col) {
        return this.selectedRanges.some(range =>
            row >= range.startRow && row <= range.endRow &&
            col >= range.startCol && col <= range.endCol
        );
    }
    getSelectedCells() {
        const cells = [];
        if (this.selectionType === 'row') {
            this.selectedRows.forEach(row => {  
                for (let col = 0; col < this.maxCols; col++) {
                    cells.push({ row, col });
                }
            });
            return cells;
        }
        if (this.selectionType === 'column') {
            this.selectedCols.forEach(col => {  
                for (let row = 0; row < this.maxRows; row++) {
                    cells.push({ row, col });
                }
            });
            return cells;
        }
        this.selectedRanges.forEach(range => {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startCol; col <= range.endCol; col++) {
                    cells.push({ row, col });
                }
            }
        });
        return cells;
    }
}