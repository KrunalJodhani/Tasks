import { DragDrop } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Drag } from './drag-drop/drag-drop';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule,MatInputModule,MatListModule,Drag],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('material');
}
