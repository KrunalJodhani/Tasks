class Row {
  /**
   * 
   * @param {*string} index give index to row 
   * @param {*number} height height of row or cell
   */
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
  /**
   * 
   * @param {*string} index column index
   * @param {*number} width widht of column or cell
   */
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
  /**
   * 
   * @param {*object} ctx object of canvas for draw box
   * @param {*number} rowHeight height of raw
   * @param {*number} colWidth width of column
   * @param {*number} totalRows total number of rows
   * @param {*number} totalCols total number of column
   * @param {*JSON} cellData JSON data of cell
   */
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

  /**
   * 
   * @param {*number} scrollTop top of canvas ease for draw and render screen according to top and left
   * @param {*number} scrollLeft left of canvas
   * @param {*number} canvasWidth width of canvas screen
   * @param {*number} canvasHeight Height of canvas screen
   * @param {*JSON} selectedCell JSON data of selected cell
   */
  render(scrollTop, scrollLeft, canvasWidth, canvasHeight, selectedCell = null) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "black";
    ctx.font = "16px Arial";
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
        } else {
          // Display cell reference for empty cells using Excel-style column naming
          ctx.fillStyle = "gray";
          ctx.font = "10px Arial";
          const columnName = this.getColumnName(c);
          const cellReference = `${columnName}${r + 1}`;
          ctx.fillText(cellReference, x + 4, y + this.rowHeight / 2);
          ctx.font = "16px Arial";
        }
      }
    }
  }
}

class Cell {
  /**
   * 
   * @param {*number} x top pixle of cell
   * @param {*number} y left pixle of cell
   * @param {*number} width widht of cell
   * @param {*number} height height of cell
   * @param {*class} container class for find cell
   * @param {*JSON} initialValue cell instial value
   * @param {*boolean} onSave boolean for save the enter data
   * @returns 
   */
  static createInput(x, y, width, height, container, initialValue = "", onSave = null) {
    // Remove any existing input
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
    input.style.width = `${width -2}px`;
    input.style.height = `${height -2}px`;

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

// Command Pattern Implementation
class Command {
  constructor() {
    if (this.constructor === Command) {
      throw new Error("Command is an abstract class");
    }
  }

  execute() {
    throw new Error("Execute method must be implemented");
  }

  undo() {
    throw new Error("Undo method must be implemented");
  }

  getDescription() {
    return "Command";
  }
}

class SetCellValueCommand extends Command {
  constructor(sheetManager, row, col, newValue, oldValue) {
    super();
    this.sheetManager = sheetManager;
    this.row = row;
    this.col = col;
    this.newValue = newValue;
    this.oldValue = oldValue;
  }

  execute() {
    this.sheetManager.setCellValueDirect(this.row, this.col, this.newValue);
  }

  undo() {
    this.sheetManager.setCellValueDirect(this.row, this.col, this.oldValue);
  }

  getDescription() {
    const colName = this.sheetManager.getColumnName(this.col);
    return `Set ${colName}${this.row + 1} to "${this.newValue}"`;
  }
}

class ClearCellCommand extends Command {
  constructor(sheetManager, row, col, oldValue) {
    super();
    this.sheetManager = sheetManager;
    this.row = row;
    this.col = col;
    this.oldValue = oldValue;
  }

  execute() {
    this.sheetManager.setCellValueDirect(this.row, this.col, "");
  }

  undo() {
    this.sheetManager.setCellValueDirect(this.row, this.col, this.oldValue);
  }

  getDescription() {
    const colName = this.sheetManager.getColumnName(this.col);
    return `Clear ${colName}${this.row + 1}`;
  }
}

class CommandManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistorySize = 100;
  }

