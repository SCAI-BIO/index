import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';

import { ApiError } from '../interfaces/api-error';
import { CoreModel } from '../interfaces/core-model';
import { ExternalLinkService } from '../services/external-link.service';

@Component({
  selector: 'app-core-model-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    RouterModule,
  ],
  templateUrl: './core-model-table.component.html',
  styleUrl: './core-model-table.component.scss',
})
export class CoreModelTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<CoreModel>([]);
  loading = false;
  subscriptions: Subscription[] = [];

  displayedColumns = [
    'id',
    'label',
    'description',
    'olsId',
    'olsLabel',
    'olsDescription',
    'ohdsiId',
    'ohdsiLabel',
    'ohdsiDomain',
    'study1Variable',
    'study1Description',
    'study2Variable',
  ];

  constructor(
    private externalLinkService: ExternalLinkService,
    private http: HttpClient
  ) {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAthenaLink(termId: string): string {
    return this.externalLinkService.getAthenaLink(termId);
  }

  getOlsLink(termId: string): string {
    return this.externalLinkService.getOlsLink(termId);
  }

  getSortingDataAccessor(): (item: CoreModel, property: string) => string {
    return (item: CoreModel, property: string): string => {
      let value: string | undefined;

      switch (property) {
        case 'olsId':
          value = item.ols?.id;
          break;
        case 'olsLabel':
          value = item.ols?.label;
          break;
        case 'olsDescription':
          value = item.ols?.description;
          break;
        case 'ohdsiId':
          value = item.ohdsi?.id;
          break;
        case 'ohdsiLabel':
          value = item.ohdsi?.label;
          break;
        case 'ohdsiDomain':
          value = item.ohdsi?.domain;
          break;
        case 'study1Variable':
          value = item.studies?.[0]?.variable;
          break;
        case 'study1Description':
          value = item.studies?.[0]?.definition;
          break;
        case 'study2Variable':
          value = item.studies?.[1]?.variable;
          break;
        case 'id':
          value = item.id;
          break;
        case 'label':
          value = item.label;
          break;
        case 'description':
          value = item.description;
          break;
        default:
          value = '';
      }

      return value === null || value === undefined || value.trim() === ''
        ? 'ÿ' // blank values sort last
        : value.toLowerCase();
    };
  }

  handleError(err: ApiError): void {
    console.error('Error fetching data:', err);
    this.loading = false;

    const detail = err.error?.detail;
    const message = err.error?.message || err.message;
    const errorMessage =
      detail && message
        ? `${message} — ${detail}`
        : detail || message || 'An unknown error occurred.';

    alert(`An error occurred while fetching data: ${errorMessage}`);
  }

  initializeDataSource(data: CoreModel[]): void {
    this.dataSource.data = data;

    this.dataSource.filterPredicate = (
      data: CoreModel,
      filter: string
    ): boolean => {
      const text = [
        data.id,
        data.label,
        data.description,
        data.ols.id,
        data.ols.label,
        data.ols.description,
        data.ohdsi.id,
        data.ohdsi.label,
        data.ohdsi.domain,
        data.studies[0].variable,
        data.studies[0].definition,
        data.studies[1].variable,
      ]
        .filter((v): v is string => !!v)
        .join('')
        .toLowerCase();

      return text.includes(filter);
    };

    this.dataSource.sortingDataAccessor = this.getSortingDataAccessor();

    this.dataSource.sortData = (
      dataArray: CoreModel[],
      sort: MatSort
    ): CoreModel[] => {
      const active = sort.active;
      const direction = sort.direction;

      if (!active || direction === '') return dataArray;

      const accessor = this.getSortingDataAccessor();

      return [...dataArray].sort((a, b) => {
        const valueA = accessor(a, active);
        const valueB = accessor(b, active);

        const isBlankA = valueA === 'ÿ';
        const isBlankB = valueB === 'ÿ';

        // Blank values always sort last
        if (isBlankA && !isBlankB) return 1;
        if (!isBlankA && isBlankB) return -1;
        if (isBlankA && isBlankB) return 0;

        const comparison = valueA.localeCompare(valueB);
        return direction === 'asc' ? comparison : -comparison;
      });
    };

    // Wait for view to initialize
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngOnInit(): void {
    this.loadCoreModelData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadCoreModelData(): void {
    this.loading = true;

    const sub = this.http.get<CoreModel[]>('assets/core_model.json').subscribe({
      next: (data) => this.initializeDataSource(data),
      error: (err: ApiError) => this.handleError(err),
      complete: () => (this.loading = false),
    });

    this.subscriptions.push(sub);
  }
}
