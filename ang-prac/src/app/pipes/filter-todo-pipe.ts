import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from '../model/todo.type';

@Pipe({
  name: 'filterTodo'
})
export class FilterTodoPipe implements PipeTransform {

  transform(todos: Todo[], search:string): Todo[] {
    if(!search){
      return todos;
    }
    const searchLower = search.toLocaleLowerCase();
    return todos.filter(todo =>{
      return todo.title.toLowerCase().includes(searchLower);
    })
  }
}
