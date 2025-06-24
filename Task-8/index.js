class Command {
    execute() {
        throw new Error('Must implement execute');
    }
    undo() {
        throw new Error('Must implement undo');
    }
    getDescription() {
        return 'Command';
    }
}

class SetCellValueCommand extends Command {
    constructor(grid, row, col, newValue, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValueDirect(this.row, this.col, this.newValue);
    }

    undo() {
        this.grid.setCellValueDirect(this.row, this.col, this.oldValue);
    }

    getDescription() {
        const colName = this.grid.getColumnName(this.col);
    }
}

class ClearCellCommand extends Command {
    constructor(grid, row, col, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValueDirect(this.row, this.col, '');
    }

    undo() {
        this.grid.setCellValueDirect(this.row, this.col, this.oldValue);
    }

    getDescription() {
        const colName = this.grid.getColumnName(this.col);
    }
}

class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = 100;
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];

        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }

        this.textChange();
    }

    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.textChange();
            return true;
        }
        return false;
    }

    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.textChange();
            return true;
        }
        return false;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    textChange() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            if (this.canUndo()) {
                const lastCommand = this.undoStack[this.undoStack.length - 1];
                undoBtn.setAttribute('data-tooltip', `Undo: ${lastCommand.getDescription()}`);
            } else {
                undoBtn.setAttribute('data-tooltip', 'Nothing to undo');
            }
        }

        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            if (this.canRedo()) {
                const nextCommand = this.redoStack[this.redoStack.length - 1];
                redoBtn.setAttribute('data-tooltip', `Redo: ${nextCommand.getDescription()}`);
            } else {
                redoBtn.setAttribute('data-tooltip', 'Nothing to redo');
            }
        }
    }
}

class Cell {
    constructor(row, col, value = '') {
        this.row = row;
        this.col = col;
        this.value = value;
        this.type = this.detectType(value);
        this.formula = null;
        this.format = null;
    }

    detectType(value) {
        if (value === '' || value == null) return 'empty';
        if (typeof value === 'string' && value.startsWith('=')) return 'formula';
        if (!isNaN(value) && !isNaN(parseFloat(value))) return 'number';
        if (value instanceof Date) return 'date';
        return 'text';
    }

    setValue(value) {
        this.value = value;
        this.type = this.detectType(value);
        if (this.type === 'formula') {
            this.formula = value;
        }
    }

    getDisplayValue() {
        switch (this.type) {
            case 'number':
                return parseFloat(this.value).toLocaleString();
            case 'formula':
                return this.evaluateFormula();
            case 'date':
                return this.value.toLocaleDateString();
            default:
                return this.value.toString();
        }
    }

    evaluateFormula() {
        if (this.formula && this.formula.startsWith('=')) {
            try {
                const expression = this.formula.substring(1);
                if (/^[\d+\-*/().\s]+$/.test(expression)) {
                    return eval(expression).toString();
                }
            } catch (e) {
                return '#ERROR!';
            }
        }
        return this.value;
    }
}

class CellData {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Map();
        this.rowHeights = new Array(rows).fill(25);
        this.colWidths = new Array(cols).fill(100);
        this.frozenRows = 0;
        this.frozenCols = 0;
    }

    getCell(row, col) {
        const key = `${row},${col}`;
        return this.data.get(key) || new Cell(row, col);
    }

    setCell(row, col, value) {
        const key = `${row},${col}`;
        const cell = new Cell(row, col, value);
        this.data.set(key, cell);
        return cell;
    }

    deleteCell(row, col) {
        const key = `${row},${col}`;
        this.data.delete(key);
    }

    getRowHeight(row) {
        return this.rowHeights[row] || 25;
    }

    setRowHeight(row, height) {
        this.rowHeights[row] = Math.max(15, height);
    }

    getColWidth(col) {
        return this.colWidths[col] || 100;
    }

    setColWidth(col, width) {
        this.colWidths[col] = Math.max(30, width);
    }

    getAllCells() {
        const cells = [];
        for (const [key, cell] of this.data) {
            cells.push(cell);
        }
        return cells;
    }
}

class SelectionManager {
    constructor() {
        this.activeCell = {
            row: 0,
            col: 0
        };
        this.selectedRanges = [];
        this.isSelecting = false;
        this.selectionStart = null;
        this.copiedCells = null;
    }

    setActiveCell(row, col) {
        this.activeCell = {
            row,
            col
        };
        this.selectedRanges = [{
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        }];
    }

