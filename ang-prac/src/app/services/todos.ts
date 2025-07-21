import { inject, Injectable } from '@angular/core';
import { Todo } from '../model/todo.type';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface ApiTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class todoService {
  http = inject(HttpClient);

  getTodosFromAPI(): Observable<Array<Todo>> {
    const url = `https://jsonplaceholder.typicode.com/todos`;
    return this.http.get<Array<ApiTodo>>(url).pipe(
      map(apiTodos => this.mapApiTodosToAppTodos(apiTodos))
    );
  }

  private mapApiTodosToAppTodos(apiTodos: ApiTodo[]): Todo[] {
    return apiTodos.map(apiTodo => ({
      id: apiTodo.id,
      userid: apiTodo.userId,
      title: apiTodo.title,
      completed: apiTodo.completed
    }));
  }
}
