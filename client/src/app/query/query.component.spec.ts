import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryComponent } from './query.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('QueryComponent', () => {
  let component: QueryComponent;
  let fixture: ComponentFixture<QueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryComponent],
      providers: [provideHttpClient(), provideRouter([]), provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(QueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
