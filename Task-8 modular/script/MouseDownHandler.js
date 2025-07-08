export class MouseDownHandler {
    constructor(sheet) {
        this.sheet = sheet;
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    getRelativePosition(e) {
        const rect = this.sheet.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    handleMouseDown(e) {
        const sheet = this.sheet;
        sheet.canvas.focus();
        sheet.hideCellEditor();

        const { x, y } = this.getRelativePosition(e);
        const scrollbarInfo = sheet.getScrollbarInfo(x, y);
        if (scrollbarInfo && scrollbarInfo.part === 'thumb') {
            sheet.isScrollbarDragging = true;
            sheet.scrollbarDragType = scrollbarInfo.type;
            sheet.scrollbarDragStart = scrollbarInfo.type === 'horizontal' ? e.clientX : e.clientY;
            sheet.scrollbarInitialScroll = scrollbarInfo.type === 'horizontal' ? sheet.scrollX : sheet.scrollY;
            return;
        } else if (scrollbarInfo && scrollbarInfo.part === 'track') {
            if (scrollbarInfo.type === 'horizontal') {
                const contentWidth = sheet.viewportWidth - sheet.headerWidth;
                sheet.scrollX += x < (sheet.viewportWidth - sheet.scrollbarWidth / 2) ? -contentWidth * 0.8 : contentWidth * 0.8;
                sheet.scrollX = Math.max(0, sheet.scrollX);
            } else {
                const contentHeight = sheet.viewportHeight - sheet.headerHeight;
                sheet.scrollY += y < (sheet.viewportHeight - sheet.scrollbarHeight / 2) ? -contentHeight * 0.8 : contentHeight * 0.8;
                sheet.scrollY = Math.max(0, sheet.scrollY);
            }
            sheet.render();
            return;
        }

        const resizeInfo = sheet.getResizeInfo(x, y);
        if (resizeInfo && e.button === 0) {
            sheet.isResizing = true;
            sheet.resizeType = resizeInfo.type;
            sheet.resizeIndex = resizeInfo.index;
            sheet.resizeStartPos = resizeInfo.type === 'col' ? x : y;
            sheet.resizeStartSize = resizeInfo.type === 'col'
                ? sheet.cellData.getColWidth(resizeInfo.index)
                : sheet.cellData.getRowHeight(resizeInfo.index);
            return;
        }

        const cellPos = sheet.getCellFromPoint(x, y);
        if (y <= sheet.headerHeight && x >= sheet.headerWidth && cellPos) {
            const isMulti = e.ctrlKey || e.metaKey;
            sheet.selection.startRowColDrag(0, cellPos.col, 'column');
            sheet.selection.selectCol(cellPos.col, isMulti);
            sheet.isDragging = true;
            sheet.updateCellReference();
            sheet.render();
            return;
        }

        if (x <= sheet.headerWidth && y >= sheet.headerHeight && cellPos) {
            const isMulti = e.ctrlKey || e.metaKey;
            sheet.selection.startRowColDrag(cellPos.row, 0, 'row');
            sheet.selection.selectRow(cellPos.row, isMulti);
            sheet.isDragging = true;
            sheet.updateCellReference();
            sheet.render();
            return;
        }

        if (cellPos) {
            if (e.shiftKey) {
                sheet.selection.updateSelection(cellPos.row, cellPos.col);
            } else {
                sheet.selection.startSelection(cellPos.row, cellPos.col);
                sheet.isDragging = true;
                sheet.autoScrollInterval = setInterval(() => sheet.autoScrollSelection(), 50);
            }
            sheet.updateCellReference();
            sheet.render();
        }

        e.preventDefault();
        sheet.selection.selectedRanges = [];
        sheet.render();
    }
}
