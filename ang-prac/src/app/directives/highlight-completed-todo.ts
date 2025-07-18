import { Directive, Input, effect, inject, ElementRef} from '@angular/core';

@Directive({
  selector: '[appHighlightCompletedTodo]'
})
export class HighlightCompletedTodo {
  @Input() isCompleted = false;
  el = inject(ElementRef);
  
  constructor() { }

  styleEffects = effect(() => {
    if(this.isCompleted){
      this.el.nativeElement.style.textDecoration = 'line-through';
      this.el.nativeElement.style.color = 'gray';
      this.el.nativeElement.style.backgroundColor = 'lightgray';
    }else{
      this.el.nativeElement.style.textDecoration = 'none';
      this.el.nativeElement.style.color = 'black';
      this.el.nativeElement.style.backgroundColor = 'white';
    }
  });
}
