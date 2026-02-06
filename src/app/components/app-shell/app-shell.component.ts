import { Component, computed, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { ToastComponent } from '../toast/toast.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, ToastComponent, MatIconModule, MatButtonModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  protected readonly title = signal('مصروفاتي');
  protected readonly year = computed(() => new Date().getFullYear());
  private readonly auth = inject(AuthService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly currentUser = this.auth.currentUser;
  protected readonly userName = computed(() => this.currentUser()?.user_metadata?.name || this.currentUser()?.email?.split('@')[0] || 'مستخدم');

  async logout() {
    await this.auth.logout();
  }
}
