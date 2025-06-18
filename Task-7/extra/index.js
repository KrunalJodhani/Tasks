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
  
      this.velocityX = this.randomVelocity();
      this.velocityY = this.randomVelocity();
  
      this.attachEvents();
      window.addEventListener('resize', () => this.keepInBounds());
  
      this.animate();
    }
  
    randomVelocity() {
      return Math.random() * 14 - 7;
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
  
    animate() {
      const move = () => {
        if (!this.isDragging) {
          let left = parseFloat(this.box.style.left);
          let top = parseFloat(this.box.style.top);
  
          const maxX = this.boundsProvider.width - 50;
          const maxY = this.boundsProvider.height - 50;
  
          left += this.velocityX;
          top += this.velocityY;
  
          if (left <= 0 || left >= maxX) {
            this.velocityX *= -1;
            left = Math.max(0, Math.min(left, maxX));
          }
          if (top <= 0 || top >= maxY) {
            this.velocityY *= -1;
            top = Math.max(0, Math.min(top, maxY));
          }
  
          this.box.style.left = left + 'px';
          this.box.style.top = top + 'px';
  
          this.createTrail(left, top);
        }
  
        requestAnimationFrame(move);
      };
  
      move();
    }
  
    createTrail(left, top) {
      const trail = document.createElement('div');
      trail.className = 'trail';
      trail.style.left = left + 'px';
      trail.style.top = top + 'px';
      trail.style.backgroundColor = this.box.style.backgroundColor;
  
      this.boundsProvider.element.appendChild(trail);
  
      setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 300);
      }, 200);
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
  
  const background = new BackgroundManager();
  new DraggableBox(background.element, background, 'tomato', '50px', '50px');
  new DraggableBox(background.element, background, 'yellow', '100px', '100px');
  new DraggableBox(background.element, background, 'lime', '150px', '150px');
  new DraggableBox(background.element, background, 'blue', '200px', '200px');
  new DraggableBox(background.element, background, 'green', '200px', '200px');
  new DraggableBox(background.element, background, 'red', '200px', '200px');
  new DraggableBox(background.element, background, 'white', '200px', '200px');
  new DraggableBox(background.element, background, 'silver', '200px', '200px');
  