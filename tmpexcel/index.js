class Row {
  constructor(index, height = 30) {
    this.index = index;
    this.height = height;
    this.top = index * height;
  }

  getTop() {
    return this.top;
  }

  getHeight() {
    return this.height;
  }
}

class Column {
  constructor(index, width = 80) {
    this.index = index;
    this.width = width;
    this.left = index * width;
  }

  getLeft() {
    return this.left;
  }

  getWidth() {
    return this.width;
  }
}

class Grid {
  constructor(ctx, rowHeight, colWidth, totalRows, totalCols, cellData) {
    this.ctx = ctx;
    this.rowHeight = rowHeight;
    this.colWidth = colWidth;
    this.totalRows = totalRows;
    this.totalCols = totalCols;
    this.cellData = cellData;
  }

  getColumnName(colIndex) {
    let result = '';
    let num = colIndex;

    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
      if (num < 0) break;
    }

    return result;
  }

  render(scrollTop, scrollLeft, canvasWidth, canvasHeight, selectedCell = null) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#ddd";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const startRow = Math.floor(scrollTop / this.rowHeight);
    const endRow = Math.min(startRow + Math.ceil(canvasHeight / this.rowHeight) + 1, this.totalRows);

    const startCol = Math.floor(scrollLeft / this.colWidth);
    const endCol = Math.min(startCol + Math.ceil(canvasWidth / this.colWidth) + 1, this.totalCols);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * this.colWidth - scrollLeft;
        const y = r * this.rowHeight - scrollTop;

        // Highlight selected cell
        if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
          ctx.fillStyle = "#e3f2fd";
          ctx.fillRect(x, y, this.colWidth, this.rowHeight);
        }

        // Draw cell border
        ctx.strokeRect(x, y, this.colWidth, this.rowHeight);

        // Display cell data
        const cellKey = `${r}-${c}`;
        const cellValue = this.cellData[cellKey] || "";

        if (cellValue) {
          ctx.fillStyle = "#000";
          ctx.fillText(cellValue, x + 4, y + this.rowHeight / 2);
        }
      }
    }
  }
}

class Cell {
  static createInput(x, y, width, height, container, initialValue = "", onSave = null) {
    const existingInput = container.querySelector(".cell-input");
    if (existingInput) {
      existingInput.remove();
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.value = initialValue;
    input.style.position = "absolute";
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.width = `${width - 2}px`;
    input.style.height = `${height - 2}px`;

    container.appendChild(input);
    input.focus();
    input.select();

    const saveAndClose = () => {
      const value = input.value.trim();
      if (onSave) {
        onSave(value);
      }
      if (container.contains(input)) {
        container.removeChild(input);
      }
    };

    input.addEventListener("blur", saveAndClose);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveAndClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (container.contains(input)) {
          container.removeChild(input);
        }
      }
    });

    return input;
  }
}

class HeaderManager {
  constructor(sheetManager) {
    this.sheet = sheetManager;
    this.colHeadersContainer = document.getElementById('colHeaders');
    this.rowHeadersContainer = document.getElementById('rowHeaders');
    this.headerHeight = 25;
    this.headerWidth = 50;
  }

  createHeaders() {
    this.updateHeaders();
  }

  updateHeaders() {
    const scrollTop = this.sheet.content.scrollTop;
    const scrollLeft = this.sheet.content.scrollLeft;
    const canvasWidth = this.sheet.canvas.width;
    const canvasHeight = this.sheet.canvas.height;

    // Clear existing headers
    this.colHeadersContainer.innerHTML = '';
    this.rowHeadersContainer.innerHTML = '';

    // Create column headers
    const startCol = Math.floor(scrollLeft / this.sheet.colWidth);
    const endCol = Math.min(startCol + Math.ceil(canvasWidth / this.sheet.colWidth) + 1, this.sheet.totalCols);

    for (let c = startCol; c < endCol; c++) {
      const colHeader = document.createElement('div');
      colHeader.className = 'col-header';
      colHeader.style.left = `${50 + c * this.sheet.colWidth - scrollLeft}px`;
      colHeader.style.top = '0px';
      colHeader.style.width = `${this.sheet.colWidth}px`;
      colHeader.style.height = `${this.headerHeight}px`;

      const headerText = document.createElement('div');
      headerText.className = 'header-text';
      headerText.textContent = this.sheet.getColumnName(c);
      colHeader.appendChild(headerText);

      this.colHeadersContainer.appendChild(colHeader);
    }

    // Create row headers
    const startRow = Math.floor(scrollTop / this.sheet.rowHeight);
    const endRow = Math.min(startRow + Math.ceil(canvasHeight / this.sheet.rowHeight) + 1, this.sheet.totalRows);

    for (let r = startRow; r < endRow; r++) {
      const rowHeader = document.createElement('div');
      rowHeader.className = 'row-header';
      rowHeader.style.left = '0px';
      rowHeader.style.top = `${25 + r * this.sheet.rowHeight - scrollTop}px`;
      rowHeader.style.width = `${this.headerWidth}px`;
      rowHeader.style.height = `${this.sheet.rowHeight}px`;

      const headerText = document.createElement('div');
      headerText.className = 'header-text';
      headerText.textContent = (r + 1).toString();
      rowHeader.appendChild(headerText);

      this.rowHeadersContainer.appendChild(rowHeader);
    }
  }
}

