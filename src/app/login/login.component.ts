import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isSignup = false;

  async login() {
    if (this.form.invalid) {
      this.toast.show('يرجى ملء جميع الحقول', 'danger');
      return;
    }

    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';
    const success = await this.auth.login(email, password);

    if (success) {
      this.toast.show('تم تسجيل الدخول بنجاح', 'success');
      await this.router.navigate(['/']);
    } else {
      this.toast.show('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'danger');
    }
  }

  async signup() {
    if (this.form.invalid) {
      this.toast.show('يرجى ملء جميع الحقول', 'danger');
      return;
    }

    const name = this.form.value.name ?? '';
    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';
    const success = await this.auth.signUp(email, password, name);

    if (success) {
      this.toast.show('تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول', 'success');
      this.isSignup = false;
      this.form.reset();
    } else {
      this.toast.show('حدث خطأ أثناء إنشاء الحساب', 'danger');
    }
  }

  toggleMode() {
    this.isSignup = !this.isSignup;
    this.form.reset();
  }
}
