import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todo';
import { Input } from '@angular/core';

@Component({
  selector: 'app-view-to-do',
  imports: [FormsModule],
  templateUrl: './view-to-do.html',
  styleUrl: './view-to-do.css'
})
export class ViewToDo {
  list:Todo[] = [];

  @Input() todo : Todo[] = [];

  deleteTodo(id: number) {
    const todoToDelete = this.list.find(todo => todo.id === id);
    
    if (todoToDelete && todoToDelete.isDone) {
      this.list = this.list.filter(todo => todo.id !== id);
    } else {
      alert("Please complete task before deleting it.");
    }
  }
}