    startSelection(row, col) {
        this.isSelecting = true;
        this.selectionStart = {
            row,
            col
        };
        this.activeCell = {
            row,
            col
        };
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
        this.selectedRanges.forEach(range => {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startCol; col <= range.endCol; col++) {
                    cells.push({
                        row,
                        col
                    });
                }
            }
        });
        return cells;
    }
}

class sheetManager {
    constructor(canvasId, rows, cols) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        this.cellData = new CellData(rows, cols);
        this.selection = new SelectionManager();
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

        this.setupCanvas();
        this.setupEventListeners();
        this.setupScrollbars();
        this.generateSampleData();
        this.render();
        this.textChange();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.viewportWidth = rect.width - 20;
        this.viewportHeight = rect.height - 20;

        this.canvas.width = this.viewportWidth * this.dpr;
        this.canvas.height = this.viewportHeight * this.dpr;
        this.canvas.style.width = this.viewportWidth + 'px';
        this.canvas.style.height = this.viewportHeight + 'px';

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

        window.addEventListener('resize', this.handleResize.bind(this));

        this.setupFormulaInputEvents();
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

    setupScrollbars() {
        const hScrollbar = document.getElementById('h-scrollbar');
        const hThumb = document.getElementById('h-thumb');

        const vScrollbar = document.getElementById('v-scrollbar');
        const vThumb = document.getElementById('v-thumb');

        this.updateScrollbars();
    }

