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

    /**
     * set active cell as  0 
     */
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
        this.isDraggingRowCol = false;
        this.dragStartRow = -1;
        this.dragStartCol = -1;
    }

    /**
     * selection of row
     * @param {number} row row index
     * @param {*boolean} isMultiSelect return true if mouse drag for multi selection
     */
    selectRow(row, isMultiSelect = false) {
        this.selectionType = 'row';
        if (!isMultiSelect) {
            this.selectedRows = [row];
            this.selectedCols = [];
        } else {
            const index = this.selectedRows.indexOf(row);
            if (index > -1) {
                this.selectedRows.splice(index, 1);
            } else {
                this.selectedRows.push(row);
            }
        }
        this.activeCell = { row, col: 0 };
        this.selectedRanges = this.selectedRows.map(r => ({
            startRow: r,
            startCol: 0,
            endRow: r,
            endCol: this.maxCols - 1,
        }));
    }

    /**
     * selection of column
     * @param {number} col column index
     * @param {*boolean} isMultiSelect return true if mouse drag for multi selection
     */
    selectCol(col, isMultiSelect = false) {
        this.selectionType = 'column';
        if (!isMultiSelect) {
            this.selectedRows = [];
            this.selectedCols = [col];
        } else {
            const index = this.selectedCols.indexOf(col);
            if (index > -1) {
                this.selectedCols.splice(index, 1);
            } else {
                this.selectedCols.push(col);
            }
        }
        this.activeCell = { row: 0, col };
        this.selectedRanges = this.selectedCols.map(c => ({
            startRow: 0,
            startCol: c,
            endRow: this.maxRows - 1,
            endCol: c,
        }));
    }

    /**
     * start row col drag
     * @param {*number} row drag's row number
     * @param {*number} col drag's col number
     * @param {*string} type row/col
     */

    startRowColDrag(row, col, type) {
        this.isDraggingRowCol = true;
        this.selectionType = type;
        this.dragStartRow = row;
        this.dragStartCol = col;

        if (type === 'row') {
            this.selectedRows = [row];
            this.selectedCols = [];
            this.activeCell = { row, col: 0 };
        } else {
            this.selectedCols = [col];
            this.selectedRows = [];
            this.activeCell = { row: 0, col };
        }
    }

    /**
     * update the row/col drag
     * @param {number} row selected cell's row
     * @param {*number} col selected cell's col
     * @returns 
     */
    updateRowColDrag(row, col) {
        if (!this.isDraggingRowCol) return;

        if (this.selectionType === 'row') {
            const startRow = Math.min(this.dragStartRow, row);
            const endRow = Math.max(this.dragStartRow, row);

            this.selectedRows = [];
            for (let r = startRow; r <= endRow; r++) {
                this.selectedRows.push(r);
            }

            this.selectedRanges = [{
                startRow: startRow,
                startCol: 0,
                endRow: endRow,
                endCol: this.maxCols - 1,
            }];
        } else if (this.selectionType === 'column') {
            const startCol = Math.min(this.dragStartCol, col);
            const endCol = Math.max(this.dragStartCol, col);

            this.selectedCols = [];
            for (let c = startCol; c <= endCol; c++) {
                this.selectedCols.push(c);
            }

            this.selectedRanges = [{
                startRow: 0,
                startCol: startCol,
                endRow: this.maxRows - 1,
                endCol: endCol,
            }];
        }
    }

    /**
     * inidcate the row/col drag is stop
     */
    endRowColDrag() {
        this.isDraggingRowCol = false;
        this.dragStartRow = -1;
        this.dragStartCol = -1;
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

    /**
     * for indication of selection is ended
     */
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

    /**
     * Start selection from current active cell (for keyboard selection)
     * @param {number} row starting row
     * @param {number} col starting column
     */
    startKeyboardSelection(row, col) {
        if (!this.isSelecting) {
            this.startSelection(row, col);
        }
    }

    /**
     * return the selected cell according to drag
     * @returns selected cells
     */
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