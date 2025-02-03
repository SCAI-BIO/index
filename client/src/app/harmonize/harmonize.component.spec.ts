import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarmonizeComponent } from './harmonize.component';

describe('HarmonizeComponent', () => {
  let component: HarmonizeComponent;
  let fixture: ComponentFixture<HarmonizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HarmonizeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HarmonizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
