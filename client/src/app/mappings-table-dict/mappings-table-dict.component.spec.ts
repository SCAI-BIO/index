import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MappingsTableComponentDict } from './mappings-table-dict.component';

describe('MappingsTableDictComponent', () => {
  let component: MappingsTableComponentDict;
  let fixture: ComponentFixture<MappingsTableComponentDict>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MappingsTableComponentDict],
    }).compileComponents();

    fixture = TestBed.createComponent(MappingsTableComponentDict);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
