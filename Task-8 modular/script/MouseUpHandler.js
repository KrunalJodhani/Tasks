export class MouseUpHandler {
    constructor(sheet) {
        this.sheet = sheet;
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    handleMouseUp() {
        const sheet = this.sheet;

        if (sheet.isScrollbarDragging) {
            sheet.isScrollbarDragging = false;
            sheet.scrollbarDragType = null;
        }

        if (sheet.isResizing) {
            const currentSize = sheet.resizeType === 'col'
                ? sheet.cellData.getColWidth(sheet.resizeIndex)
                : sheet.cellData.getRowHeight(sheet.resizeIndex);

            if (currentSize !== sheet.resizeStartSize) {
                sheet.commandManager.executeResize(
                    sheet.resizeType,
                    sheet.resizeIndex,
                    currentSize,
                    sheet.resizeStartSize,
                    sheet
                );
            }

            sheet.isResizing = false;
            sheet.resizeType = null;
            sheet.resizeIndex = -1;
        }

        if (sheet.isDragging && sheet.selection.isDraggingRowCol) {
            sheet.selection.endRowColDrag();
        }

        if (sheet.isDragging) {
            sheet.selection.endSelection();
        }

        sheet.isDragging = false;
        sheet.updateStatusBar();

        if (sheet.autoScrollInterval) {
            clearInterval(sheet.autoScrollInterval);
            sheet.autoScrollInterval = null;
        }
    }
}
