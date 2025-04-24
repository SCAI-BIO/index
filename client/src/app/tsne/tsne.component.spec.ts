import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsneComponent } from './tsne.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('TsneComponent', () => {
  let component: TsneComponent;
  let fixture: ComponentFixture<TsneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TsneComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TsneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