class SheetManager {
  constructor(canvas, contentContainer, virtualContainer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.content = contentContainer;
    this.virtual = virtualContainer;

    this.rowHeight = 30;
    this.colWidth = 80;
    this.totalRows = 100000;
    this.totalCols = 500;

    this.cellData = {};
    this.selectedCell = { row: 0, col: 0 };

    this.grid = new Grid(
      this.ctx,
      this.rowHeight,
      this.colWidth,
      this.totalRows,
      this.totalCols,
      this.cellData
    );

    this.headerManager = new HeaderManager(this);
  }

  init() {
    this.setVirtualSize();
    this.setCanvasSize();
    this.attachScroll();
    this.attachEditHandler();
    this.attachClickHandler();
    this.attachKeyboardHandler();
    this.headerManager.createHeaders();
    this.render();
    this.updateUI();
  }

  setVirtualSize() {
    this.virtual.style.width = this.colWidth * this.totalCols + "px";
    this.virtual.style.height = this.rowHeight * this.totalRows + "px";
  }

  setCanvasSize() {
    this.canvas.width = this.content.clientWidth;
    this.canvas.height = this.content.clientHeight;
    this.canvas.style.width = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.height + "px";
  }

  render() {
    const scrollTop = this.content.scrollTop;
    const scrollLeft = this.content.scrollLeft;
    this.grid.render(scrollTop, scrollLeft, this.canvas.width, this.canvas.height, this.selectedCell);
    this.headerManager.updateHeaders();
  }

  getColumnName(colIndex) {
    let result = '';
    let num = colIndex;

    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
      if (num < 0) break;
    }

