import { Injectable, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';

type Theme = 'light' | 'dark';
const THEME_KEY = 'app_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  readonly theme = signal<Theme>(this.storage.get<Theme>(THEME_KEY) ?? 'light');

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      this.storage.set(THEME_KEY, t);
    });
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  toggle(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  setTheme(t: Theme): void {
    this.theme.set(t);
  }
}
