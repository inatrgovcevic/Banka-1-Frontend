import { Component, OnInit } from '@angular/core';
import { ExchangeService } from '../../services/exchange.service';

@Component({
  selector: 'app-exchange-list',
  templateUrl: './exchange-list.component.html',
  styleUrls: ['./exchange-list.component.css']
})
export class ExchangeListComponent implements OnInit {

  exchanges: any[] = [];

  constructor(private exchangeService: ExchangeService) {}

  ngOnInit(): void {
    this.exchangeService.getExchanges().subscribe({
      next: (data) => {
        this.exchanges = data;
      },
      error: (err: any) => {
        console.error('API ne radi', err);

    
        
      }
    });
  }

  onWorkingHoursToggle(exchange: any): void {
    exchange.workingHoursEnabled = !exchange.workingHoursEnabled;

    // kasnije ovde pozvati api
    // this.exchangeService.toggleWorkingHours(exchange.id).subscribe()
  }


}