// Base class for all mouse activities
class MouseHandler {
    constructor(sheetManager) {
        this.sheetManager = sheetManager;
        this.isActive = false;
    }

    start(x, y, e) {
        this.isActive = true;
    }

    update(x, y, e) {
        // Override in subclasses
    }

    end(x, y, e) {
        this.isActive = false;
    }

    cancel() {
        this.isActive = false;
    }
}

// Handles scrollbar dragging
class ScrollbarDragActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
        this.dragType = null;
        this.dragStart = 0;
        this.initialScroll = 0;
    }

    start(x, y, e) {
        const scrollbarInfo = this.sheetManager.getScrollbarInfo(x, y);
        if (scrollbarInfo && scrollbarInfo.part === 'thumb') {
            super.start(x, y, e);
            this.dragType = scrollbarInfo.type;
            this.dragStart = scrollbarInfo.type === 'horizontal' ? e.clientX : e.clientY;
            this.initialScroll = scrollbarInfo.type === 'horizontal' ? 
                this.sheetManager.scrollX : this.sheetManager.scrollY;
            return true;
        }
        return false;
    }

    update(x, y, e) {
        if (!this.isActive) return;

        if (this.dragType === 'horizontal') {
            const deltaX = e.clientX - this.dragStart;
            const contentWidth = this.sheetManager.viewportWidth - this.sheetManager.headerWidth;
            const needsVerticalScrollbar = this.sheetManager.getTotalHeight() > 
                (this.sheetManager.viewportHeight - this.sheetManager.headerHeight);
            const availableWidth = contentWidth - (needsVerticalScrollbar ? this.sheetManager.scrollbarWidth : 0);
            const trackWidth = availableWidth;
            const totalWidth = this.sheetManager.getTotalWidth();
            const maxScroll = Math.max(0, totalWidth - availableWidth);
            const scrollRatio = deltaX / trackWidth;
            this.sheetManager.scrollX = Math.max(0, Math.min(maxScroll, 
                this.initialScroll + (scrollRatio * maxScroll)));
        } else if (this.dragType === 'vertical') {
            const deltaY = e.clientY - this.dragStart;
            const contentHeight = this.sheetManager.viewportHeight - this.sheetManager.headerHeight;
            const needsHorizontalScrollbar = this.sheetManager.getTotalWidth() > 
                (this.sheetManager.viewportWidth - this.sheetManager.headerWidth);
            const availableHeight = contentHeight - (needsHorizontalScrollbar ? this.sheetManager.scrollbarHeight : 0);
            const trackHeight = availableHeight;
            const totalHeight = this.sheetManager.getTotalHeight();
            const maxScroll = Math.max(0, totalHeight - availableHeight);
            const scrollRatio = deltaY / trackHeight;
            this.sheetManager.scrollY = Math.max(0, Math.min(maxScroll, 
                this.initialScroll + (scrollRatio * maxScroll)));
        }
        
        this.sheetManager.render();
    }

    end(x, y, e) {
        super.end(x, y, e);
        this.dragType = null;
    }
}

// Handles column/row resizing
class ResizeActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
        this.resizeType = null;
        this.resizeIndex = -1;
        this.startPos = 0;
        this.startSize = 0;
    }

    start(x, y, e) {
        const resizeInfo = this.sheetManager.getResizeInfo(x, y);
        if (resizeInfo && e.button === 0) {
            super.start(x, y, e);
            this.resizeType = resizeInfo.type;
            this.resizeIndex = resizeInfo.index;
            this.startPos = resizeInfo.type === 'col' ? x : y;
            this.startSize = resizeInfo.type === 'col' ?
                this.sheetManager.cellData.getColWidth(resizeInfo.index) :
                this.sheetManager.cellData.getRowHeight(resizeInfo.index);
            return true;
        }
        return false;
    }

    update(x, y, e) {
        if (!this.isActive) return;

        const currentPos = this.resizeType === 'col' ? x : y;
        const delta = currentPos - this.startPos;
        const newSize = Math.max(30, this.startSize + delta);
        
        if (this.resizeType === 'col') {
            this.sheetManager.cellData.setColWidth(this.resizeIndex, newSize);
        } else {
            this.sheetManager.cellData.setRowHeight(this.resizeIndex, newSize);
        }
        
        this.sheetManager.render();
    }

    end(x, y, e) {
        if (this.isActive) {
            const currentSize = this.resizeType === 'col' ?
                this.sheetManager.cellData.getColWidth(this.resizeIndex) :
                this.sheetManager.cellData.getRowHeight(this.resizeIndex);
            
            if (currentSize !== this.startSize) {
                this.sheetManager.commandManager.executeResize(
                    this.resizeType,
                    this.resizeIndex,
                    currentSize,
                    this.startSize,
                    this.sheetManager
                );
            }
        }
        
        super.end(x, y, e);
        this.resizeType = null;
        this.resizeIndex = -1;
    }
}

