import {
  AfterViewInit,
  Component,
  ViewChild,
  Input,
  OnInit,
} from '@angular/core';
import { Mapping } from '../models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-mappings-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule],
  templateUrl: './mappings-table.component.html',
  styleUrl: './mappings-table.component.scss',
})
export class MappingsTableComponent implements OnInit {
  @Input() datasource: Mapping[] = [];
  table_data!: MatTableDataSource<Mapping>;

  displayedColumns: string[] = ['text', 'similarity'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.table_data.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.table_data = new MatTableDataSource<Mapping>(this.datasource);
  }
}
