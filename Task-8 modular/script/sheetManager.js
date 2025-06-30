import { SetCellValueCommand } from './SetCellValueCommand.js';
import { ClearCellCommand } from './ClearCellCommand.js';
import { CommandManager } from './CommandManager.js';
import { CellData } from './CellData.js';
import { SelectionManager } from './SelectionManager.js';

/**
 *  This class manages rendering and interaction for a spreadsheet-like interface using a single HTML canvas.
 
 * @property {HTMLCanvasElement} canvas - The canvas element used for rendering.
 * @property {CanvasRenderingContext2D} ctx - The 2D context of the canvas.
 * @property {number} dpr - Device Pixel Ratio for high-DPI rendering.
 * @property {CellData} cellData - Stores all cell values and dimensions.
 * @property {SelectionManager} selection - Manages cell selection and active cell.
 * @property {CommandManager} commandManager - Manages undo/redo command stack.
 * @property {number} scrollX - Horizontal scroll offset.
 * @property {number} scrollY - Vertical scroll offset.
 * @property {number} viewportWidth - Visible width of the canvas (adjusted by container).
 * @property {number} viewportHeight - Visible height of the canvas (adjusted by container).
 * @property {number} headerHeight - Height of the header row.
 * @property {number} headerWidth - Width of the header column.
 * @property {boolean} isEditing - Whether a cell is currently being edited.
 * @property {boolean} isDragging - Whether a selection drag is in progress.
 * @property {boolean} isResizing - Whether a column/row is being resized.
 * @property {string|null} resizeType - "row" or "col" depending on what's being resized.
 * @property {number} resizeIndex - Index of the row/column being resized.
 * @property {number} resizeStartPos - Mouse position when resize started.
 * @property {number} resizeStartSize - Initial size of the row/col before resizing.
 * @property {HTMLInputElement|null} cellEditor - The active input element for cell editing.

* @method constructor(canvasId,rows,cols) - Initializes the sheet manager and sets up everything.
 * @method setupCanvas() - Prepares canvas dimensions and context with DPR scaling.
 * @method setupEventListeners() - Binds mouse, keyboard, and resize events.
 * @method setupFormulaInputEvents() - Binds events to formula input DOM element.
 * @method generateSampleData() - Fills the grid with sample data.
 * @method getResizeInfo(x,y) - Checks if cursor is near a resizable edge.
 * @method updateCursor(x,y) - Changes the cursor icon based on hover position.
 * @method handleMouseDown(e) - Handles mouse down for selection/resizing.
 * @method handleMouseMove(e) - Handles dragging, hover effects, or resizing.
 * @method handleMouseUp(e) - Ends resizing or selection drag.
 * @method handleDoubleClick(e) - Activates editor input on double click.
 * @method showCellEditor(row,col) - Displays input box over selected cell.
 * @method hideCellEditor() - Removes the active cell editor input.
 * @method commitCellEdit(row,col,value) - Commits cell edit and triggers undo support.
 * @method commitEdit(value) - Commits edit from formula input.
 * @method cancelEdit() - Cancels formula bar edit.
 * @method updateFormulaBar() - Updates the formula input value to match the selected cell.
 * @method undo() - Reverts last change using command manager.
 * @method redo() - Reapplies undone change using command manager.
 * @method clearSelectedCells() - Clears content of all selected cells.
 * @method setCellValueDirect(row,col,value) - Directly sets or clears a cell value.
 * @method getColumnName(col) - Converts a column index to Excel-style name (e.g., A, B, Z, AA).
 * @method updateCellReference() - Updates the UI with the active cell's name (A1, B2, etc.).
 * @method getCellFromPoint(x,y) - Gets cell position (row, col) from mouse coordinates.
 * @method getCellRect(row,col) - Returns bounding box of a specific cell.
 * @method cellDisplay(row,col) - Scrolls viewport to bring cell into view.
 * @method handleWheel(e) - Scrolls viewport with mouse wheel.
 * @method handleKeyDown(e) - Keyboard-based interaction handler.
 * @method handleResize() - Reinitializes canvas on window resize.
 * @method render() - Main draw function, calls all rendering sub-functions.
 * @method drawGrid() - Draws the grid lines.
 * @method drawCells() - Draws visible cell values.
 * @method drawHeaders() - Draws row and column headers.
 * @method drawSelection() - Draws selected range and active cell border.
 */
