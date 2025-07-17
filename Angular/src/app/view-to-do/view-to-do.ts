import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todo';

@Component({
  selector: 'app-view-to-do',
  imports: [FormsModule],
  templateUrl: './view-to-do.html',
  styleUrl: './view-to-do.css',
  standalone: true
})
export class ViewToDo {
  @Input() list: Todo[] = [];

  deleteTodo(id: number) {
    const todoToDelete = this.list.find(todo => todo.id === id);
    
    if (todoToDelete && todoToDelete.isDone) {
      const index = this.list.findIndex(todo => todo.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
      }
    } else {
      alert("Please complete task before deleting it.");
    }
  }
}