// Handles column header selection
class ColumnSelectionActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
        this.isDragging = false;
    }

    start(x, y, e) {
        if (y <= this.sheetManager.headerHeight && x >= this.sheetManager.headerWidth) {
            const cellPos = this.sheetManager.getCellFromPoint(x, this.sheetManager.headerHeight + 1);
            if (cellPos) {
                super.start(x, y, e);
                const isMultiSelect = e.ctrlKey || e.metaKey;
                if (isMultiSelect) {
                    this.sheetManager.selection.selectCol(cellPos.col, isMultiSelect);
                } else {
                    this.sheetManager.selection.startRowColDrag(0, cellPos.col, 'column');
                    this.sheetManager.selection.selectCol(cellPos.col, isMultiSelect);
                    this.isDragging = true;
                }
                this.sheetManager.updateCellReference();
                this.sheetManager.render();
                return true;
            }
        }
        return false;
    }

    update(x, y, e) {
        if (!this.isActive || !this.isDragging) return;

        if (this.sheetManager.selection.isDraggingRowCol && 
            this.sheetManager.selection.selectionType === 'column') {
            const cellPos = this.sheetManager.getCellFromPoint(x, this.sheetManager.headerHeight + 1);
            if (cellPos) {
                this.sheetManager.selection.updateRowColDrag(cellPos.row, cellPos.col);
                this.sheetManager.render();
            }
        }
    }

    end(x, y, e) {
        if (this.isDragging && this.sheetManager.selection.isDraggingRowCol) {
            this.sheetManager.selection.endRowColDrag();
            this.sheetManager.updateStatusBar();
        }
        
        super.end(x, y, e);
        this.isDragging = false;
    }
}

// Handles row header selection
class RowSelectionActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
        this.isDragging = false;
    }

    start(x, y, e) {
        if (x <= this.sheetManager.headerWidth && y >= this.sheetManager.headerHeight) {
            const cellPos = this.sheetManager.getCellFromPoint(this.sheetManager.headerWidth + 1, y);
            if (cellPos) {
                super.start(x, y, e);
                const isMultiSelect = e.ctrlKey || e.metaKey;
                if (isMultiSelect) {
                    this.sheetManager.selection.selectRow(cellPos.row, isMultiSelect);
                } else {
                    this.sheetManager.selection.startRowColDrag(cellPos.row, 0, 'row');
                    this.sheetManager.selection.selectRow(cellPos.row, isMultiSelect);
                    this.isDragging = true;
                }
                this.sheetManager.updateCellReference();
                this.sheetManager.render();
                return true;
            }
        }
        return false;
    }

    update(x, y, e) {
        if (!this.isActive || !this.isDragging) return;

        if (this.sheetManager.selection.isDraggingRowCol && 
            this.sheetManager.selection.selectionType === 'row') {
            const cellPos = this.sheetManager.getCellFromPoint(this.sheetManager.headerWidth + 1, y);
            if (cellPos) {
                this.sheetManager.selection.updateRowColDrag(cellPos.row, cellPos.col);
                this.sheetManager.render();
            }
        }
    }

    end(x, y, e) {
        if (this.isDragging && this.sheetManager.selection.isDraggingRowCol) {
            this.sheetManager.selection.endRowColDrag();
            this.sheetManager.updateStatusBar();
        }
        
        super.end(x, y, e);
        this.isDragging = false;
    }
}

