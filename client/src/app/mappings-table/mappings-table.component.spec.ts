import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MappingsTableComponent } from './mappings-table.component';

describe('MappingsTableComponent', () => {
  let component: MappingsTableComponent;
  let fixture: ComponentFixture<MappingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MappingsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MappingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
