import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmbeddingPlotComponent } from './embedding-plot.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

xdescribe('EmbeddingPlotComponent', () => {
  let component: EmbeddingPlotComponent;
  let fixture: ComponentFixture<EmbeddingPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EmbeddingPlotComponent],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(EmbeddingPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