export class SheetManager {
    /**
     * constructor
     * @param {*String} canvasId id of canvas div
     * @param {*number} rows number of rows
     * @param {*number} cols number of columns
     */
    constructor(canvasId, rows, cols) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        this.cellData = new CellData(rows, cols);
        this.selection = new SelectionManager();
        this.selection.maxRows = rows;
        this.selection.maxCols = cols;
        this.commandManager = new CommandManager();

        this.scrollX = 0;
        this.scrollY = 0;
        this.viewportWidth = 0;
        this.viewportHeight = 0;

        this.headerHeight = 30;
        this.headerWidth = 80;

        this.isEditing = false;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeType = null;
        this.resizeIndex = -1;
        this.resizeStartPos = 0;
        this.resizeStartSize = 0;

        this.cellEditor = null;

        this.setupCanvas();
        this.setupEventListeners();
        this.generateSampleData();
        this.render();
        this.updateCellReference();
    }


    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.viewportWidth = rect.width - 10;
        this.viewportHeight = rect.height - 10;

        this.dpr = window.devicePixelRatio || 1;

        this.canvas.width = this.viewportWidth * this.dpr;
        this.canvas.height = this.viewportHeight * this.dpr;
        this.canvas.style.width = this.viewportWidth + 'px';
        this.canvas.style.height = this.viewportHeight + 'px';

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.translate(0.5, 0.5);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));

        window.addEventListener('resize', this.handleResize.bind(this));

        this.setupFormulaInputEvents();

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.detectZoomChange();
            });
        }
    }

    setupFormulaInputEvents() {
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput) {
            formulaInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.commitEdit(formulaInput.value);
                    formulaInput.blur();
                    this.canvas.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.cancelEdit();
                    formulaInput.blur();
                    this.canvas.focus();
                }
            });

            formulaInput.addEventListener('focus', () => {
                this.isEditing = true;
            });

            formulaInput.addEventListener('blur', () => {
                if (this.isEditing) {
                    this.commitEdit(formulaInput.value);
                }
            });
        }
    }

    detectZoomChange() {
        const currentDPR = window.devicePixelRatio || 1;
        if (Math.abs(currentDPR - this.dpr) > 0.1) {
            this.setupCanvas();
            this.render();
            return true;
        }
        return false;
    }

    /**
 * Calculate statistics for selected cells containing numbers
 */
    calculateSelectionStats() {
        const selectedCells = this.selection.getSelectedCells();
        const numericValues = [];
        let stringVal = 0;

        selectedCells.forEach(pos => {
            const cell = this.cellData.getCell(pos.row, pos.col);
            if (cell.value !== '' && cell.value != null) {
                const numValue = parseFloat(cell.value);
                if (!isNaN(numValue)) {
                    numericValues.push(numValue);
                }
                stringVal++;
            }
        });

        const stats = {
            count: stringVal,
            sum: 0,
            average: 0,
            min: 0,
            max: 0
        };

        if (numericValues.length > 0) {
            stats.sum = numericValues.reduce((a, b) => a + b, 0);
            stats.average = stats.sum / numericValues.length;
            stats.min = Math.min(...numericValues);
            stats.max = Math.max(...numericValues);
        }

        return stats;
    }

    /**
     * Update the status bar with current selection statistics
     */
    updateStatusBar() {
        const stats = this.calculateSelectionStats();

        document.getElementById('statusCount').textContent = stats.count;
        document.getElementById('statusSum').textContent = stats.sum.toLocaleString();
        document.getElementById('statusAverage').textContent = stats.count > 0 ? stats.average.toFixed(2) : '0';
        document.getElementById('statusMin').textContent = stats.count > 0 ? stats.min.toLocaleString() : '0';
        document.getElementById('statusMax').textContent = stats.count > 0 ? stats.max.toLocaleString() : '0';
    }

    generateSampleData() {
        const headers = ['ID', 'firstName', 'LastName', 'Age', 'Salary'];
        headers.forEach((header, col) => {
            this.cellData.setCell(0, col, header);
        });

        const fnames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram'];
        const lnames = ['Kumar', 'Sharma', 'Patel', 'Gupta', 'Singh'];

        for (let row = 1; row <= 1000; row++) {
            this.cellData.setCell(row, 0, row);
            this.cellData.setCell(row, 1, fnames[Math.floor(Math.random() * fnames.length)]);
            this.cellData.setCell(row, 2, lnames[Math.floor(Math.random() * lnames.length)]);
            this.cellData.setCell(row, 3, Math.floor(Math.random() * 40) + 22);
            this.cellData.setCell(row, 4, Math.floor(Math.random() * 100000) + 30000);
        }
    }

    /**
     * 
     * @param {*number} x x position of row/columnn
     * @param {*number} y y position of row/columnn
     * @returns object which returns resize type is row/column and row/column's index
     */
    getResizeInfo(x, y) {
        const tolerance = 5;

        if (y <= this.headerHeight && x >= this.headerWidth) {
            let currentX = this.headerWidth - this.scrollX;
            for (let col = 0; col < this.cellData.cols; col++) {
                currentX += this.cellData.getColWidth(col);
                if (Math.abs(x - currentX) <= tolerance) {
                    return {
                        type: 'col',
                        index: col
                    };
                }
            }
        }

        if (x <= this.headerWidth && y >= this.headerHeight) {
            let currentY = this.headerHeight - this.scrollY;
            for (let row = 0; row < this.cellData.rows; row++) {
                currentY += this.cellData.getRowHeight(row);
                if (Math.abs(y - currentY) <= tolerance) {
                    return {
                        type: 'row',
                        index: row
                    };
                }
            }
        }

        return null;
    }

    /**
     * this function is for display of cursor which is for if cursor is on row/ column Edge it display resize cursor else it shows cursor type cell on canvas
     * @param {*number} x cusrsor's x position
     * @param {*number} y cursor's y position
     */
    updateCursor(x, y) {
        const resizeInfo = this.getResizeInfo(x, y);
        if (resizeInfo) {
            this.canvas.style.cursor = resizeInfo.type === 'col' ? 'col-resize' : 'row-resize';
        } else {
            this.canvas.style.cursor = 'cell';
        }
    }

    /**
     * Handles the mouse down event on the canvas.
     * @param {*MouseEvent} e The mouse event object triggered on mousedown.
     * @returns {void}
     */
    handleMouseDown(e) {
        this.canvas.focus();
        this.hideCellEditor();

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const resizeInfo = this.getResizeInfo(x, y);
        if (resizeInfo) {
            this.isResizing = true;
            this.resizeType = resizeInfo.type;
            this.resizeIndex = resizeInfo.index;
            this.resizeStartPos = resizeInfo.type === 'col' ? x : y;
            this.resizeStartSize = resizeInfo.type === 'col' ?
                this.cellData.getColWidth(resizeInfo.index) :
                this.cellData.getRowHeight(resizeInfo.index);
            return;
        }

        //column header Click
        if (y <= this.headerHeight && x >= this.headerWidth) {
            const cellPos = this.getCellFromPoint(x, this.headerHeight + 1);
            if (cellPos) {
                this.selection.selectCol(cellPos.col);
                this.updateCellReference()
                this.render();
                return;
            }
        }

        // Row header click
        if (x <= this.headerWidth && y >= this.headerHeight) {
            const cellPos = this.getCellFromPoint(this.headerWidth + 1, y);
            if (cellPos) {
                this.selection.selectRow(cellPos.row);
                this.updateCellReference();
                this.render();
                return;
            }
        }

        const cellPos = this.getCellFromPoint(x, y);
        if (cellPos) {
            if (e.shiftKey) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
            } else {
                this.selection.startSelection(cellPos.row, cellPos.col);
                this.isDragging = true;
            }
            this.updateCellReference();
            this.render();
        }

        e.preventDefault();
        this.selection.selectedRanges = [];
        this.render();
    }

    /**
     * Handles the mouse move event on the canvas.
     * @param {*MouseEvent} e The mouse event object triggered on mouseMove
     * @returns {void}
     */

    handleMouseMove(e) {
        if (this.isScrollbarDragging) {
            if (this.scrollbarDragType === 'horizontal') {
                const deltaX = e.clientX - this.scrollbarDragStart;
                const scrollbarWidth = this.viewportWidth - this.headerWidth;

                let totalWidth = 0;
                for (let col = 0; col < this.cellData.cols; col++) {
                    totalWidth += this.cellData.getColWidth(col);
                }

                const maxScroll = Math.max(0, totalWidth - scrollbarWidth);
                this.scrollX = Math.max(0, Math.min(maxScroll, this.scrollbarInitialScroll + (scrollRatio * totalWidth)));

            } else if (this.scrollbarDragType === 'vertical') {
                const deltaY = e.clientY - this.scrollbarDragStart;
                const scrollbarHeight = this.viewportHeight - this.headerHeight;

                let totalHeight = 0;
                for (let row = 0; row < this.cellData.rows; row++) {
                    totalHeight += this.cellData.getRowHeight(row);
                }

                const maxScroll = Math.max(0, totalHeight - scrollbarHeight);
                const scrollRatio = deltaY / scrollbarHeight;
                this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollbarInitialScroll + (scrollRatio * totalHeight)));
            }

            this.render();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isResizing) {
            const currentPos = this.resizeType === 'col' ? x : y;
            const delta = currentPos - this.resizeStartPos;
            const newSize = Math.max(30, this.resizeStartSize + delta);

            if (this.resizeType === 'col') {
                this.cellData.setColWidth(this.resizeIndex, newSize);
            } else {
                this.cellData.setRowHeight(this.resizeIndex, newSize);
            }

            this.render();
            return;
        }

        if (this.isDragging) {
            const cellPos = this.getCellFromPoint(x, y);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
                this.render();
            }
        } else {
            this.updateCursor(x, y);
        }
    }

    /**
     * The mouse event object triggered on mouse up
     * @param {*MouseEvent} e The mouse event object triggered on mouseUp
     */
    handleMouseUp(e) {
        if (this.isScrollbarDragging) {
            this.isScrollbarDragging = false;
            this.scrollbarDragType = null;
        }

        if (this.isResizing) {
            this.isResizing = false;
            this.resizeType = null;
            this.resizeIndex = -1;
        }

        if (this.isDragging) {
            this.selection.endSelection();
            this.isDragging = false;
            this.updateStatusBar();
        }
    }

    /**
     * Handles the double click event on the canvas.
     * @param {*mouseEvent} e The mouse event object triggered on double click
     */
    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.getCellFromPoint(x, y);
        if (cellPos) {
            this.showCellEditor(cellPos.row, cellPos.col);
        }
    }

    /**
     * show the input box over the selected cell
     * @param {*index} row selected cell's row's index
     * @param {*index} col selceted cell's column's index
     */
    showCellEditor(row, col) {
        this.hideCellEditor();

        const cell = this.cellData.getCell(row, col);
        const rect = this.getCellRect(row, col);

        const editor = document.createElement('input');
        editor.type = 'text';
        editor.className = 'cell-input';
        editor.value = cell.value || '';

        editor.style.left = (rect.x) + 'px';
        editor.style.top = (rect.y) + 'px';
        editor.style.width = (rect.width) + 'px';
        editor.style.height = (rect.height) + 'px';

        this.canvas.parentElement.appendChild(editor);
        this.cellEditor = editor;

        editor.focus();
        editor.select();

        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.commitCellEdit(row, col, editor.value);
                this.hideCellEditor();
                this.canvas.focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideCellEditor();
                this.canvas.focus();
            }
        });

        editor.addEventListener('blur', () => {
            this.commitCellEdit(row, col, editor.value);
            this.hideCellEditor();
        });
    }

    hideCellEditor() {
        if (this.cellEditor) {
            this.cellEditor.remove();
            this.cellEditor = null;
        }
    }

    /**
     * update the enterd value in selected cell
     * @param {*number/index} row selected cell's row's index
     * @param {*number/index} col selected cell's column's index
     * @param {*string} value value of selected cell
     */
    commitCellEdit(row, col, value) {
        const oldCell = this.cellData.getCell(row, col);
        const oldValue = oldCell.value || '';

        if (value !== oldValue) {
            const command = new SetCellValueCommand(this, row, col, value, oldValue);
            this.commandManager.execute(command);
            this.render();
        }

        this.updateCellReference();
    }

    /**
     * Handles the mouse scroll event on the canvas.
     * @param {*mousEvent} e The mouse event object triggered on mouse scroll
     */
    handleWheel(e) {

        const scrollSpeed = 150;
        if (e.shiftKey) {
            this.scrollX = Math.max(0, this.scrollX + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        } else {
            this.scrollY = Math.max(0, this.scrollY + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        }
        this.render();
    }

    /**
     * Handles the key down event on the canvas.
     * @param {*keybordEvent} e The keyboard event object triggered on key press
     * @returns {void}
     */
    handleKeyDown(e) {
        if (this.isEditing || this.cellEditor) return;

        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) this.redo();
                    else this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 'c':
                    e.preventDefault();
                    this.copy();
                    break;
                case 'v':
                    e.preventDefault();
                    this.paste();
                    break;
                case 'x':
                    e.preventDefault();
                    this.cut();
                    break;
            }
            return;
        }

        const {
            row,
            col
        } = this.selection.activeCell;
        let newRow = row;
        let newCol = col;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newRow = Math.min(this.cellData.rows - 1, row + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                newCol = Math.min(this.cellData.cols - 1, col + 1);
                break;
            case 'Enter':
            case 'F2':
                e.preventDefault();
                this.showCellEditor(row, col);
                return;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                this.clearSelectedCells();
                return;
            case 'Escape':
                e.preventDefault();
                this.selection.selectedRanges = [];
                this.render();
                return;
            default:
                if (e.key.length === 1 && !e.altKey) {
                    this.showCellEditor(row, col);
                    setTimeout(() => {
                        if (this.cellEditor) {
                            this.cellEditor.value = e.key;
                            this.cellEditor.setSelectionRange(1, 1);
                        }
                    }, 0);
                    return;
                }
        }

        if (newRow !== row || newCol !== col) {
            this.selection.setActiveCell(newRow, newCol);
            this.selection.setActiveCell(newRow, newCol);
            this.cellDisplay(newRow, newCol);
            this.updateCellReference();
            this.render();
        }
    }

    handleResize() {
        this.setupCanvas();
        this.render();
    }

    /**
     * change the value of selected cell
     * @param {*string} value text/content of selected cell
     */
    commitEdit(value) {
        const {
            row,
            col
        } = this.selection.activeCell;
        const oldCell = this.cellData.getCell(row, col);
        const oldValue = oldCell.value || '';

        if (value !== oldValue) {
            const command = new SetCellValueCommand(this, row, col, value, oldValue);
            this.commandManager.execute(command);
            this.updateFormulaBar();
            this.render();
        }

        this.isEditing = false;
    }

    cancelEdit() {
        this.isEditing = false;
        this.updateFormulaBar();
    }

    updateFormulaBar() {
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput) {
            const {
                row,
                col
            } = this.selection.activeCell;
            const cell = this.cellData.getCell(row, col);
            formulaInput.value = cell.value || '';
        }
    }

    undo() {
        if (this.commandManager.undo()) {
            this.updateCellReference();
            this.updateFormulaBar();
            this.render();
        }
    }

    redo() {
        if (this.commandManager.redo()) {
            this.updateCellReference();
            this.updateFormulaBar();
            this.render();
        }
    }

    clearSelectedCells() {
        const cells = this.selection.getSelectedCells();
        cells.forEach(pos => {
            const oldCell = this.cellData.getCell(pos.row, pos.col);
            if (oldCell.value) {
                const command = new ClearCellCommand(this, pos.row, pos.col, oldCell.value);
                this.commandManager.execute(command);
            }
        });
        this.updateFormulaBar();
        this.render();
    }

    /**
     * set the cell value
     * @param {*number/index} row selected cell's row's index
     * @param {*number/index} col selected cell's column's index
     * @param {*string} value value of selected cell
     */
    setCellValueDirect(row, col, value) {
        if (value === '' || value == null) {
            this.cellData.deleteCell(row, col);
        } else {
            this.cellData.setCell(row, col, value);
        }
    }

    /**
     * getter method for column
     * @param {*string} col column index
     * @returns spexific number of column converted from string
     */
    getColumnName(col) {
        let name = '';
        col++;
        while (col > 0) {
            col--;
            name = String.fromCharCode(65 + (col % 26)) + name;
            col = Math.floor(col / 26);
        }
        return name;
    }

    updateCellReference() {
        const cellRef = document.getElementById('cellReference');
        if (cellRef) {
            if (this.selection.selectionType === 'column') {
                const col = this.selection.activeCell.col;
                cellRef.textContent = this.getColumnName(col) + '1';
            }
            else if (this.selection.selectionType === 'row') {
                const row = this.selection.activeCell.row + 1;
                cellRef.textContent = 'A' + row;
                console.log('row selection');
            }
            else {
                const {
                    row,
                    col
                } = this.selection.activeCell;
                cellRef.textContent = this.getColumnName(col) + (row + 1);
            }
        }
        this.updateFormulaBar();
        this.updateStatusBar();
    }

    /**
     * from the cursor point it get cell
     * @param {number*} x x position of cursor on screen
     * @param {*number} y y position of cursor on screen
     * @returns an object which returns row and column index of cell
     */
    getCellFromPoint(x, y) {
        if (x < this.headerWidth || y < this.headerHeight) return null;

        let currentY = this.headerHeight - this.scrollY;
        let row = -1;
        for (let r = 0; r < this.cellData.rows; r++) {
            const height = this.cellData.getRowHeight(r);
            if (y >= currentY && y < currentY + height) {
                row = r;
                break;
            }
            currentY += height;
        }

        let currentX = this.headerWidth - this.scrollX;
        let col = -1;
        for (let c = 0; c < this.cellData.cols; c++) {
            const width = this.cellData.getColWidth(c);
            if (x >= currentX && x < currentX + width) {
                col = c;
                break;
            }
            currentX += width;
        }

        return (row >= 0 && col >= 0) ? {
            row,
            col
        } : null;
    }

    /**
     * get the cell's rectangel from row and column
     * @param {*number} row 
     * @param {*number} col 
     * @returns an obejet which has cell's height, width, x and y co-ordinate
     */
    getCellRect(row, col) {
        let x = this.headerWidth - this.scrollX;
        for (let c = 0; c < col; c++) {
            x += this.cellData.getColWidth(c);
        }

        let y = this.headerHeight - this.scrollY;
        for (let r = 0; r < row; r++) {
            y += this.cellData.getRowHeight(r);
        }

        return {
            x: x,
            y: y,
            width: this.cellData.getColWidth(col),
            height: this.cellData.getRowHeight(row)
        };
    }

    /**
     * from the row and column display the cell
     * @param {*number/index} row row's column
     * @param {*number/index} col cell's column 
     */
    cellDisplay(row, col) {
        const rect = this.getCellRect(row, col);

        if (rect.x < this.headerWidth) {
            this.scrollX = Math.max(0, this.scrollX - (this.headerWidth - rect.x));
        } else if (rect.x + rect.width > this.viewportWidth) {
            this.scrollX += (rect.x + rect.width - this.viewportWidth);
        }

        if (rect.y < this.headerHeight) {
            this.scrollY = Math.max(0, this.scrollY - (this.headerHeight - rect.y));
        } else if (rect.y + rect.height > this.viewportHeight) {
            this.scrollY += (rect.y + rect.height - this.viewportHeight);
        }
    }

    render() {
        this.detectZoomChange();
        this.ctx.clearRect(-0.5, -0.5, this.viewportWidth + 1, this.viewportHeight + 1);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.drawGrid();
        this.drawCells();
        this.drawHeaders();
        this.drawSelection();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Horizontal lines
        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            y += height;
            if (y >= this.headerHeight) {
                this.ctx.moveTo(this.headerWidth, y);
                this.ctx.lineTo(this.viewportWidth, y);
            }
        }

        // Vertical lines
        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
            const width = this.cellData.getColWidth(col);
            x += width;
            if (x >= this.headerWidth) {
                this.ctx.moveTo(x, this.headerHeight);
                this.ctx.lineTo(x, this.viewportHeight);
            }
        }

        this.ctx.stroke();
    }

    drawCells() {
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';

        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);

            if (y + height >= this.headerHeight) {
                let x = this.headerWidth - this.scrollX;
                for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
                    const width = this.cellData.getColWidth(col);

                    if (x + width >= this.headerWidth) {
                        const cell = this.cellData.getCell(row, col);
                        if (cell.value) {
                            this.ctx.fillStyle = '#000000';
                            const displayValue = cell.getDisplayValue();
                            const textX = x + 6;
                            const textY = y + height / 2;

                            this.ctx.save();
                            this.ctx.beginPath();
                            this.ctx.rect(x, y, width, height);
                            this.ctx.clip();
                            this.ctx.fillText(displayValue, textX, textY);
                            this.ctx.restore();
                        }
                    }
                    x += width;
                }
            }
            y += height;
        }
    }

    drawHeaders() {
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;

        // Draw column headers
        this.ctx.fillRect(this.headerWidth, 0, this.viewportWidth - this.headerWidth, this.headerHeight);

        // Draw column headers with selection highlighting
        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
            const width = this.cellData.getColWidth(col);
            if (x + width >= this.headerWidth) {
                const isSelected = this.selection.selectedRanges.some(range =>
                    col >= range.startCol && col <= range.endCol
                ) || col === this.selection.activeCell.col ||
                    this.selection.selectedCols.has(col);

                // Set background color based on selection
                this.ctx.fillStyle = isSelected ? '#CAEAD8' : '#f8f9fa';
                this.ctx.fillRect(x, 0, width, this.headerHeight);

                // Draw normal header border
                this.ctx.strokeStyle = '#d0d0d0';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.rect(x, 0, width, this.headerHeight);
                this.ctx.stroke();

                // Draw thick bottom border for selected columns (Excel-style)
                if (isSelected) {
                    this.ctx.strokeStyle = '#137E43';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, this.headerHeight);
                    this.ctx.lineTo(x + width, this.headerHeight);
                    this.ctx.stroke();
                }

                // Draw header text
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.getColumnName(col), x + width / 2, this.headerHeight / 2);
            }
            x += width;
        }

        // Draw row headers
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, this.headerHeight, this.headerWidth, this.viewportHeight - this.headerHeight);

        // Draw row headers with selection highlighting
        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            if (y + height >= this.headerHeight) {
                const isSelected = this.selection.selectedRanges.some(range =>
                    row >= range.startRow && row <= range.endRow
                ) || row === this.selection.activeCell.row ||
                    this.selection.selectedRows.has(row);

                // Set background color based on selection
                this.ctx.fillStyle = isSelected ? '#CAEAD8' : '#f8f9fa';
                this.ctx.fillRect(0, y, this.headerWidth, height);

                // Draw normal header border
                this.ctx.strokeStyle = '#d0d0d0';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.rect(0, y, this.headerWidth, height);
                this.ctx.stroke();

                // Draw thick right border for selected rows (Excel-style)
                if (isSelected) {
                    this.ctx.strokeStyle = '#137E43';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.headerWidth, y);
                    this.ctx.lineTo(this.headerWidth, y + height);
                    this.ctx.stroke();
                }

                // Draw header text
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'right';
                let rowHeaderDyWidth = this.ctx.measureText((row + 1).toString()).width;
                this.ctx.fillText((row + 1).toString(), this.headerWidth - 8, y + height / 2);
                // console.log(rowHeaderDyWidth);
            }
            y += height;
        }

        // Draw corner
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.stroke();
    }

    drawSelection() {
        this.ctx.strokeStyle = '#137E43';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = 'rgba(19, 126, 67, 0.1)';

        this.selection.selectedRanges.forEach(range => {
            const startRect = this.getCellRect(range.startRow, range.startCol);
            const endRect = this.getCellRect(range.endRow, range.endCol);

            const x = startRect.x;
            const y = startRect.y;
            const width = endRect.x + endRect.width - startRect.x;
            const height = endRect.y + endRect.height - startRect.y;

            this.ctx.fillRect(x, y, width, height);

            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.stroke();
        });

        const activeRect = this.getCellRect(this.selection.activeCell.row, this.selection.activeCell.col);
        this.ctx.strokeStyle = '#137E43';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(activeRect.x, activeRect.y, activeRect.width, activeRect.height);
        this.ctx.stroke();
    }
}