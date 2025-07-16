import { Component, signal } from '@angular/core'
import { Todo } from './todo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  todoVal: string = '';
  list: Todo[] = [];

  ngOnInit() {
    this.list = [];
    this.todoVal = '';
  }

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

  deleteTodo(id: number) {
    const todoToDelete = this.list.find(todo => todo.id === id);
    
    if (todoToDelete && todoToDelete.isDone) {
      this.list = this.list.filter(todo => todo.id !== id);
    } else {
      alert("Please complete task before deleting it.");
    }
  }
}
