/**
 * @property {{row: number, col: number}} activeCell - The currently focused cell.
 * @property {Array<Object>} selectedRanges - Array of selection ranges containing start and end coordinates.
 * @property {boolean} isSelecting - Indicates whether a drag selection is in progress.
 * @property {?{row: number, col: number}} selectionStart - Starting point of a drag selection.
 * @property {?Array<Object>} copiedCells - Stores copied cell references for clipboard operations.
 * 
 * @constructor  Initializes the selection state and active cell to the top-left corner.
 * 
 * @method setActiveCell(row: number, col: number): Sets the current active cell and clears any multi-cell selections.
 * 
 * @method startSelection(row: number, col: number): Begins a drag selection from the specified cell. Marks it as active and stores the starting point.
 * 
 * @method updateSelection(row: number, col: number):  Updates the selection range dynamically based on current cursor position during dragging.
 * Returns early if selection is not active.
 * 
 * @method endSelection(): Ends an ongoing selection operation and resets selection start.
 * 
 * @method isSelected(row: number, col: number): Checks whether the specified cell is part of any selected range.
 * 
 * @method getSelectedCells():  Returns a flat array of all selected cell coordinates.
 */
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
        
        // Toggle selection if already selected
        const index = this.selectedRows.indexOf(row);
        if (index > -1) {
            this.selectedRows.splice(index, 1);
        } else {
            this.selectedRows.push(row);
        }
        
        this.activeCell = { row, col: 0 };
        
        // Update selectedRanges to include all selected rows
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
        
        // Toggle selection if already selected
        const index = this.selectedCols.indexOf(col);
        if (index > -1) {
            this.selectedCols.splice(index, 1);
        } else {
            this.selectedCols.push(col);
        }
        
        this.activeCell = { row: 0, col };
        
        // Update selectedRanges to include all selected columns
        this.selectedRanges = this.selectedCols.map(c => ({
            startRow: 0,
            startCol: c,
            endRow: this.maxRows - 1,
            endCol: c,
        }));
    }

    /**
     * set the selected cell
     * @param {*number} row row of active selectd cell
     * @param {*number} col column of active selectd cell
     */
     setActiveCell(row, col) {
        this.selectionType = 'cell';
        this.selectedRows = [];  // Changed from .clear()
        this.selectedCols = [];  // Changed from .clear()
        this.activeCell = { row, col };
        this.selectedRanges = [{
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        }];
    }

    /**
     * on selection start it willl set the start and end selection row column
     * @param {*number} row last selected cell's row
     * @param {*number} col last selected cell's column
     */
     startSelection(row, col) {
        this.selectionType = 'cell';
        this.selectedRows = [];  // Changed from .clear()
        this.selectedCols = [];  // Changed from .clear()
        this.isSelecting = true;
        this.selectionStart = { row, col };
        this.activeCell = { row, col };
    }

    /**
     * based on mouse move select the cell
     * @param {*number} row selected cell's row
     * @param {*number} col selected cell's column
     * @returns if not selecting area
     */
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

    /**
     * return true if cell is in selected else false
     * @param {*number} row row index of cell
     * @param {*number} col column index of cell
     * @returns boolean if the cell with given row and column is selected or not
     */
    isSelected(row, col) {
        return this.selectedRanges.some(range =>
            row >= range.startRow && row <= range.endRow &&
            col >= range.startCol && col <= range.endCol
        );
    }


    getSelectedCells() {
        const cells = [];
    
        if (this.selectionType === 'row') {
            this.selectedRows.forEach(row => {  // Array forEach works the same
                for (let col = 0; col < this.maxCols; col++) {
                    cells.push({ row, col });
                }
            });
            return cells;
        }
    
        if (this.selectionType === 'column') {
            this.selectedCols.forEach(col => {  // Array forEach works the same
                for (let row = 0; row < this.maxRows; row++) {
                    cells.push({ row, col });
                }
            });
            return cells;
        }
    
        // Rest remains the same
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