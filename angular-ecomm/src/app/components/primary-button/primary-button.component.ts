import { Component, EventEmitter, Input, input, Output, output } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-primary-button',
  imports: [MatButtonModule],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.scss'
})
export class PrimaryButtonComponent {
  label = input('');

  @Output() btnClicked = new EventEmitter<void>();
}
