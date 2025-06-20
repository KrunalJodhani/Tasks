class BackgroundManager {
    constructor() {
      this.background = document.createElement('div');
      this.background.className = 'main';
      document.body.appendChild(this.background);
    }
    get element() {
      return this.background;
    }

    get width() {
      return this.background.offsetWidth;
    }

    get height() {
      return this.background.offsetHeight;
    }
  }

  class DraggableBox {
    /**
     * 
     * @param {*class} parentDiv parent classs
     * @param {*class} boundsProvider background color
     * @param {*string} color child div color
     * @param {*number} top child div top position
     * @param {*number} left child div left position
     */
    
    constructor(parentDiv, boundsProvider, color = 'tomato', top = '0px', left = '0px') {
      this.box = document.createElement('div');
      this.box.className = 'childDiv';
      this.box.style.backgroundColor = color;
      this.box.style.top = top;
      this.box.style.left = left;
      parentDiv.appendChild(this.box);

      this.offsetX = 0;
      this.offsetY = 0;
      this.isDragging = false;
      this.boundsProvider = boundsProvider;

      this.attachEvents();
      window.addEventListener('resize', () => this.keepInBounds());
    }

    attachEvents() {
      this.box.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.offsetX = e.clientX - this.box.offsetLeft;
        this.offsetY = e.clientY - this.box.offsetTop;
        this.box.style.cursor = 'grabbing';
        this.box.setPointerCapture(e.pointerId);
      });

      document.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;

        const newX = e.clientX - this.offsetX;
        const newY = e.clientY - this.offsetY;

        const maxX = this.boundsProvider.width - 50;
        const maxY = this.boundsProvider.height - 50;

        this.box.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        this.box.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
      });

      document.addEventListener('pointerup', () => {
        this.isDragging = false;
        this.box.style.cursor = 'grab';
      });
    }

    keepInBounds() {
      const maxX = this.boundsProvider.width - 50;
      const maxY = this.boundsProvider.height - 50;

      let left = parseInt(this.box.style.left, 10) || 0;
      let top = parseInt(this.box.style.top, 10) || 0;

      this.box.style.left = Math.min(left, maxX) + 'px';
      this.box.style.top = Math.min(top, maxY) + 'px';
    }
  }
  
  for (let i = 0; i < 4; i++) {
    const background = new BackgroundManager();
    new DraggableBox(background.element, background, 'tomato', '50px', '100px');
    new DraggableBox(background.element, background, 'yellow', '50px', '150px');
    new DraggableBox(background.element, background, 'lime', '100px', '100px');
    new DraggableBox(background.element, background, 'blue', '100px', '150px');
  }