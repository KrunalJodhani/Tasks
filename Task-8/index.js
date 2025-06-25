class sheetManager {
    /**
     * 
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
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));

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

    updateCursor(x, y) {
        const resizeInfo = this.getResizeInfo(x, y);
        if (resizeInfo) {
            this.canvas.style.cursor = resizeInfo.type === 'col' ? 'col-resize' : 'row-resize';
        } else {
            this.canvas.style.cursor = 'cell';
        }
    }

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
    }

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
        }
    }

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.getCellFromPoint(x, y);
        if (cellPos) {
            this.showCellEditor(cellPos.row, cellPos.col);
        }
    }

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

    handleWheel(e) {

        const scrollSpeed = 150;
        if (e.shiftKey) {
            this.scrollX = Math.max(0, this.scrollX + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        } else {
            this.scrollY = Math.max(0, this.scrollY + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed));
        }
        this.render();
    }

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

    setCellValueDirect(row, col, value) {
        if (value === '' || value == null) {
            this.cellData.deleteCell(row, col);
        } else {
            this.cellData.setCell(row, col, value);
        }
    }

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
            const {
                row,
                col
            } = this.selection.activeCell;
            cellRef.textContent = this.getColumnName(col) + (row + 1);
        }
        this.updateFormulaBar();
    }

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
        this.ctx.clearRect(-0.5, -0.5, this.viewportWidth, this.viewportHeight);

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

        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
            const width = this.cellData.getColWidth(col);
            if (x + width >= this.headerWidth) {
                // Draw header border
                this.ctx.beginPath();
                this.ctx.rect(x, 0, width, this.headerHeight);
                this.ctx.stroke();

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

        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            if (y + height >= this.headerHeight) {
                // Draw header border
                this.ctx.beginPath();
                this.ctx.rect(0, y, this.headerWidth, height);
                this.ctx.stroke();

                // Draw header text
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText((row + 1).toString(), this.headerWidth / 2, y + height / 2);
            }
            y += height;
        }

        // Draw corner
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
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
    /**
     * 
     * @param {*object} grid reference of grid or cell
     * @param {*number} row 
     * @param {*number} col 
     * @param {*number} newValue 
     * @param {*number} oldValue 
     */
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
        return `Set ${colName}${this.row + 1}`;
    }
}

class ClearCellCommand extends Command {
    /**
     * 
     * @param {object} grid reference f grid or cell
     * @param {*number} row row number
     * @param {*number} col column number
     * @param {*String} oldValue cell value
     */
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
        return `Clear ${colName}${this.row + 1}`;
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

        this.updateButtons();
    }

    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.updateButtons();
            return true;
        }
        return false;
    }

    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.updateButtons();
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

    updateButtons() {
        // Button update logic if needed
    }
}

class Cell {
    /**
     * 
     * @param {number} row row number
     * @param {*number} col column number
     * @param {*String} value cell's value or inputed text
     */
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
        if (!isNaN(value) && !isNaN(parseFloat(value))) return 'number';
        return 'text';
    }

    getDisplayValue() {
        switch (this.type) {
            case 'number':
                return parseFloat(this.value).toLocaleString();
            default:
                return this.value.toString();
        }
    }
}

class CellData {
    /**
     * 
     * @param {number} rows row number
     * @param {*number} cols column number
     */
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

const grid = new sheetManager('grid-canvas', 100000, 500);

document.addEventListener('DOMContentLoaded', () => {
    grid.canvas.focus();
});
grid.canvas.focus();