import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  readonly type = input<'card' | 'list' | 'text' | 'avatar' | 'button'>('card');
  readonly width = input<string>('100%');
  readonly height = input<string | number>('auto');
  readonly count = input<number>(1);
  readonly rounded = input<boolean>(true);

  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
