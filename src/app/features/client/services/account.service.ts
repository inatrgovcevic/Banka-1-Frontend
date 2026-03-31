import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Account, ChangeLimitDto } from '../models/account.model';
import { Transaction, TransactionPage } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly baseUrl = `${environment.apiUrl}/accounts/client/accounts`;
  private readonly api = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getMyAccounts(): Observable<Account[]> {
    const page = 0;
    const size = 50;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((res) => {
        if (!res.content) return [];
        const mapped = res.content.map((item: any) =>
          this.mapToAccountFromClient(item),
        );
        console.log(
          'Loaded accounts with currencies:',
          mapped.map((a: Account) => ({
            name: a.name,
            accountNumber: a.accountNumber,
            currency: a.currency,
          })),
        );
        return mapped;
      }),
    );
  }

  /**
   * Employee endpoint for all accounts in the system with pagination support.
   */
  getAllAccountsPaginated(
    page: number = 0,
    size: number = 10,
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(
      `${environment.apiUrl}/accounts/employee/accounts`,
      { params },
    );
  }

  private mapToAccountFromClient(item: any): Account {
    const subtype = this.mapToSubtypeFromClient(
      item.accountType,
      item.accountCategory,
    );

    // Try to get currency from multiple possible field names
    const currency = item.currency || item.valuta || item.tek || 'RSD';

    return {
      id: this.hashAccountNumber(item.brojRacuna), // Generate unique ID from account number
      name: item.nazivRacuna || '',
      accountNumber: item.brojRacuna || '',
      balance: 0,
      availableBalance: item.raspolozivoStanje || 0,
      reservedFunds: 0,
      currency: currency,
      status: 'ACTIVE', // Assume all returned accounts are active
      subtype: subtype,
      ownerId: 0,
      ownerName: '',
      employeeId: 0,
      maintenanceFee: 0,
      dailyLimit: 0,
      monthlyLimit: 0,
      dailySpending: 0,
      monthlySpending: 0,
      createdAt: new Date().toISOString(),
      expiryDate: '',
    } as Account;
  }

  private mapToSubtypeFromClient(
    accountType: string,
    accountCategory: string,
  ): any {
    if (accountType === 'BUSINESS') {
      return accountCategory === 'CHECKING' ? 'DOO' : 'AD';
    }
    return accountCategory === 'CHECKING' ? 'STANDARD' : 'SAVINGS';
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  getTransactions(
    accountNumber: string,
    page = 0,
    size = 5,
  ): Observable<Transaction[]> {
    return this.http
      .get<TransactionPage>(
        `${environment.apiUrl}/transactions/employee/accounts/${accountNumber}`,
        {
          params: { page: page.toString(), size: size.toString() },
        },
      )
      .pipe(map((res) => res.content));
  }

  renameAccount(accountNumber: string, name: string): Observable<void> {
    return this.http.put<void>(
      `${this.api}/client/api/accounts/${accountNumber}/name`,
      { accountName: name },
      { responseType: 'text' as 'json' },
    );
  }

  changeLimit(
    accountNumber: string,
    dailyLimit: number,
    monthlyLimit: number,
    verificationCode: string,
    verificationSessionId: string,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.api}/client/api/accounts/${accountNumber}/limits`,
      {
        dailyLimit: dailyLimit,
        monthlyLimit: monthlyLimit,
        verificationCode: verificationCode,
        verificationSessionId: +verificationSessionId,
      } as ChangeLimitDto,
    );
  }

  createFxAccount(payload: any): Observable<any> {
    return this.http.post(`${this.api}/employee/accounts/fx`, payload);
  }

  createCheckingAccount(payload: any): Observable<any> {
    return this.http.post(`${this.api}/employee/accounts/checking`, payload);
  }

  /**
   * Activate/deactivate account by account ID.
   * Backend endpoint is expected to accept status update.
   */
  updateAccountStatus(
    accountNumber: string,
    status: 'ACTIVE' | 'INACTIVE',
  ): Observable<any> {
    return this.http.put<any>(
      `${this.api}/employee/accounts/${accountNumber}/status`,
      { status },
      { responseType: 'text' as 'json' }
    );
  }

  /**
   * Generate unique numeric ID from account number
   */
  private hashAccountNumber(accountNumber: string): number {
    let hash = 0;
    for (let i = 0; i < accountNumber.length; i++) {
      const char = accountNumber.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
