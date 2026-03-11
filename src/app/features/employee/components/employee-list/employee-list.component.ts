import { Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  currentSearchTerm: string = '';
  currentStatusFilter: string = 'All';
  currentPermissionFilter: string = 'All';

  selectedEmployeeForEdit: Employee | null = null;
  isEditModalOpen: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        this.employees = data.content || data;
        this.filteredEmployees = this.employees;
      },
      error: (err) => console.error('Greška pri učitavanju zaposlenih:', err)
    });
  }

  onSearchInput(event: any): void {
    this.currentSearchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  onStatusChange(event: any): void {
    this.currentStatusFilter = event.target.value;
    this.applyFilters();
  }

  onPermissionChange(event: any): void {
    this.currentPermissionFilter = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = 
        (emp.ime?.toLowerCase().includes(this.currentSearchTerm) || false) || 
        (emp.prezime?.toLowerCase().includes(this.currentSearchTerm) || false) ||
        (emp.email?.toLowerCase().includes(this.currentSearchTerm) || false);

      let matchesStatus = true;
      if (this.currentStatusFilter === 'Active') matchesStatus = emp.aktivan === true;
      else if (this.currentStatusFilter === 'Inactive') matchesStatus = emp.aktivan === false;

      let matchesPermission = true;
      if (this.currentPermissionFilter !== 'All') {
        matchesPermission = emp.permisije ? emp.permisije.includes(this.currentPermissionFilter) : false;
      }

      return matchesSearch && matchesStatus && matchesPermission;
    });
  }

  deleteEmployee(id: number | undefined): void {
    if (!id) return;
    if (confirm('Da li ste sigurni da želite da obrišete ovog zaposlenog?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== id);
          this.applyFilters(); 
        },
        error: (err) => console.error('Greška pri brisanju:', err)
      });
    }
  }

  trackById(index: number, employee: Employee): number {
    return employee.id || index;
  }

  editEmployee(id: number | undefined): void {
    if (!id) return;
    const emp = this.employees.find(e => e.id === id);
    if (emp) {
      this.selectedEmployeeForEdit = emp;
      this.isEditModalOpen = true;
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedEmployeeForEdit = null;
  }

  // OVO JE DODATO: Poziva backend da ažurira korisnika
  onEmployeeSaved(updatedEmployee: Employee): void {
    if (!updatedEmployee.id) return;

    this.employeeService.updateEmployee(updatedEmployee.id, updatedEmployee).subscribe({
      next: (response) => {
        const index = this.employees.findIndex(e => e.id === response.id);
        if (index !== -1) {
          this.employees[index] = response;
          this.applyFilters(); 
        }
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Greška pri izmeni zaposlenog:', err);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}