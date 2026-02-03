import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  async login() {
    if (this.form.invalid) {
      this.toast.show('يرجى ملء جميع الحقول', 'danger');
      return;
    }

    const username = this.form.value.username ?? '';
    const password = this.form.value.password ?? '';
    const success = await this.auth.login(username, password);

    if (success) {
      this.toast.show('تم تسجيل الدخول بنجاح', 'success');
      await this.router.navigate(['/']);
    } else {
      this.toast.show('اسم المستخدم أو كلمة المرور غير صحيحة', 'danger');
    }
  }
}
