import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';

@Component({
  selector: 'app-employee-create-modal',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.css']
})
export class EmployeeCreateComponent implements OnInit {
  employeeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    // Imena kontrola ostaju na engleskom zbog HTML-a
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['M', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValues = this.employeeForm.value;

    // MAPIRANJE: Pretvaramo engleska polja sa forme u srpska polja za backend
    const payload: Employee = {
      ime: formValues.firstName,
      prezime: formValues.lastName,
      email: formValues.email,
      brojTelefona: formValues.phoneNumber,
      datumRodjenja: formValues.birthDate,
      pol: formValues.gender,
      aktivan: true, // Po defaultu novi radnik je aktivan
      pozicija: 'Regular', // Neka default pozicija
      permisije: []
    };

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        // Kad backend odgovori sa 200 OK, vraćamo se na tabelu
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        console.error('Greška pri kreiranju zaposlenog:', err);
      }
    });
  }
}