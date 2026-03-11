import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../../models/employee';
@Component({
  selector: 'app-employee-edit-modal',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})
export class EmployeeEditComponent implements OnChanges {
  @Input() employee!: Employee;
  @Output() save = new EventEmitter<Employee>();
  @Output() cancel = new EventEmitter<void>();

  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicijalizujemo formu sa pravilima (validacijama)
    this.editForm = this.fb.group({
      ime: ['', [Validators.required, Validators.minLength(2)]],
      prezime: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      pozicija: ['Regular employee'],
      aktivan: [true],
      permisije: [[]] // Čuvamo niz dozvola
    });
  }

  // Ovo se poziva čim klikneš na "Edit" u tabeli da popuni formu starim podacima
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee) {
      this.editForm.patchValue({
        ime: this.employee.ime || '',
        prezime: this.employee.prezime || '',
        email: this.employee.email || '',
        pozicija: this.employee.pozicija || 'Regular employee',
        aktivan: this.employee.aktivan !== false,
        permisije: this.employee.permisije ? [...this.employee.permisije] : []
      });
    }
  }

  // Upravljanje checkbox-ovima
  togglePermission(permission: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    let currentPermissions = this.editForm.get('permisije')?.value as string[];
    
    if (isChecked) {
      currentPermissions.push(permission);
    } else {
      currentPermissions = currentPermissions.filter((p: string) => p !== permission);
    }
    
    this.editForm.patchValue({ permisije: currentPermissions });
  }

  onSave(): void {
    // Ako polja nisu dobro popunjena, prekida čuvanje i boji ih u crveno
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // Spajamo stari ID i ostala polja sa novim vrednostima iz forme
    const updatedEmployee: Employee = {
      ...this.employee, 
      ...this.editForm.value
    };

    this.save.emit(updatedEmployee);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}