// Handles cell selection and dragging
class CellSelectionActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
        this.autoScrollInterval = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    start(x, y, e) {
        const cellPos = this.sheetManager.getCellFromPoint(x, y);
        if (cellPos) {
            super.start(x, y, e);
            if (e.shiftKey) {
                this.sheetManager.selection.updateSelection(cellPos.row, cellPos.col);
            } else {
                this.sheetManager.selection.startSelection(cellPos.row, cellPos.col);
                this.autoScrollInterval = setInterval(() => this.autoScrollSelection(), 50);
            }
            this.sheetManager.updateCellReference();
            this.sheetManager.render();
            return true;
        }
        return false;
    }

    update(x, y, e) {
        if (!this.isActive) return;

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        const cellPos = this.sheetManager.getCellFromPoint(x, y);
        if (cellPos) {
            this.sheetManager.selection.updateSelection(cellPos.row, cellPos.col);
            this.sheetManager.render();
        }
    }

    end(x, y, e) {
        if (this.isActive) {
            this.sheetManager.selection.endSelection();
            this.sheetManager.updateStatusBar();
        }
        
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        
        super.end(x, y, e);
    }

    cancel() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
        super.cancel();
    }

    autoScrollSelection() {
        const rect = this.sheetManager.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX;
        const mouseY = this.lastMouseY;
        const edgeThreshold = 40;
        const scrollSpeed = 40;
        let scrolled = false;

        if (mouseX < rect.left + edgeThreshold) {
            this.sheetManager.scrollX = Math.max(0, this.sheetManager.scrollX - scrollSpeed);
            scrolled = true;
        } else if (mouseX > rect.right - edgeThreshold) {
            this.sheetManager.scrollX += scrollSpeed;
            scrolled = true;
        }

        if (mouseY < rect.top + edgeThreshold) {
            this.sheetManager.scrollY = Math.max(0, this.sheetManager.scrollY - scrollSpeed);
            scrolled = true;
        } else if (mouseY > rect.bottom - edgeThreshold) {
            this.sheetManager.scrollY += scrollSpeed;
            scrolled = true;
        }

        if (scrolled) {
            const localX = mouseX - rect.left;
            const localY = mouseY - rect.top;
            const cellPos = this.sheetManager.getCellFromPoint(localX, localY);
            if (cellPos) {
                this.sheetManager.selection.updateSelection(cellPos.row, cellPos.col);
            }
            this.sheetManager.render();
        }
    }
}

// Handles scrollbar track clicks
class ScrollbarTrackActivity extends MouseHandler {
    constructor(sheetManager) {
        super(sheetManager);
    }

    start(x, y, e) {
        const scrollbarInfo = this.sheetManager.getScrollbarInfo(x, y);
        if (scrollbarInfo && scrollbarInfo.part === 'track') {
            super.start(x, y, e);
            
            if (scrollbarInfo.type === 'horizontal') {
                const contentWidth = this.sheetManager.viewportWidth - this.sheetManager.headerWidth;
                this.sheetManager.scrollX += x < (this.sheetManager.viewportWidth - this.sheetManager.scrollbarWidth / 2) ? 
                    -contentWidth * 0.8 : contentWidth * 0.8;
                this.sheetManager.scrollX = Math.max(0, this.sheetManager.scrollX);
            } else {
                const contentHeight = this.sheetManager.viewportHeight - this.sheetManager.headerHeight;
                this.sheetManager.scrollY += y < (this.sheetManager.viewportHeight - this.sheetManager.scrollbarHeight / 2) ? 
                    -contentHeight * 0.8 : contentHeight * 0.8;
                this.sheetManager.scrollY = Math.max(0, this.sheetManager.scrollY);
            }
            
            this.sheetManager.render();
            return true;
        }
        return false;
    }
}

// Main mouse handler class
class MouseHandler {
    constructor(sheetManager) {
        this.sheetManager = sheetManager;
        this.activities = [
            new ScrollbarDragActivity(sheetManager),
            new ScrollbarTrackActivity(sheetManager),
            new ResizeActivity(sheetManager),
            new ColumnSelectionActivity(sheetManager),
            new RowSelectionActivity(sheetManager),
            new CellSelectionActivity(sheetManager)
        ];
        this.currentActivity = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    handleMouseDown(e) {
        this.sheetManager.canvas.focus();
        this.sheetManager.hideCellEditor();
        
        const rect = this.sheetManager.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Try each activity in order until one handles the event
        for (const activity of this.activities) {
            if (activity.start(x, y, e)) {
                this.currentActivity = activity;
                break;
            }
        }

        // Clear selected ranges if no activity handled the event
        if (!this.currentActivity) {
            this.sheetManager.selection.selectedRanges = [];
            this.sheetManager.render();
        }

        e.preventDefault();
    }

    handleMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        const rect = this.sheetManager.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentActivity) {
            this.currentActivity.update(x, y, e);
        } else {
            // Update cursor when not dragging
            if (x >= 0 && x <= this.sheetManager.viewportWidth && 
                y >= 0 && y <= this.sheetManager.viewportHeight) {
                this.sheetManager.updateCursor(x, y);
            }
        }
    }

    handleMouseUp(e) {
        if (this.currentActivity) {
            const rect = this.sheetManager.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.currentActivity.end(x, y, e);
            this.currentActivity = null;
        }
    }

    handleDoubleClick(e) {
        const rect = this.sheetManager.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cellPos = this.sheetManager.getCellFromPoint(x, y);
        if (cellPos) {
            this.sheetManager.showCellEditor(cellPos.row, cellPos.col);
        }
    }

    cancelAll() {
        if (this.currentActivity) {
            this.currentActivity.cancel();
            this.currentActivity = null;
        }
    }
}