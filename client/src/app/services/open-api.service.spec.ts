import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OpenApiService } from './open-api.service';

describe('OpenApiService', () => {
  let service: OpenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OpenApiService],
    });
    service = TestBed.inject(OpenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
