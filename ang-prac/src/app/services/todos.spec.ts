import { TestBed } from '@angular/core/testing';

import { todoService } from './todos';

describe('Todos', () => {
  let service: todoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(todoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