  executeCommand(command) {
    command.execute();
    this.undoStack.push(command);
    
    // Clear redo stack when new command is executed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop();
      command.undo();
      this.redoStack.push(command);
      return true;
    }
    return false;
  }

  redo() {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop();
      command.execute();
      this.undoStack.push(command);
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

  getLastCommand() {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

class SheetManager {
  /**
   * 
   * @param {*object} canvas object of canvas
   * @param {*div/class} contentContainer main div for render data
* @param {*div/classs} virtualContainer div wich dynamically render cell and draw according to scroll
   */
  constructor(canvas, contentContainer, virtualContainer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.content = contentContainer;
    this.virtual = virtualContainer;

    this.rowHeight = 40;
    this.colWidth = 100;
    this.totalRows = 100000;
    this.totalCols = 1000;

    this.cellData = {};
    this.selectedCell = { row: 0, col: 0 };
    this.copiedCell = null; // For copy/paste functionality

    // Initialize command manager
    this.commandManager = new CommandManager();

    this.grid = new Grid(
      this.ctx,
      this.rowHeight,
      this.colWidth,
      this.totalRows,
      this.totalCols,
      this.cellData
    );
  }

  init() {
    this.setVirtualSize();
    this.setCanvasSize();
    this.attachScroll();
    this.attachEditHandler();
    this.attachClickHandler();
    this.attachKeyboardHandler();
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
      // Use the new column naming method for 500 columns
      const cellRef = `${this.getColumnName(this.selectedCell.col)}${this.selectedCell.row + 1}`;
      if (cellReference) cellReference.textContent = cellRef;

      const cellKey = `${this.selectedCell.row}-${this.selectedCell.col}`;
      const cellValue = this.cellData[cellKey] || '';
      if (formulaInput) formulaInput.value = cellValue;
      if (cellInfo) cellInfo.textContent = cellRef;
    }

    // Update undo/redo button states (if they exist)
    this.updateCommandButtons();
  }

  updateCommandButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.disabled = !this.commandManager.canUndo();
      undoBtn.title = this.commandManager.canUndo() ? 
        `Undo: ${this.commandManager.getLastCommand()?.getDescription()}` : 
        'Nothing to undo';
    }
    
    if (redoBtn) {
      redoBtn.disabled = !this.commandManager.canRedo();
      redoBtn.title = this.commandManager.canRedo() ? 'Redo last action' : 'Nothing to redo';
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
    this.content.addEventListener("click", (e) => {
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
    this.content.addEventListener("dblclick", (e) => {
      const cellInfo = this.getCellFromCoordinates(e.clientX, e.clientY);
      const { row, col } = cellInfo;

      if (row >= 0 && row < this.totalRows && col >= 0 && col < this.totalCols) {
        this.startEditCell(row, col);
      }
    });
  }

  startEditCell(row, col) {
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
        this.setCellValue(row, col, newValue);
        this.selectedCell = { row, col };
      }
    );
  }

  attachKeyboardHandler() {
    document.addEventListener('keydown', (e) => {
      // Don't handle shortcuts when typing in inputs
      if (document.activeElement.tagName === 'INPUT' && !e.ctrlKey && !e.metaKey) return;

      // Handle Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            this.redo();
            break;
          case 'c':
            e.preventDefault();
            this.copyCell();
            break;
          case 'v':
            e.preventDefault();
            this.pasteCell();
            break;
          case 'x':
            e.preventDefault();
            this.cutCell();
            break;
          case 's':
            e.preventDefault();
            this.saveSpreadsheet();
            break;
          case 'o':
            e.preventDefault();
            this.openSpreadsheet();
            break;
          case 'a':
            e.preventDefault();
            this.selectAll();
            break;
        }
        return;
      }

      // Handle regular navigation keys
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
        case 'F2':
          e.preventDefault();
          this.startEdit();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          this.clearCell();
          break;
        case 'Escape':
          e.preventDefault();
          // Remove any active input
          const activeInput = this.content.querySelector('.cell-input');
          if (activeInput) {
            activeInput.remove();
          }
          break;
        case 'Home':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            newRow = 0;
            newCol = 0;
          } else {
            newCol = 0;
          }
          break;
        case 'End':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Find last used cell
            const lastCell = this.findLastUsedCell();
            newRow = lastCell.row;
            newCol = lastCell.col;
          } else {
            // Find last used column in current row
            newCol = this.findLastUsedColumnInRow(row);
          }
          break;
        case 'PageUp':
          e.preventDefault();
          newRow = Math.max(0, row - 10);
          break;
        case 'PageDown':
          e.preventDefault();
          newRow = Math.min(this.totalRows - 1, row + 10);
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

  // Command operations
  undo() {
    if (this.commandManager.undo()) {
      this.render();
      this.updateUI();
      console.log('Undo performed');
    }
  }

  redo() {
    if (this.commandManager.redo()) {
      this.render();
      this.updateUI();
      console.log('Redo performed');
    }
  }

  // Copy/Paste operations
  copyCell() {
    const { row, col } = this.selectedCell;
    const cellKey = `${row}-${col}`;
    this.copiedCell = {
      row,
      col,
      value: this.cellData[cellKey] || ""
    };
    console.log(`Copied cell ${this.getColumnName(col)}${row + 1}: "${this.copiedCell.value}"`);
  }

  cutCell() {
    this.copyCell();
    this.clearCell();
  }

  pasteCell() {
    if (!this.copiedCell) return;
    
    const { row, col } = this.selectedCell;
    this.setCellValue(row, col, this.copiedCell.value);
    console.log(`Pasted to cell ${this.getColumnName(col)}${row + 1}: "${this.copiedCell.value}"`);
  }

  selectAll() {
    // This is a placeholder - you could implement range selection here
    console.log('Select All - functionality can be extended for range selection');
  }

  // Helper functions
  findLastUsedCell() {
    let maxRow = 0;
    let maxCol = 0;
    
    for (const cellKey in this.cellData) {
      const [row, col] = cellKey.split('-').map(Number);
      if (row > maxRow) maxRow = row;
      if (col > maxCol) maxCol = col;
    }
    
    return { row: maxRow, col: maxCol };
  }

  findLastUsedColumnInRow(row) {
    let maxCol = 0;
    
    for (const cellKey in this.cellData) {
      const [cellRow, cellCol] = cellKey.split('-').map(Number);
      if (cellRow === row && cellCol > maxCol) {
        maxCol = cellCol;
      }
    }
    
    return maxCol;
  }

  startEdit() {
    const { row, col } = this.selectedCell;
    this.startEditCell(row, col);
  }

  clearCell() {
    const { row, col } = this.selectedCell;
    const cellKey = `${row}-${col}`;
    const oldValue = this.cellData[cellKey] || "";
    
    if (oldValue) {
      const command = new ClearCellCommand(this, row, col, oldValue);
      this.commandManager.executeCommand(command);
      this.render();
      this.updateUI();
    }
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

  // Direct cell value setter (doesn't create command)
  setCellValueDirect(row, col, value) {
    const cellKey = `${row}-${col}`;
    if (value && value.trim()) {
      this.cellData[cellKey] = value.trim();
    } else {
      delete this.cellData[cellKey];
    }
  }

  // Public cell value setter (creates command)
  setCellValue(row, col, value) {
    const cellKey = `${row}-${col}`;
    const oldValue = this.cellData[cellKey] || "";
    const newValue = value ? value.trim() : "";
    
    if (oldValue !== newValue) {
      const command = new SetCellValueCommand(this, row, col, newValue, oldValue);
      this.commandManager.executeCommand(command);
      this.render();
      this.updateUI();
    }
  }

  saveSpreadsheet() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.click();
    } else {
      // Fallback save functionality
      const data = this.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spreadsheet.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  openSpreadsheet() {
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
      loadBtn.click();
    }
  }

  exportData() {
    return JSON.stringify(this.cellData, null, 2);
  }

  importData(jsonData) {
    try {
      this.cellData = JSON.parse(jsonData);
      this.commandManager.clear(); // Clear command history when loading new data
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

  // Handle undo/redo buttons (if they exist)
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      sheet.undo();
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      sheet.redo();
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

  // Focus canvas for keyboard events
  canvas.setAttribute('tabindex', '0');
  canvas.focus();
});