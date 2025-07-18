import { Component, input } from '@angular/core';
import { Home } from '../home/home';

@Component({
  selector: 'app-greetings',
  imports: [],
  templateUrl: './greetings.html',
  styleUrl: './greetings.scss'
})
export class Greetings {
  message = input('Hello Hello');
}
