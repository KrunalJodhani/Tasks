import { Component, Output, EventEmitter } from '@angular/core';
import {Todo} from '../todo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-to-do',
  imports: [FormsModule],
  templateUrl: './add-to-do.html',
  styleUrl: './add-to-do.css'
})
export class AddToDo {
  todoVal: string = '';
  @Output() newTodo = new EventEmitter<Todo>();

  addTodo() {
    if (this.todoVal !== '') {
      const newTodo: Todo = {
        id: Date.now(), // Using timestamp for unique ID
        task: this.todoVal,
        isDone: false,
      }
      this.newTodo.emit(newTodo);
    }    
    this.todoVal = '';
  } 
}