    generateSampleData() {
        const headers = ['ID', 'firstName', 'LastName', 'Age', 'Salary'];
        headers.forEach((header, col) => {
            this.cellData.setCell(0, col, header);
        });

        // Generate sample data
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

    handleMouseDown(e) {
        this.canvas.focus();

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.getCellFromPoint(x, y);
        if (cellPos) {
            if (e.shiftKey) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
            } else {
                this.selection.startSelection(cellPos.row, cellPos.col);
                this.isDragging = true;
            }
            this.textChange();
            this.render();
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const cellPos = this.getCellFromPoint(x, y);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
                this.render();
            }
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.selection.endSelection();
            this.isDragging = false;
        }
    }

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.getCellFromPoint(x, y);
        if (cellPos) {
            this.startEdit(cellPos.row, cellPos.col);
        }
    }

    handleWheel(e) {
        e.preventDefault();

        const scrollSpeed = 50;
        if (e.shiftKey) {
            this.scrollX = Math.max(0, this.scrollX + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        } else {
            this.scrollY = Math.max(0, this.scrollY + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        }

        this.updateScrollbars();
        this.render();
    }

    handleKeyDown(e) {
        if (this.isEditing) return;

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
                case 's':
                    e.preventDefault();
                    this.save();
                    break;
                case 'o':
                    e.preventDefault();
                    this.load();
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
                this.startEdit(row, col);
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
                    this.startEdit(row, col, e.key);
                    return;
                }
        }

        if (newRow !== row || newCol !== col) {
            this.selection.setActiveCell(newRow, newCol);
            this.ensureCellVisible(newRow, newCol);
            this.textChange();
            this.render();
        }
    }

    handleResize() {
        this.setupCanvas();
        this.updateScrollbars();
        this.render();
    }

    getCellFromPoint(x, y) {
        if (x < this.headerWidth || y < this.headerHeight) return null;

        const adjustedX = x - this.headerWidth + this.scrollX;
        const adjustedY = y - this.headerHeight + this.scrollY;

        let col = 0;
        let currentX = 0;
        while (col < this.cellData.cols && currentX < adjustedX) {
            currentX += this.cellData.getColWidth(col);
            col++;
        }
        col = Math.max(0, col - 1);

        let row = 0;
        let currentY = 0;
        while (row < this.cellData.rows && currentY < adjustedY) {
            currentY += this.cellData.getRowHeight(row);
            row++;
        }
        row = Math.max(0, row - 1);

        if (col < this.cellData.cols && row < this.cellData.rows) {
            return {
                row,
                col
            };
        }
        return null;
    }

    getCellRect(row, col) {
        let x = this.headerWidth;
        for (let c = 0; c < col; c++) {
            x += this.cellData.getColWidth(c);
        }
        x -= this.scrollX;

        let y = this.headerHeight;
        for (let r = 0; r < row; r++) {
            y += this.cellData.getRowHeight(r);
        }
        y -= this.scrollY;

        return {
            x,
            y,
            width: this.cellData.getColWidth(col),
            height: this.cellData.getRowHeight(row)
        };
    }

    ensureCellVisible(row, col) {
        const rect = this.getCellRect(row, col);
        const viewRight = this.viewportWidth - this.headerWidth;
        const viewBottom = this.viewportHeight - this.headerHeight;

        if (rect.x < this.headerWidth) {
            this.scrollX = Math.max(0, this.scrollX - (this.headerWidth - rect.x));
        } else if (rect.x + rect.width > viewRight) {
            this.scrollX += (rect.x + rect.width - viewRight);
        }

        if (rect.y < this.headerHeight) {
            this.scrollY = Math.max(0, this.scrollY - (this.headerHeight - rect.y));
        } else if (rect.y + rect.height > viewBottom) {
            this.scrollY += (rect.y + rect.height - viewBottom);
        }

        this.updateScrollbars();
    }

    startEdit(row, col, initialValue = '') {
        this.isEditing = true;
        const cell = this.cellData.getCell(row, col);
        const formulaInput = document.getElementById('formulaInput');

        if (formulaInput) {
            formulaInput.value = initialValue || cell.value || '';
            formulaInput.focus();
            if (initialValue) {
                formulaInput.setSelectionRange(1, 1);
            } else {
                formulaInput.select();
            }
        }
    }

    commitEdit(value) {
        if (!this.isEditing) return;

        const {
            row,
            col
        } = this.selection.activeCell;
        const oldCell = this.cellData.getCell(row, col);
        const oldValue = oldCell.value || '';

        if (value !== oldValue) {
            const command = new SetCellValueCommand(this, row, col, value, oldValue);
            this.commandManager.execute(command);
            this.render();
        }

        this.isEditing = false;
        this.textChange();
    }

    cancelEdit() {
        this.isEditing = false;
        this.textChange();
    }

    setCellValueDirect(row, col, value) {
        this.cellData.setCell(row, col, value);
    }

    clearSelectedCells() {
        const selectedCells = this.selection.getSelectedCells();
        selectedCells.forEach(({
            row,
            col
        }) => {
            const oldValue = this.cellData.getCell(row, col).value || '';
            if (oldValue) {
                const command = new ClearCellCommand(this, row, col, oldValue);
                this.commandManager.execute(command);
            }
        });
        this.render();
    }

    copy() {
        const selectedCells = this.selection.getSelectedCells();
        this.selection.copiedCells = selectedCells.map(({
            row,
            col
        }) => ({
            row,
            col,
            value: this.cellData.getCell(row, col).value || ''
        }));

        const textData = this.getCellsAsText(selectedCells);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textData).catch(() => {});
        }
    }

    paste() {
        if (!this.selection.copiedCells || this.selection.copiedCells.length === 0) return;

        const {
            row: startRow,
            col: startCol
        } = this.selection.activeCell;
        const copiedCells = this.selection.copiedCells;

        const minRow = Math.min(...copiedCells.map(cell => cell.row));
        const minCol = Math.min(...copiedCells.map(cell => cell.col));

        copiedCells.forEach(({
            row,
            col,
            value
        }) => {
            const newRow = startRow + (row - minRow);
            const newCol = startCol + (col - minCol);

            if (newRow < this.cellData.rows && newCol < this.cellData.cols) {
                const oldValue = this.cellData.getCell(newRow, newCol).value || '';
                if (value !== oldValue) {
                    const command = new SetCellValueCommand(this, newRow, newCol, value, oldValue);
                    this.commandManager.execute(command);
                }
            }
        });

        this.render();
    }

    cut() {
        this.copy();
        this.clearSelectedCells();
    }

    getCellsAsText(cells) {
        if (cells.length === 0) return '';

        const rowMap = new Map();
        cells.forEach(({
            row,
            col
        }) => {
            if (!rowMap.has(row)) {
                rowMap.set(row, []);
            }
            rowMap.get(row).push({
                col,
                value: this.cellData.getCell(row, col).getDisplayValue()
            });
        });

        const rows = Array.from(rowMap.entries()).sort(([a], [b]) => a - b);
        return rows.map(([row, cols]) => {
            const sortedCols = cols.sort((a, b) => a.col - b.col);
            return sortedCols.map(cell => cell.value).join('\t');
        }).join('\n');
    }

    undo() {
        if (this.commandManager.undo()) {
            this.render();
        }
    }

    redo() {
        if (this.commandManager.redo()) {
            this.render();
        }
    }

    save() {
        const data = {
            rows: this.cellData.rows,
            cols: this.cellData.cols,
            cells: this.cellData.getAllCells().map(cell => ({
                row: cell.row,
                col: cell.col,
                value: cell.value,
                type: cell.type
            })),
            rowHeights: this.cellData.rowHeights,
            colWidths: this.cellData.colWidths
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'excel-grid-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    load() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        this.loadFromData(data);
                    } catch (error) {
                        alert('Error loading file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadFromData(data) {
        this.cellData = new CellData(data.rows, data.cols);

        if (data.cells) {
            data.cells.forEach(CellData => {
                this.cellData.setCell(CellData.row, CellData.col, CellData.value);
            });
        }

        if (data.rowHeights) {
            this.cellData.rowHeights = data.rowHeights;
        }

        if (data.colWidths) {
            this.cellData.colWidths = data.colWidths;
        }

        this.selection = new SelectionManager();
        this.commandManager = new CommandManager();
        this.scrollX = 0;
        this.scrollY = 0;

        this.updateScrollbars();
        this.textChange();
        this.render();
    }

    getColumnName(col) {
        let result = '';
        while (col >= 0) {
            result = String.fromCharCode(65 + (col % 26)) + result;
            col = Math.floor(col / 26) - 1;
        }
        return result;
    }

    textChange() {
        const {
            row,
            col
        } = this.selection.activeCell;
        const cellRef = this.getColumnName(col) + (row + 1);

        const cellRefElement = document.getElementById('cellReference');
        if (cellRefElement) {
            cellRefElement.textContent = cellRef;
        }

        const selectionInfo = document.getElementById('selection-info');
        if (selectionInfo) {
            if (this.selection.selectedRanges.length > 0) {
                const range = this.selection.selectedRanges[0];
                if (range.startRow === range.endRow && range.startCol === range.endCol) {
                    selectionInfo.textContent = cellRef;
                } else {
                    const startRef = this.getColumnName(range.startCol) + (range.startRow + 1);
                    const endRef = this.getColumnName(range.endCol) + (range.endRow + 1);
                    selectionInfo.textContent = `${startRef}:${endRef}`;
                }
            } else {
                selectionInfo.textContent = cellRef;
            }
        }

        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput && !this.isEditing) {
            const cell = this.cellData.getCell(row, col);
            formulaInput.value = cell.value || '';
        }

        this.commandManager.textChange();
    }

    updateScrollbars() {
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }

        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }

        const viewportWidth = this.viewportWidth - this.headerWidth;
        const viewportHeight = this.viewportHeight - this.headerHeight;

        const hScrollbar = document.getElementById('h-scrollbar');
        const hThumb = document.getElementById('h-thumb');
        if (hScrollbar && hThumb) {
            const thumbWidth = Math.max(20, (viewportWidth / totalWidth) * viewportWidth);
            const thumbLeft = (this.scrollX / (totalWidth - viewportWidth)) * (viewportWidth - thumbWidth);

            hThumb.style.width = thumbWidth + 'px';
            hThumb.style.left = Math.max(0, Math.min(thumbLeft, viewportWidth - thumbWidth)) + 'px';
        }

        const vScrollbar = document.getElementById('v-scrollbar');
        const vThumb = document.getElementById('v-thumb');
        if (vScrollbar && vThumb) {
            const thumbHeight = Math.max(20, (viewportHeight / totalHeight) * viewportHeight);
            const thumbTop = (this.scrollY / (totalHeight - viewportHeight)) * (viewportHeight - thumbHeight);

            vThumb.style.height = thumbHeight + 'px';
            vThumb.style.top = Math.max(0, Math.min(thumbTop, viewportHeight - thumbHeight)) + 'px';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.drawHeaders();

        this.drawCells();

        this.drawSelection();

        this.drawGridLines();
    }

    drawHeaders() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(this.headerWidth, 0, this.viewportWidth - this.headerWidth, this.headerHeight);

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Segoe UI';
        this.ctx.textAlign = 'center';

        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
            const width = this.cellData.getColWidth(col);
            if (x + width > this.headerWidth) {
                const colName = this.getColumnName(col);
                this.ctx.fillText(colName, x + width / 2, this.headerHeight / 2);
            }
            x += width;
        }

        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, this.headerHeight, this.headerWidth, this.viewportHeight - this.headerHeight);

        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'center';

        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            if (y + height > this.headerHeight) {
                this.ctx.fillText((row + 1).toString(), this.headerWidth / 2, y + height / 2);
            }
            y += height;
        }

        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);

        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1 / this.dpr;
        this.ctx.beginPath();
        this.ctx.moveTo(this.headerWidth, 0);
        this.ctx.lineTo(this.headerWidth, this.viewportHeight);
        this.ctx.moveTo(0, this.headerHeight);
        this.ctx.lineTo(this.viewportWidth, this.headerHeight);
        this.ctx.stroke();
    }

    drawCells() {
        this.ctx.font = '13px Segoe UI';
        this.ctx.textAlign = 'left';

        let startRow = Math.floor(this.scrollY / 25);
        let endRow = Math.min(this.cellData.rows, startRow + Math.ceil(this.viewportHeight / 25) + 2);

        let startCol = 0;
        let totalWidth = 0;
        while (startCol < this.cellData.cols && totalWidth < this.scrollX) {
            totalWidth += this.cellData.getColWidth(startCol);
            startCol++;
        }
        startCol = Math.max(0, startCol - 1);

        let endCol = startCol;
        let currentWidth = totalWidth - this.scrollX + this.headerWidth;
        while (endCol < this.cellData.cols && currentWidth < this.viewportWidth) {
            currentWidth += this.cellData.getColWidth(endCol);
            endCol++;
        }

        for (let row = startRow; row < endRow; row++) {
            let x = this.headerWidth - this.scrollX;
            for (let col = 0; col < startCol; col++) {
                x += this.cellData.getColWidth(col);
            }

            for (let col = startCol; col < endCol; col++) {
                const width = this.cellData.getColWidth(col);
                const height = this.cellData.getRowHeight(row);
                const y = this.headerHeight + row * height - this.scrollY;

                const cell = this.cellData.getCell(row, col);
                const displayValue = cell.getDisplayValue();

                if (displayValue) {
                    // Cell background for data rows
                    if (row % 2 === 1) {
                        this.ctx.fillStyle = '#fafafa';
                        this.ctx.fillRect(x, y, width, height);
                    }
                    // Cell text
                    this.ctx.fillStyle = '#333';
                    this.ctx.fillText(
                        displayValue.toString().substring(0, 15),
                        x + 6,
                        y + height / 2
                    );
                }

                x += width;
            }
        }
    }

    drawSelection() {
        this.ctx.strokeStyle = '#137E43';
        this.ctx.lineWidth = 2 / this.dpr;
        this.ctx.fillStyle = 'rgba(19, 126, 67,.05)';

        this.selection.selectedRanges.forEach(range => {
            let startX = this.headerWidth - this.scrollX;
            for (let col = 0; col < range.startCol; col++) {
                startX += this.cellData.getColWidth(col);
            }

            let width = 0;
            for (let col = range.startCol; col <= range.endCol; col++) {
                width += this.cellData.getColWidth(col);
            }

            const startY = this.headerHeight + range.startRow * 25 - this.scrollY;
            const height = (range.endRow - range.startRow + 1) * 25;

            this.ctx.fillRect(startX, startY, width, height);

            this.ctx.strokeRect(startX, startY, width, height);
        });

        const {
            row,
            col
        } = this.selection.activeCell;
        const rect = this.getCellRect(row, col);
        this.ctx.lineWidth = 3 / this.dpr;
        this.ctx.strokeStyle = 'rgba(19, 126, 67,1)';
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    drawGridLines() {
        const dpr = window.devicePixelRatio || 1;

        this.ctx.save();
        this.ctx.scale(dpr, dpr);

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1 / this.dpr;

        this.ctx.beginPath();

        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col <= this.cellData.cols && x < this.viewportWidth; col++) {
            if (x >= this.headerWidth) {
                this.ctx.moveTo(Math.floor(x) + 0.5, this.headerHeight);
                this.ctx.lineTo(Math.floor(x) + 0.5, this.viewportHeight);
            }
            if (col < this.cellData.cols) {
                x += this.cellData.getColWidth(col);
            }
        }

        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row <= this.cellData.rows && y < this.viewportHeight; row++) {
            if (y >= this.headerHeight) {
                this.ctx.moveTo(this.headerWidth, Math.floor(y) + 0.5);
                this.ctx.lineTo(this.viewportWidth, Math.floor(y) + 0.5);
            }
            if (row < this.cellData.rows) {
                y += this.cellData.getRowHeight(row);
            }
        }

        this.ctx.stroke();
        this.ctx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = new sheetManager('grid-canvas', 10000, 500);
    window.excelGrid = grid;
});