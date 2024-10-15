import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { Mapping, MappingDict } from '../models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

export interface Row {
  variable: string;
  description: string;
  mapping: Mapping;
}

@Component({
  selector: 'app-mappings-table-dict',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule],
  templateUrl: './mappings-table-dict.component.html',
  styleUrl: './mappings-table-dict.component.scss',
})
export class MappingsTableComponentDict implements OnInit {
  @Input() datasource: MappingDict[] = [];
  table_data!: MatTableDataSource<Row>;

  displayedColumns: string[] = [
    'description',
    'term',
    'similarity',
    'concept_id',
    'concept_label',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.table_data.paginator = this.paginator;
  }

  ngOnInit(): void {
    const rows: Row[] = this.datasource.map((val) => ({
      description: val.description,
      variable: val.variable,
      mapping: val.mappings[0],
    }));

    this.table_data = new MatTableDataSource<Row>(rows);
  }
}