    return result;
  }

  updateUI() {
    const cellReference = document.getElementById('cellReference');
    const formulaInput = document.getElementById('formulaInput');
    const cellInfo = document.getElementById('cellInfo');

    if (this.selectedCell) {
      const cellRef = `${this.getColumnName(this.selectedCell.col)}${this.selectedCell.row + 1}`;
      if (cellReference) cellReference.textContent = cellRef;

      const cellKey = `${this.selectedCell.row}-${this.selectedCell.col}`;
      const cellValue = this.cellData[cellKey] || '';
      if (formulaInput) formulaInput.value = cellValue;
      if (cellInfo) cellInfo.textContent = cellRef;
    }
  }

  attachScroll() {
    this.content.addEventListener("scroll", () => {
      this.render();
    });

    window.addEventListener("resize", () => {
      this.setCanvasSize();
      this.render();
    });
  }

  getCellFromCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scrollLeft = this.content.scrollLeft;
    const scrollTop = this.content.scrollTop;

    const x = clientX - rect.left + scrollLeft;
    const y = clientY - rect.top + scrollTop;

    const col = Math.floor(x / this.colWidth);
    const row = Math.floor(y / this.rowHeight);

    return { row, col, x: x - scrollLeft, y: y - scrollTop };
  }

  attachClickHandler() {
    this.canvas.addEventListener("click", (e) => {
      const cellInfo = this.getCellFromCoordinates(e.clientX, e.clientY);

      if (cellInfo.row >= 0 && cellInfo.row < this.totalRows &&
        cellInfo.col >= 0 && cellInfo.col < this.totalCols) {
        this.selectedCell = { row: cellInfo.row, col: cellInfo.col };
        this.render();
        this.updateUI();
      }
    });
  }

  attachEditHandler() {
    this.canvas.addEventListener("dblclick", (e) => {
      const cellInfo = this.getCellFromCoordinates(e.clientX, e.clientY);
      const { row, col } = cellInfo;

      if (row >= 0 && row < this.totalRows && col >= 0 && col < this.totalCols) {
        const inputX = col * this.colWidth - this.content.scrollLeft;
        const inputY = row * this.rowHeight - this.content.scrollTop;

        const cellKey = `${row}-${col}`;
        const currentValue = this.cellData[cellKey] || "";

        Cell.createInput(
          inputX,
          inputY,
          this.colWidth,
          this.rowHeight,
          this.content,
          currentValue,
          (newValue) => {
            if (newValue) {
              this.cellData[cellKey] = newValue;
            } else {
              delete this.cellData[cellKey];
            }

            this.selectedCell = { row, col };
            this.render();
            this.updateUI();
          }
        );
      }
    });
  }

  attachKeyboardHandler() {
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      const { row, col } = this.selectedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(this.totalRows - 1, row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(this.totalCols - 1, col + 1);
          break;
        case 'Enter':
          e.preventDefault();
          this.startEdit();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          this.clearCell();
          break;
      }

      if (newRow !== row || newCol !== col) {
        this.selectedCell = { row: newRow, col: newCol };
        this.render();
        this.updateUI();
        this.scrollToCell(newRow, newCol);
      }
    });
  }

  startEdit() {
    const { row, col } = this.selectedCell;
    const inputX = col * this.colWidth - this.content.scrollLeft;
    const inputY = row * this.rowHeight - this.content.scrollTop;

    const cellKey = `${row}-${col}`;
    const currentValue = this.cellData[cellKey] || "";

    Cell.createInput(
      inputX,
      inputY,
      this.colWidth,
      this.rowHeight,
      this.content,
      currentValue,
      (newValue) => {
        if (newValue) {
          this.cellData[cellKey] = newValue;
        } else {
          delete this.cellData[cellKey];
        }
        this.render();
        this.updateUI();
      }
    );
  }

  clearCell() {
    const { row, col } = this.selectedCell;
    const cellKey = `${row}-${col}`;
    delete this.cellData[cellKey];
    this.render();
    this.updateUI();
  }

  scrollToCell(row, col) {
    const targetX = col * this.colWidth;
    const targetY = row * this.rowHeight;

    const scrollLeft = this.content.scrollLeft;
    const scrollTop = this.content.scrollTop;
    const clientWidth = this.content.clientWidth;
    const clientHeight = this.content.clientHeight;

    if (targetX < scrollLeft) {
      this.content.scrollLeft = targetX;
    } else if (targetX + this.colWidth > scrollLeft + clientWidth) {
      this.content.scrollLeft = targetX + this.colWidth - clientWidth;
    }

    if (targetY < scrollTop) {
      this.content.scrollTop = targetY;
    } else if (targetY + this.rowHeight > scrollTop + clientHeight) {
      this.content.scrollTop = targetY + this.rowHeight - clientHeight;
    }
  }

  getCellValue(row, col) {
    const cellKey = `${row}-${col}`;
    return this.cellData[cellKey] || "";
  }

  setCellValue(row, col, value) {
    const cellKey = `${row}-${col}`;
    if (value) {
      this.cellData[cellKey] = value;
    } else {
      delete this.cellData[cellKey];
    }
    this.render();
    this.updateUI();
  }

  exportData() {
    return JSON.stringify(this.cellData, null, 2);
  }

  importData(jsonData) {
    try {
      this.cellData = JSON.parse(jsonData);
      this.render();
      this.updateUI();
      return true;
    } catch (e) {
      console.error("Invalid data format");
      return false;
    }
  }
}

// Initialize when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("mainExcel");
  const content = document.getElementById("content");
  const virtualContainer = document.querySelector(".virtualContainer");

  const sheet = new SheetManager(canvas, content, virtualContainer);
  sheet.init();

  // Make sheet manager globally accessible
  window.sheetManager = sheet;

  // Handle formula input
  const formulaInput = document.getElementById('formulaInput');
  if (formulaInput) {
    formulaInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && sheet.selectedCell) {
        const { row, col } = sheet.selectedCell;
        sheet.setCellValue(row, col, this.value);
        this.blur();
        canvas.focus();
      }
    });
  }

  // Handle save/load buttons
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const data = sheet.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spreadsheet.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            sheet.importData(e.target.result);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });
  }
});