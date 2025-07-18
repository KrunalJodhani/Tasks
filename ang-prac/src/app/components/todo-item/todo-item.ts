import { Component, input, output } from '@angular/core';
import { Todo } from '../../model/todo.type';
import { HighlightCompletedTodo } from '../../directives/highlight-completed-todo';

@Component({
  selector: 'app-todo-item',
  imports: [HighlightCompletedTodo],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.scss',
})
export class TodoItem {
  todo = input.required<Todo>();
  toggledTodo = output<Todo>();

  todoChecked(){
    this.toggledTodo.emit(this.todo());
  }
}
