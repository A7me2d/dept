import { Component, computed, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { ToastComponent } from '../toast/toast.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, ToastComponent, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  protected readonly title = signal('مصروفاتي');
  protected readonly year = computed(() => new Date().getFullYear());
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly currentUser = this.auth.currentUser;
  protected readonly userName = computed(() => this.currentUser()?.user_metadata?.name || this.currentUser()?.email?.split('@')[0] || 'مستخدم');
  protected readonly isDark = this.theme.isDark;

  async logout() {
    await this.auth.logout();
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }
}
