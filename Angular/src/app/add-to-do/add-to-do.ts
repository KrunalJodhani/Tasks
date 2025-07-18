import { Component } from '@angular/core';
import {Todo} from '../todo';
import { FormsModule } from '@angular/forms';
import { ViewToDo } from '../view-to-do/view-to-do';

@Component({
  selector: 'app-add-to-do',
  imports: [FormsModule, ViewToDo],
  templateUrl: './add-to-do.html',
  styleUrl: './add-to-do.css'
})
export class AddToDo {
  todoVal: string = '';
  list: Todo[] = [];

  viewTodo : ViewToDo = new ViewToDo();

  addTodo() {
    if (this.todoVal !== '') {
      const newTodo: Todo = {
        id: this.list.length,
        task: this.todoVal,
        isDone: false,
      }
      this.list.push(newTodo);
    }    
    this.todoVal = '';
  } 
}
