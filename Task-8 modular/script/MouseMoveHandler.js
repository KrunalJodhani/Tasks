export class MouseMoveHandler {
    constructor(sheet, cursorManager) {
        this.sheet = sheet;
        this.cursorManager = cursorManager;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    getRelativePosition(e) {
        const rect = this.sheet.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    handleMouseMove(e) {
        const sheet = this.sheet;
        sheet.lastMouseX = e.clientX;
        sheet.lastMouseY = e.clientY;

        const { x, y } = this.getRelativePosition(e);

        if (sheet.isScrollbarDragging) {
            const delta = sheet.scrollbarDragType === 'horizontal'
                ? e.clientX - sheet.scrollbarDragStart
                : e.clientY - sheet.scrollbarDragStart;
            const contentSize = sheet.scrollbarDragType === 'horizontal'
                ? sheet.viewportWidth - sheet.headerWidth
                : sheet.viewportHeight - sheet.headerHeight;
            const totalSize = sheet.scrollbarDragType === 'horizontal'
                ? sheet.getTotalWidth()
                : sheet.getTotalHeight();
            const maxScroll = Math.max(0, totalSize - contentSize);
            const scrollRatio = delta / contentSize;

            if (sheet.scrollbarDragType === 'horizontal') {
                sheet.scrollX = Math.max(0, Math.min(maxScroll, sheet.scrollbarInitialScroll + scrollRatio * maxScroll));
            } else {
                sheet.scrollY = Math.max(0, Math.min(maxScroll, sheet.scrollbarInitialScroll + scrollRatio * maxScroll));
            }

            sheet.render();
            return;
        }

        if (sheet.isResizing) {
            const current = sheet.resizeType === 'col' ? x : y;
            const delta = current - sheet.resizeStartPos;
            const newSize = Math.max(30, sheet.resizeStartSize + delta);
            if (sheet.resizeType === 'col') {
                sheet.cellData.setColWidth(sheet.resizeIndex, newSize);
            } else {
                sheet.cellData.setRowHeight(sheet.resizeIndex, newSize);
            }
            sheet.render();
            return;
        }

        if (sheet.isDragging && sheet.selection.isDraggingRowCol) {
            const refX = sheet.selection.selectionType === 'row' ? sheet.headerWidth + 1 : x;
            const refY = sheet.selection.selectionType === 'column' ? sheet.headerHeight + 1 : y;
            const cellPos = sheet.getCellFromPoint(refX, refY);
            if (cellPos) {
                sheet.selection.updateRowColDrag(cellPos.row, cellPos.col);
                sheet.render();
            }
            return;
        }

        if (sheet.isDragging) {
            const cellPos = sheet.getCellFromPoint(x, y);
            if (cellPos) {
                sheet.selection.updateSelection(cellPos.row, cellPos.col);
                sheet.render();
            }
        } else {
            if (x >= 0 && x <= sheet.viewportWidth && y >= 0 && y <= sheet.viewportHeight) {
                this.cursorManager.updateCursor(x, y);
            }
        }
    }
}
