import { SetCellValueCommand } from './SetCellValueCommand.js';
import { ClearCellCommand } from './ClearCellCommand.js';
import { CommandManager } from './CommandManager.js';
import { CellData } from './CellData.js';
import { SelectionManager } from './SelectionManager.js';
import {MouseHandler} from './MouseHandler.js'

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
 * @method setupFormulaInputEvents() - Binds events to formula input DOM element.
 * @method generateSampleData() - Fills the grid with sample data.
 * @method getResizeInfo(x,y) - Checks if cursor is near a resizable edge.
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

        this.scrollbarWidth = 10;
        this.scrollbarHeight = 10;
        this.isScrollbarDragging = false;
        this.scrollbarDragType = null;
        this.scrollbarDragStart = 0;
        this.scrollbarInitialScroll = 0;

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

        this.autoScrollInterval = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.SetCellValueCommand = SetCellValueCommand;
        this.ClearCellCommand = ClearCellCommand;

        this.setupCanvas();
        this.mouseHandler = new MouseHandler(this);
        this.setupFormulaInputEvents();
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.generateSampleData();
        this.render();
        this.updateCellReference();
    }

    /**
     * Prepares canvas dimensions and context with DPR scaling.
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.viewportWidth = rect.width - 1;
        this.viewportHeight = rect.height - 1;

        this.dpr = window.devicePixelRatio || 1;

        this.canvas.width = this.viewportWidth * this.dpr;
        this.canvas.height = this.viewportHeight * this.dpr;
        this.canvas.style.width = this.viewportWidth + 'px';
        this.canvas.style.height = this.viewportHeight + 'px';

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.translate(0.5, 0.5);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
    }

    /**
     * Binds events to formula input DOM element.
     */
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

    /**
     * detect the zoom and true else false
     * @returns true if screen is zoom else return false
     */
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
            stats.min = Math.min(numericValues);
            stats.max = Math.max(numericValues);
        }
        return stats;
    }

    /**
     * Update the status bar with current selection statistics
     */
    updateStatusBar() {
        const stats = this.calculateSelectionStats();

        document.getElementById('statusCount').textContent = stats.count > 1 ? stats.count : 0;
        document.getElementById('statusSum').textContent = stats.count > 1 ? stats.sum.toLocaleString() : 0;
        document.getElementById('statusAverage').textContent = stats.count > 1 ? stats.average.toFixed(2) : '0';
        document.getElementById('statusMin').textContent = stats.count > 1 ? stats.min.toLocaleString() : '0';
        document.getElementById('statusMax').textContent = stats.count > 1 ? stats.max.toLocaleString() : '0';
    }

    /**
     * draw scroll bar on the viewport
     */
    drawScrollbars() {
        const scrollbarColor = '#A0A0A0';
        const scrollbarTrackColor = '#E7E7E7';

        // Calculate total content dimensions
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }

        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }

        const contentWidth = this.viewportWidth;
        const contentHeight = this.viewportHeight;

        const needsHorizontalScrollbar = totalWidth > contentWidth;
        const needsVerticalScrollbar = totalHeight > contentHeight;

        const availableContentWidth = contentWidth - (needsVerticalScrollbar ? this.scrollbarWidth : 0);
        const availableContentHeight = contentHeight - (needsHorizontalScrollbar ? this.scrollbarHeight : 0);

        // Draw horizontal scrollbar
        if (totalWidth > contentWidth) {
            const trackWidth = availableContentWidth;
            const trackX = 0;
            const trackY = this.viewportHeight - this.scrollbarHeight;

            // Draw track
            this.ctx.fillStyle = scrollbarTrackColor;
            this.ctx.fillRect(trackX, trackY, trackWidth, this.scrollbarHeight);

            // Calculate thumb size and position
            const thumbWidth = Math.max(20, (contentWidth / totalWidth) * trackWidth);
            const maxScroll = Math.max(0, totalWidth - contentWidth);
            const thumbX = trackX + (this.scrollX / maxScroll) * (trackWidth - thumbWidth);

            // Draw thumb
            this.ctx.fillStyle = scrollbarColor;
            this.ctx.fillRect(thumbX, trackY + 2, thumbWidth, this.scrollbarHeight - 4);

            // Add subtle borders
            this.ctx.strokeStyle = '#999999';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(thumbX, trackY + 2, thumbWidth, this.scrollbarHeight - 4);
        }

        // Draw vertical scrollbar
        if (totalHeight > contentHeight) {
            const trackHeight = availableContentHeight;
            const trackX = this.viewportWidth - this.scrollbarWidth;
            const trackY = 0;

            // Draw track
            this.ctx.fillStyle = scrollbarTrackColor;
            this.ctx.fillRect(trackX, trackY, this.scrollbarWidth, trackHeight);

            // Calculate thumb size and position
            const thumbHeight = Math.max(20, (contentHeight / totalHeight) * trackHeight);
            const maxScroll = Math.max(0, totalHeight - contentHeight);
            const thumbY = trackY + (this.scrollY / maxScroll) * (trackHeight - thumbHeight);

            // Draw thumb
            this.ctx.fillStyle = scrollbarColor;
            this.ctx.fillRect(trackX + 2, thumbY, this.scrollbarWidth - 4, thumbHeight);

            // Add subtle borders
            this.ctx.strokeStyle = '#999999';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(trackX + 2, thumbY, this.scrollbarWidth - 4, thumbHeight);
        }

        // Draw corner (where scrollbars meet)
        if (needsHorizontalScrollbar && needsVerticalScrollbar) {
            this.ctx.fillStyle = scrollbarTrackColor;
            this.ctx.fillRect(
                this.viewportWidth - this.scrollbarWidth,
                this.viewportHeight - this.scrollbarHeight,
                this.scrollbarWidth,
                this.scrollbarHeight
            );
        }
    }

    /**
     * get info of corsor and info about scrollbar
     * @param {*number} x cursor's x position
     * @param {*number} y cursor's y position
     * @returns scrollbar type and where the cursor is on scrollbar thumb or scrollbar track or outside the scrollbar
     */
    getScrollbarInfo(x, y) {
        // Calculate total content dimensions
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }

        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }

        const contentWidth = this.viewportWidth;
        const contentHeight = this.viewportHeight;

        // Check horizontal scrollbar
        if (totalWidth > contentWidth) {
            const trackWidth = contentWidth - this.scrollbarWidth;
            const trackX = 0;
            const trackY = this.viewportHeight - this.scrollbarHeight;

            if (x >= trackX && x <= trackX + trackWidth &&
                y >= trackY && y <= trackY + this.scrollbarHeight) {

                const thumbWidth = Math.max(20, (contentWidth / totalWidth) * trackWidth);
                const maxScroll = Math.max(0, totalWidth - contentWidth);
                const thumbX = trackX + (this.scrollX / maxScroll) * (trackWidth - thumbWidth);

                if (x >= thumbX && x <= thumbX + thumbWidth) {
                    return { type: 'horizontal', part: 'thumb' };
                } else {
                    return { type: 'horizontal', part: 'track' };
                }
            }
        }
        // Check vertical scrollbar
        if (totalHeight > contentHeight) {
            const trackHeight = contentHeight - this.scrollbarHeight;
            const trackX = this.viewportWidth - this.scrollbarWidth;
            const trackY = 0;

            if (x >= trackX && x <= trackX + this.scrollbarWidth &&
                y >= trackY && y <= trackY + trackHeight) {

                const thumbHeight = Math.max(20, (contentHeight / totalHeight) * trackHeight);
                const maxScroll = Math.max(0, totalHeight - contentHeight);
                const thumbY = trackY + (this.scrollY / maxScroll) * (trackHeight - thumbHeight);

                if (y >= thumbY && y <= thumbY + thumbHeight) {
                    return { type: 'vertical', part: 'thumb' };
                } else {
                    return { type: 'vertical', part: 'track' };
                }
            }
        }
        return null;
    }

    /**
     * Fills the grid with sample data.
     */
    generateSampleData() {
        const headers = ['ID', 'firstName', 'LastName', 'Age', 'Salary'];
        headers.forEach((header, col) => {
            this.cellData.setCell(0, col, header);
        });

        const fnames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram'];
        const lnames = ['Kumar', 'Sharma', 'Patel', 'Gupta', 'Singh'];

        for (let row = 1; row <= 50000; row++) {
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

    autoScrollSelection() {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX;
        const mouseY = this.lastMouseY;

        const edgeThreshold = 40;
        const scrollSpeed = 40;
        let scrolled = false;

        if (mouseX < rect.left + edgeThreshold) {
            this.scrollX = Math.max(0, this.scrollX - scrollSpeed);
            scrolled = true;
        } else if (mouseX > rect.right - edgeThreshold) {
            this.scrollX += scrollSpeed;
            scrolled = true;
        }

        if (mouseY < rect.top + edgeThreshold) {
            this.scrollY = Math.max(0, this.scrollY - scrollSpeed);
            scrolled = true;
        } else if (mouseY > rect.bottom - edgeThreshold) {
            this.scrollY += scrollSpeed;
            scrolled = true;
        }

        if (scrolled) {
            const localX = mouseX - rect.left;
            const localY = mouseY - rect.top;
            const cellPos = this.getCellFromPoint(localX, localY);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
            }
            this.render();
        }
    }

    /**
     * show the input box over the selected cell
     * @param {*index} row selected cell's row's index
     * @param {*index} col selceted cell's column's index
     */
    showCellEditor(row, col, initialChar = null) {

        const cell = this.cellData.getCell(row, col);
        const rect = this.getCellRect(row, col);
        const canvasRect = this.canvas.getBoundingClientRect();

        const editor = document.createElement('input');
        editor.type = 'text';
        editor.className = 'cell-input';
        editor.value = cell.value || '';

        editor.style.position = 'absolute';
        editor.style.left = (canvasRect.left + rect.x) + 'px';
        editor.style.top = (canvasRect.top + rect.y) + 'px';
        editor.style.width = rect.width + 'px';
        editor.style.height = rect.height + 'px';
        editor.style.zIndex = 1000;

        document.body.appendChild(editor);

        this.cellEditor = editor;
        this.updateCellReference();

        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);

        const handleMove = (targetRow, targetCol) => {
            this.selection.setActiveCell(targetRow, targetCol);
            this.cellDisplay(targetRow, targetCol);
            this.updateCellReference();
            this.render();
        };

        editor.addEventListener('keydown', (e) => {
            e.stopPropagation();
            const key = e.key;
            const shift = e.shiftKey;

            let shouldMove = false;
            let targetRow = row;
            let targetCol = col;

            if (key === 'Enter') {
                e.preventDefault();
                shouldMove = true;
                targetRow = shift ? Math.max(row - 1, 0) : Math.min(row + 1, this.cellData.rows - 1);
                targetCol = col;
            }

            else if (key === 'Tab') {
                e.preventDefault();
                shouldMove = true;
                targetRow = row;
                targetCol = shift ? Math.max(col - 1, 0) : Math.min(col + 1, this.cellData.cols - 1);
            }

            else if (key === 'Escape') {
                e.preventDefault();
                this.canvas.focus();
                this.hideCellEditor();
            }

            if (shouldMove) {
                this.hideCellEditor();
                this.commitCellEdit(row, col, editor.value);
                this.selection.setActiveCell(targetRow, targetCol);
                this.updateCellReference();
                this.render();
            }
        });

        editor.addEventListener('input', () => {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                formulaInput.value = editor.value;
            }
        });

        editor.addEventListener('blur', () => {
            this.commitCellEdit(row, col, editor.value);
        });
    }

    /**
     * make cell editors potion move with scroll
     */

    updateCellEditorPosition() {
        if (this.cellEditor) {
            const row = parseInt(this.cellEditor.dataset.row);
            const col = parseInt(this.cellEditor.dataset.col);
            const rect = this.getCellRect(row, col);

            this.cellEditor.style.left = (rect.x) + 'px';
            this.cellEditor.style.top = (rect.y) + 'px';
        }
    }

    /**
     * hide the cell editor
     */
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

        // Calculate total content dimensions
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }

        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }

        const contentWidth = this.viewportWidth - this.headerWidth - this.scrollbarWidth;
        const contentHeight = this.viewportHeight - this.headerHeight - this.scrollbarHeight;

        // Only allow scrolling if content is larger than viewport
        const maxScrollX = Math.max(0, totalWidth - contentWidth);
        const maxScrollY = Math.max(0, totalHeight - contentHeight);

        if (e.shiftKey) {
            // Horizontal scroll
            if (maxScrollX > 0) {
                this.scrollX = Math.max(0, Math.min(maxScrollX, this.scrollX + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed)));
            }
        } else {
            // Vertical scroll
            if (maxScrollY > 0) {
                this.scrollY = Math.max(0, Math.min(maxScrollY, this.scrollY + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed)));
            }
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

        const { row, col } = this.selection.activeCell;
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
                    e.preventDefault();
                    if (this.selection.selectedRanges.length > 0 && 
                        !(this.selection.selectedRanges[0].startRow === this.selection.selectedRanges[0].endRow && 
                          this.selection.selectedRanges[0].startCol === this.selection.selectedRanges[0].endCol)) {
                        // Area is selected, move within selection
                        const range = this.selection.selectedRanges[0];
                        if (e.shiftKey) {
                            // Move up within selection
                            if (row > range.startRow) {
                                newRow = row - 1;
                            } else {
                                newRow = range.endRow;
                                if (col > range.startCol) {
                                    newCol = col - 1;
                                } else {
                                    newCol = range.endCol;
                                }
                            }
                        } else {
                            // Move down within selection
                            if (row < range.endRow) {
                                newRow = row + 1;
                            } else {
                                newRow = range.startRow;
                                if (col < range.endCol) {
                                    newCol = col + 1;
                                } else {
                                    newCol = range.startCol;
                                }
                            }
                        }
                    } else {
                        newRow = e.shiftKey ? Math.max(0, row - 1) : Math.min(this.cellData.rows - 1, row + 1);
                    }
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (this.selection.selectedRanges.length > 0 && 
                        !(this.selection.selectedRanges[0].startRow === this.selection.selectedRanges[0].endRow && 
                          this.selection.selectedRanges[0].startCol === this.selection.selectedRanges[0].endCol)) {
                        // Area is selected, move within selection
                        const range = this.selection.selectedRanges[0];
                        if (e.shiftKey) {
                            // Move left within selection
                            if (col > range.startCol) {
                                newCol = col - 1;
                            } else {
                                newCol = range.endCol;
                                if (row > range.startRow) {
                                    newRow = row - 1;
                                } else {
                                    newRow = range.endRow;
                                }
                            }
                        } else {
                            if (col < range.endCol) {
                                newCol = col + 1;
                            } else {
                                newCol = range.startCol;
                                if (row < range.endRow) {
                                    newRow = row + 1;
                                } else {
                                    newRow = range.startRow;
                                }
                            }
                        }
                    } else {
                        newCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(this.cellData.cols - 1, col + 1);
                    }
                    break;
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
                if (e.key.length === 1) {
                    const oldCell = this.cellData.getCell(row, col);
                    const oldValue = oldCell.value || '';
                
                    const command = new SetCellValueCommand(this, row, col, '', oldValue);
                    this.commandManager.execute(command);
                    this.render();
                
                    this.showCellEditor(row, col, e.key);
                }                
                return;
        }

        if (newRow !== row || newCol !== col) {
            const isAreaSelected = this.selection.selectedRanges.length > 0 && 
                !(this.selection.selectedRanges[0].startRow === this.selection.selectedRanges[0].endRow && 
                  this.selection.selectedRanges[0].startCol === this.selection.selectedRanges[0].endCol);
            
            if ((e.key === 'Enter' || e.key === 'Tab') && isAreaSelected) {
                this.selection.activeCell = { row: newRow, col: newCol };
            } else if (e.shiftKey && (e.key.startsWith('Arrow'))) {
                if (!this.selection.isSelecting) {
                    this.selection.startSelection(row, col);
                }
                this.selection.updateSelection(newRow, newCol);
                this.selection.activeCell = { row: newRow, col: newCol };
            } else {
                this.selection.setActiveCell(newRow, newCol);
                this.selection.endSelection();
            }
            this.cellDisplay(newRow, newCol);
            this.updateCellReference();
            this.render();
        }
    }

    /**
     * handles the resize and redraw on resize
     */
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

    /**
     * cancels the edit and according to edit update the formula bar
     */
    cancelEdit() {
        this.isEditing = false;
        this.updateFormulaBar();
    }

    /**
     * update formula bar based on editing the cell
     */
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

    /**
     * undo function
     */
    undo() {
        if (this.commandManager.undo()) {
            this.updateCellReference();
            this.updateFormulaBar();
            this.render();
        }
    }

    /**
     * redo function
     */
    redo() {
        if (this.commandManager.redo()) {
            this.updateCellReference();
            this.updateFormulaBar();
            this.render();
        }
    }

    /**
     * copy function
     */
    copy() {
        this.commandManager.copy(this);
    }

    /**
     * cut function
     */
    cut() {
        this.commandManager.cut(this);
        this.updateFormulaBar();
        this.render();
    }

    /**
     * paste function
     */
    paste() {
        this.commandManager.paste(this);
        this.updateFormulaBar();
        this.render();
    }

    /**
     * remove the selection area
     */
    clearSelectedCells() {
        const cells = this.selection.getSelectedCells();
        const clearCommands = [];
        
        cells.forEach(pos => {
            const oldCell = this.cellData.getCell(pos.row, pos.col);
            if (oldCell.value) {
                const command = new ClearCellCommand(this, pos.row, pos.col, oldCell.value);
                clearCommands.push(command);
            }
        });
        
        if (clearCommands.length > 0) {
            this.commandManager.executeBatch(clearCommands);
        }
        
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

    /**
     * updte cell reference on movement of active cell
     */
    updateCellReference() {
        const cellRef = document.getElementById('cellReference');
        if (cellRef) {
            if (this.selection.selectionType === 'column') {
                if (this.selection.selectedCols.length === 1) {
                    const col = this.selection.activeCell.col;
                    cellRef.textContent = this.getColumnName(col);
                } else {
                    cellRef.textContent = `${this.selection.selectedCols.length} columns selected`;
                }
            }
            else if (this.selection.selectionType === 'row') {
                if (this.selection.selectedRows.length === 1) {
                    const row = this.selection.activeCell.row + 1;
                    cellRef.textContent = row.toString();
                } else {
                    cellRef.textContent = `${this.selection.selectedRows.length} rows selected`;
                }
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
        const clampedX = Math.max(this.headerWidth, Math.min(x, this.viewportWidth - this.scrollbarWidth));
        const clampedY = Math.max(this.headerHeight, Math.min(y, this.viewportHeight - this.scrollbarHeight));

        let currentY = this.headerHeight - this.scrollY;
        let row = -1;
        for (let r = 0; r < this.cellData.rows; r++) {
            const height = this.cellData.getRowHeight(r);
            if (clampedY >= currentY && clampedY < currentY + height) {
                row = r;
                break;
            }
            currentY += height;
        }

        if (row === -1 && clampedY >= currentY) {
            row = this.cellData.rows - 1;
        }

        let currentX = this.headerWidth - this.scrollX;
        let col = -1;
        for (let c = 0; c < this.cellData.cols; c++) {
            const width = this.cellData.getColWidth(c);
            if (clampedX >= currentX && clampedX < currentX + width) {
                col = c;
                break;
            }
            currentX += width;
        }

        if (col === -1 && clampedX >= currentX) {
            col = this.cellData.cols - 1;
        }

        return (row >= 0 && col >= 0) ? { row, col } : null;
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

    /**
     * draw canvas
     */
    render() {
        this.detectZoomChange();
        this.ctx.clearRect(-0.5, -0.5, this.viewportWidth + 1, this.viewportHeight + 1);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.drawGrid();
        this.drawCells();
        this.drawHeaders();
        this.drawSelection();
        this.drawScrollbars();
        this.updateCellEditorPosition();
    }

    /**
     * draw lines for raw and column
     */
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

    /**
     * from total col it calculate total width
     * @returns total width of excel
     */
    getTotalWidth() {
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }
        return totalWidth;
    }

    /**
     * from total row it calculate total height
     * @returns total height of excel
     */
    getTotalHeight() {
        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }
        return totalHeight;
    }

    /**
     * cell value display
     */
    drawCells() {
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';

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
                            const displayValue = cell.getDisplayValue();
                            const numericRegex = /^\s*[\d,]+(\.\d+)?\s*$/;
                            const cleaned = displayValue.replace(/,/g, '');
                            const isNumeric = numericRegex.test(displayValue) && !isNaN(parseFloat(cleaned));


                            this.ctx.fillStyle = '#000000';
                            this.ctx.textAlign = isNumeric ? 'right' : 'left';
                            this.ctx.textBaseline = 'bottom';

                            const paddingX = 6;
                            const textX = isNumeric ? (x + width - paddingX) : (x + paddingX);
                            const textY = y + height - 6;

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

    /**
     * Draw Row and Column Header and colors header on selection
     */
    drawHeaders() {
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

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
                    this.selection.selectedCols.includes(col);

                const isEntireColSelected = this.selection.selectedCols.includes(col);

                this.ctx.fillStyle = isEntireColSelected ? '#107c41' : (isSelected ? '#CAEAD8' : '#F5F5F5');
                this.ctx.fillRect(x, 0, width, this.headerHeight);

                this.ctx.strokeStyle = '#d0d0d0';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.rect(x, 0, width, this.headerHeight);
                this.ctx.stroke();

                if (isSelected) {
                    this.ctx.strokeStyle = '#137E43';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, this.headerHeight);
                    this.ctx.lineTo(x + width, this.headerHeight);
                    this.ctx.stroke();
                }

                this.ctx.fillStyle = isEntireColSelected ? '#ffffff' : '#616161';
                this.ctx.font = 'normal 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.getColumnName(col), x + width / 2, this.headerHeight / 2);
            }
            x += width;
        }

        // Draw row headers
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, this.headerHeight, this.headerWidth, this.viewportHeight - this.headerHeight);

        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            if (y + height >= this.headerHeight) {
                const isSelected = this.selection.selectedRanges.some(range =>
                    row >= range.startRow && row <= range.endRow
                ) || row === this.selection.activeCell.row ||
                    this.selection.selectedRows.includes(row);

                const isEntireRowSelected = this.selection.selectedRows.includes(row);

                this.ctx.fillStyle = isEntireRowSelected ? '#107c41' : (isSelected ? '#CAEAD8' : '#F5F5F5');
                this.ctx.fillRect(0, y, this.headerWidth, height);

                this.ctx.strokeStyle = '#d0d0d0';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.rect(0, y, this.headerWidth, height);
                this.ctx.stroke();

                if (isSelected) {
                    this.ctx.strokeStyle = '#137E43';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.headerWidth, y);
                    this.ctx.lineTo(this.headerWidth, y + height);
                    this.ctx.stroke();
                }

                this.ctx.fillStyle = isEntireRowSelected ? '#ffffff' : '#616161';
                this.ctx.font = 'normal 12px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText((row + 1).toString(), this.headerWidth - 6, y + height / 2);
            }
            y += height;
        }

        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.stroke();
    }

    /**
     * Draws selected range and active cell border.
     */
    drawSelection() {
        const active = this.selection.activeCell;
        const activeRect = this.getCellRect(active.row, active.col);

        const hasMultiCellSelection = this.selection.selectedRanges.some(range =>
            !(range.startRow === range.endRow && range.startCol === range.endCol)
        );

        this.selection.selectedRanges.forEach(range => {
            const isSingle = range.startRow === range.endRow && range.startCol === range.endCol;
            if (isSingle) return;

            const startRect = this.getCellRect(range.startRow, range.startCol);
            const endRect = this.getCellRect(range.endRow, range.endCol);

            const x = startRect.x;
            const y = startRect.y;
            const width = endRect.x + endRect.width - startRect.x;
            const height = endRect.y + endRect.height - startRect.y;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(19, 126, 67, 0.1)';
            this.ctx.fillRect(x, y, width, height);

            this.ctx.strokeStyle = '#137E43';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.restore();
        });

        const cell = this.cellData.getCell(active.row, active.col);
        const displayValue = cell.getDisplayValue();

        const numericRegex = /^\s*[\d,]+(\.\d+)?\s*$/;
        const cleaned = displayValue.replace(/,/g, '');
        const isNumeric = numericRegex.test(displayValue) && !isNaN(parseFloat(cleaned));

        this.ctx.save();

        if (hasMultiCellSelection) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(activeRect.x + 2, activeRect.y + 2, activeRect.width - 4, activeRect.height - 4);
        } else {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(activeRect.x, activeRect.y, activeRect.width, activeRect.height);

            this.ctx.strokeStyle = '#137E43';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(activeRect.x, activeRect.y, activeRect.width, activeRect.height);
        }

        this.ctx.fillStyle = '#000000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = isNumeric ? 'right' : 'left';
        this.ctx.textBaseline = 'bottom';

        const paddingX = 6;
        const textX = isNumeric
            ? (activeRect.x + activeRect.width - paddingX)
            : (activeRect.x + paddingX);
        const textY = activeRect.y + activeRect.height - 6;

        this.ctx.beginPath();
        this.ctx.rect(activeRect.x, activeRect.y, activeRect.width, activeRect.height);
        this.ctx.clip();
        this.ctx.fillText(displayValue, textX, textY);

        this.ctx.restore();
    }
}