import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingsTableDictComponent } from './mappings-table-dict.component';

describe('MappingsTableDictComponent', () => {
  let component: MappingsTableDictComponent;
  let fixture: ComponentFixture<MappingsTableDictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MappingsTableDictComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingsTableDictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
