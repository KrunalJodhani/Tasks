import { Component, inject, signal } from '@angular/core';
import { todoService } from '../services/todos';
import { Todo } from '../model/todo.type';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterTodoPipe } from '../pipes/filter-todo-pipe';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-todos',
  imports: [CommonModule, FormsModule, FilterTodoPipe, MatListModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
  standalone: true
})
export class Todos {
  todoService = inject(todoService);
  todoItem = signal<Array<Todo>>([]);
  searchText = signal('');
  selectedTodos = signal<Array<Todo>>([]);

  ngOnInit(): void {
    this.todoService
      .getTodosFromAPI()
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      )
      .subscribe((todos) => {
        this.todoItem.set(todos);
        // Initialize selected items based on completed status
        this.selectedTodos.set(todos.filter(todo => todo.completed));
      });
  }
  
  // Calculate completion statistics
  get completedCount(): number {
    return this.todoItem().filter(todo => todo.completed).length;
  }
  
  get totalCount(): number {
    return this.todoItem().length;
  }
  
  onSelectionChange(event: any) {
    // Extract the selected todos from the event
    const selectedOptions = event.source.selectedOptions.selected;
    const selectedTodosList: Todo[] = selectedOptions.map((option: any) => option.value);
    
    // Update the completed status based on selection
    this.todoItem.update(todos => {
      return todos.map(todo => {
        const isSelected = selectedTodosList.some(selected => selected.id === todo.id);
        if (todo.completed !== isSelected) {
          return { ...todo, completed: isSelected };
        }
        return todo;
      });
    });
    
    this.selectedTodos.set(selectedTodosList);
  }
  
  onTodoToggle(todoItem: Todo) {
    this.todoItem.update((todos) => {
      return todos.map((todo) => {
        if (todo.id === todoItem.id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      }); 
    });
  }
}
