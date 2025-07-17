import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToDo } from './add-to-do';

describe('AddToDo', () => {
  let component: AddToDo;
  let fixture: ComponentFixture<AddToDo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToDo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToDo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
