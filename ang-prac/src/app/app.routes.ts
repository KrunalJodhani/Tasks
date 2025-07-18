import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent() {
            return import('../app/components/home/home').then((m) => m.Home);
        },
    },
    {
        path: 'todos',
        loadComponent(){
            return import('../app/todos/todos').then((m) => m.Todos);
        }
    }
];
