import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingsTableComponent } from './mappings-table.component';

describe('MappingsTableComponent', () => {
  let component: MappingsTableComponent;
  let fixture: ComponentFixture<MappingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MappingsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
