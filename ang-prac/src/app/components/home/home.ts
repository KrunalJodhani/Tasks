import { Component, input } from '@angular/core';
import { Greetings } from '../greetings/greetings';
import { Counter } from '../counter/counter';

@Component({
  selector: 'app-home',
  imports: [Greetings,Counter],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  homeMessage = input('Hello from Home');

  keyUpHandler(event: KeyboardEvent){
    console.log(`user press key : ${event.key}`);
  }
}
