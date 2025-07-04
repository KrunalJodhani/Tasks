import { SetCellValueCommand } from './SetCellValueCommand.js';
import { ClearCellCommand } from './ClearCellCommand.js';
import { CommandManager } from './CommandManager.js';
import { CellData } from './CellData.js';
import { SelectionManager } from './SelectionManager.js';

export class SheetManager {
    
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

        this.setupCanvas();
        this.setupEventListeners();
        this.generateSampleData();
        this.render();
        this.updateCellReference();
    }

    
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

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.translate(0.5, 0.5);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
    }

    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

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
    
    updateStatusBar() {
        const stats = this.calculateSelectionStats();

        document.getElementById('statusCount').textContent = stats.count > 1 ? stats.count : 0;
        document.getElementById('statusSum').textContent = stats.sum.toLocaleString();
        document.getElementById('statusAverage').textContent = stats.count > 1 ? stats.average.toFixed(2) : '0';
        document.getElementById('statusMin').textContent = stats.count > 1 ? stats.min.toLocaleString() : '0';
        document.getElementById('statusMax').textContent = stats.count > 1 ? stats.max.toLocaleString() : '0';
    }

    drawScrollbars() {
        const scrollbarColor = '#A0A0A0';
        const scrollbarTrackColor = '#F0F0F0';

        
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

        
        if (totalWidth > contentWidth) {
            const trackWidth = availableContentWidth;
            const trackX = 0;
            const trackY = this.viewportHeight - this.scrollbarHeight;

            
            this.ctx.fillStyle = scrollbarTrackColor;
            this.ctx.fillRect(trackX, trackY, trackWidth, this.scrollbarHeight);

            
            const thumbWidth = Math.max(20, (contentWidth / totalWidth) * trackWidth);
            const maxScroll = Math.max(0, totalWidth - contentWidth);
            const thumbX = trackX + (this.scrollX / maxScroll) * (trackWidth - thumbWidth);

            
            this.ctx.fillStyle = scrollbarColor;
            this.ctx.fillRect(thumbX, trackY + 2, thumbWidth, this.scrollbarHeight - 4);

            
            this.ctx.strokeStyle = '#999999';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(thumbX, trackY + 2, thumbWidth, this.scrollbarHeight - 4);
        }
        
        if (totalHeight > contentHeight) {
            const trackHeight = availableContentHeight;
            const trackX = this.viewportWidth - this.scrollbarWidth;
            const trackY = 0;

            
            this.ctx.fillStyle = scrollbarTrackColor;
            this.ctx.fillRect(trackX, trackY, this.scrollbarWidth, trackHeight);

            
            const thumbHeight = Math.max(20, (contentHeight / totalHeight) * trackHeight);
            const maxScroll = Math.max(0, totalHeight - contentHeight);
            const thumbY = trackY + (this.scrollY / maxScroll) * (trackHeight - thumbHeight);

            
            this.ctx.fillStyle = scrollbarColor;
            this.ctx.fillRect(trackX + 2, thumbY, this.scrollbarWidth - 4, thumbHeight);

            
            this.ctx.strokeStyle = '#999999';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(trackX + 2, thumbY, this.scrollbarWidth - 4, thumbHeight);
        }
        
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

    getScrollbarInfo(x, y) {
        
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
        const scrollbarInfo = this.getScrollbarInfo(x, y);
        if (resizeInfo) {
            this.canvas.style.cursor = resizeInfo.type === 'col' ? 'col-resize' : 'row-resize';
        } else if (scrollbarInfo) {
            this.canvas.style.cursor = 'pointer';
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

        const scrollbarInfo = this.getScrollbarInfo(x, y);
        if (scrollbarInfo && scrollbarInfo.part === 'thumb') {
            this.isScrollbarDragging = true;
            this.scrollbarDragType = scrollbarInfo.type;
            this.scrollbarDragStart = scrollbarInfo.type === 'horizontal' ? e.clientX : e.clientY;
            this.scrollbarInitialScroll = scrollbarInfo.type === 'horizontal' ? this.scrollX : this.scrollY;
            return;
        } else if (scrollbarInfo && scrollbarInfo.part === 'track') {
            
            if (scrollbarInfo.type === 'horizontal') {
                const contentWidth = this.viewportWidth - this.headerWidth;
                this.scrollX += x < (this.viewportWidth - this.scrollbarWidth / 2) ? -contentWidth * 0.8 : contentWidth * 0.8;
                this.scrollX = Math.max(0, this.scrollX);
            } else {
                const contentHeight = this.viewportHeight - this.headerHeight;
                this.scrollY += y < (this.viewportHeight - this.scrollbarHeight / 2) ? -contentHeight * 0.8 : contentHeight * 0.8;
                this.scrollY = Math.max(0, this.scrollY);
            }
            this.render();
            return;
        }

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

        
        if (y <= this.headerHeight && x >= this.headerWidth) {
            const cellPos = this.getCellFromPoint(x, this.headerHeight + 1);
            if (cellPos) {
                const isMultiSelect = e.ctrlKey || e.metaKey;
                if (isMultiSelect) {
                    this.selection.selectCol(cellPos.col, isMultiSelect);
                } else {
                    this.selection.startRowColDrag(0, cellPos.col, 'column');
                    this.isDragging = true;
                }
                this.updateCellReference();
                this.render();
                return;
            }
        }

        if (x <= this.headerWidth && y >= this.headerHeight) {
            const cellPos = this.getCellFromPoint(this.headerWidth + 1, y);
            if (cellPos) {
                const isMultiSelect = e.ctrlKey || e.metaKey;
                if (isMultiSelect) {
                    this.selection.selectRow(cellPos.row, isMultiSelect);
                } else {
                    this.selection.startRowColDrag(cellPos.row, 0, 'row');
                    this.isDragging = true;
                }
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
                this.autoScrollInterval = setInterval(() => this.autoScrollSelection(), 50);
            }
            this.updateCellReference();
            this.render();
        }

        e.preventDefault();
        this.selection.selectedRanges = [];
        this.render();
    }

    handleMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        if (this.isScrollbarDragging) {
            if (this.scrollbarDragType === 'horizontal') {
                const deltaX = e.clientX - this.scrollbarDragStart;
                const contentWidth = this.viewportWidth - this.headerWidth;
                const needsVerticalScrollbar = this.getTotalHeight() > (this.viewportHeight - this.headerHeight);
                const availableWidth = contentWidth - (needsVerticalScrollbar ? this.scrollbarWidth : 0);
                const trackWidth = availableWidth;

                const totalWidth = this.getTotalWidth();
                const maxScroll = Math.max(0, totalWidth - availableWidth);
                const scrollRatio = deltaX / trackWidth;
                this.scrollX = Math.max(0, Math.min(maxScroll, this.scrollbarInitialScroll + (scrollRatio * maxScroll)));

            } else if (this.scrollbarDragType === 'vertical') {
                const deltaY = e.clientY - this.scrollbarDragStart;
                const contentHeight = this.viewportHeight - this.headerHeight;
                const needsHorizontalScrollbar = this.getTotalWidth() > (this.viewportWidth - this.headerWidth);
                const availableHeight = contentHeight - (needsHorizontalScrollbar ? this.scrollbarHeight : 0);
                const trackHeight = availableHeight;

                const totalHeight = this.getTotalHeight();
                const maxScroll = Math.max(0, totalHeight - availableHeight);
                const scrollRatio = deltaY / trackHeight;
                this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollbarInitialScroll + (scrollRatio * maxScroll)));
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

        if (this.isDragging && this.selection.isDraggingRowCol) {
            if (this.selection.selectionType === 'row') {
                const cellPos = this.getCellFromPoint(this.headerWidth + 1, y);
                if (cellPos) {
                    this.selection.updateRowColDrag(cellPos.row, cellPos.col);
                    this.render();
                }
            } else if (this.selection.selectionType === 'column') {
                const cellPos = this.getCellFromPoint(x, this.headerHeight + 1);
                if (cellPos) {
                    this.selection.updateRowColDrag(cellPos.row, cellPos.col);
                    this.render();
                }
            }
            return;
        }

        if (this.isDragging) {
            const cellPos = this.getCellFromPoint(x, y);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
                this.render();
            }
        } else {
            
            if (x >= 0 && x <= this.viewportWidth && y >= 0 && y <= this.viewportHeight) {
                this.updateCursor(x, y);
            }
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

        if (this.isDragging && this.selection.isDraggingRowCol) {
            this.selection.endRowColDrag();
            this.isDragging = false;
            this.updateStatusBar();
        }
        
        if (this.isDragging) {
            this.selection.endSelection();
            this.isDragging = false;
            this.updateStatusBar();
        }

        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
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

    autoScrollSelection() {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX;
        const mouseY = this.lastMouseY;

        const edgeThreshold = 30;
        const scrollSpeed = 20;
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

    showCellEditor(row, col) {

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

        editor.addEventListener('blur', () => {
            this.commitCellEdit(row, col, editor.value);
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

        
        const maxScrollX = Math.max(0, totalWidth - contentWidth);
        const maxScrollY = Math.max(0, totalHeight - contentHeight);

        if (e.shiftKey) {
            
            if (maxScrollX > 0) {
                this.scrollX = Math.max(0, Math.min(maxScrollX, this.scrollX + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed)));
            }
        } else {
            
            if (maxScrollY > 0) {
                this.scrollY = Math.max(0, Math.min(maxScrollY, this.scrollY + (e.deltaY > 0 ? scrollSpeed : -scrollSpeed)));
            }
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
                newRow = e.shiftKey ? Math.max(0, row - 1) : Math.min(this.cellData.rows - 1, row + 1);
                break;
            case 'Tab':
                e.preventDefault();
                newCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(this.cellData.cols - 1, col + 1);
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
        this.detectZoomChange();
        this.ctx.clearRect(-0.5, -0.5, this.viewportWidth + 1, this.viewportHeight + 1);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        this.drawGrid();
        this.drawCells();
        this.drawHeaders();
        this.drawSelection();
        this.drawScrollbars();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        
        let y = this.headerHeight - this.scrollY;
        for (let row = 0; row < this.cellData.rows && y < this.viewportHeight; row++) {
            const height = this.cellData.getRowHeight(row);
            y += height;
            if (y >= this.headerHeight) {
                this.ctx.moveTo(this.headerWidth, y);
                this.ctx.lineTo(this.viewportWidth, y);
            }
        }

        
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

    getTotalWidth() {
        let totalWidth = 0;
        for (let col = 0; col < this.cellData.cols; col++) {
            totalWidth += this.cellData.getColWidth(col);
        }
        return totalWidth;
    }

    getTotalHeight() {
        let totalHeight = 0;
        for (let row = 0; row < this.cellData.rows; row++) {
            totalHeight += this.cellData.getRowHeight(row);
        }
        return totalHeight;
    }

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

    drawHeaders() {
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillRect(this.headerWidth, 0, this.viewportWidth - this.headerWidth, this.headerHeight);
        
        let x = this.headerWidth - this.scrollX;
        for (let col = 0; col < this.cellData.cols && x < this.viewportWidth; col++) {
            const width = this.cellData.getColWidth(col);
            if (x + width >= this.headerWidth) {
                const isSelected = this.selection.selectedRanges.some(range =>
                    col >= range.startCol && col <= range.endCol
                ) || col === this.selection.activeCell.col ||
                    this.selection.selectedCols.includes(col);

                const isEntireColSelected = this.selection.selectedCols.includes(col);

                this.ctx.fillStyle = isEntireColSelected ? '#107c41' : (isSelected ? '#CAEAD8' : '#f8f9fa');
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

        this.ctx.fillStyle = '#f8f9fa';
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

                this.ctx.fillStyle = isEntireRowSelected ? '#107c41' : (isSelected ? '#CAEAD8' : '#f8f9fa');
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

        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.headerWidth, this.headerHeight);
        this.ctx.stroke();
    }

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
