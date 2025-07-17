import { Component, EventEmitter, Output } from '@angular/core';
import { Todo } from '../todo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-to-do',
  imports: [FormsModule],
  templateUrl: './add-to-do.html',
  styleUrl: './add-to-do.css',
  standalone: true,
})
export class AddToDo {
  todoVal: string = '';
  
  @Output() newTodo = new EventEmitter<Todo>();

  addTodo() {
    if (this.todoVal.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        task: this.todoVal,
        isDone: false
      };
      this.newTodo.emit(newTodo);
      this.todoVal = '';
    }
  } 
}
