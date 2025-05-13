import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModelTableComponent } from './core-model-table.component';

describe('CoreModelTableComponent', () => {
  let component: CoreModelTableComponent;
  let fixture: ComponentFixture<CoreModelTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreModelTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreModelTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
