import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewToDo } from './view-to-do';

describe('ViewToDo', () => {
  let component: ViewToDo;
  let fixture: ComponentFixture<ViewToDo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewToDo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewToDo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
