import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OpenApiService } from './open-api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('OpenApiService', () => {
  let service: OpenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [OpenApiService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(OpenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
