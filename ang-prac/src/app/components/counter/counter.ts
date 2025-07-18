import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.html',
  styleUrl: './counter.scss'
})
export class Counter {
  counterVal  = signal(0);

  Increment() {
    this.counterVal.update((val) => val + 1);
  }

  Decrement(){
    this.counterVal.update((val) => val - 1);
  }

  Reset(){
    this.counterVal.set(0);
  }
}
