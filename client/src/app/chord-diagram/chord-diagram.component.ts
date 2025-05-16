import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subscription } from 'rxjs';

import { ChordData } from '../interfaces/chord-diagram';
import { ApiError } from '../interfaces/api-error';
import { ChordDiagramService } from '../services/chord-diagram.service';

@Component({
  selector: 'app-mappings',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './chord-diagram.component.html',
  styleUrl: './chord-diagram.component.scss',
})
export class ChordDiagramComponent implements OnInit, OnDestroy {
  currentIndex: number;
  dataChunks: ChordData[] = [];
  loading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    private chordService: ChordDiagramService,
    private http: HttpClient
  ) {
    this.loading = false;
    this.currentIndex = 0;
  }

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  fetchData(): void {
    this.loading = true;
    const sub = this.http.get<ChordData>(`assets/chord_data.json`).subscribe({
      next: (v) => {
        this.dataChunks = this.chordService.chunkData(v, 33);
        this.chordService.createChordDiagrams(
          this.dataChunks,
          this.currentIndex
        );
      },
      error: (err) => this.handleError(err),
      complete: () => (this.loading = false),
    });
    this.subscriptions.push(sub);
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

  next(): void {
    if (this.currentIndex < this.dataChunks.length - 1) {
      this.currentIndex++;
      this.chordService.createChordDiagrams(this.dataChunks, this.currentIndex);
    }
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.chordService.createChordDiagrams(this.dataChunks, this.currentIndex);
    }
  }
}
