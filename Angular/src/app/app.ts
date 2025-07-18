import { Component, signal } from '@angular/core'
import { Todo } from './todo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewToDo } from "./view-to-do/view-to-do";
import { AddToDo } from './add-to-do/add-to-do';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, ViewToDo,AddToDo],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  todoVal: string = '';
  list: Todo[] = [];

  ngOnInit() {
    this.list = [];
    this.todoVal = '';
  }
}
