import { Injectable, signal } from '@angular/core';

export type ThemeId = 'default' | 'feminine' | 'corporate';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    sidebar: string;
    primary: string;
    bg: string;
    accent: string;
  };
  icon: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Classique',
    description: 'Design actuel — bleu, moderne, épuré',
    preview: { sidebar: '#0f172a', primary: '#2563eb', bg: '#f8fafc', accent: '#3b82f6' },
    icon: 'brightness_5',
  },
  {
    id: 'feminine',
    name: 'Élégant',
    description: 'Doux, raffiné — rose, violet, pastel',
    preview: { sidebar: '#2d1b4e', primary: '#c026d3', bg: '#fdf4ff', accent: '#a855f7' },
    icon: 'auto_awesome',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Ultra-pro, enterprise SaaS — noir, gris',
    preview: { sidebar: '#09090b', primary: '#18181b', bg: '#f4f4f5', accent: '#71717a' },
    icon: 'domain',
  },
];

const STORAGE_KEY = 'kms-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _activeTheme = signal<ThemeId>(this.loadFromStorage());
  readonly activeTheme = this._activeTheme.asReadonly();

  readonly themes = THEMES;

  constructor() {
    this.applyTheme(this._activeTheme());
  }

  setTheme(id: ThemeId): void {
    this._activeTheme.set(id);
    this.applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  getThemeDef(id: ThemeId = this._activeTheme()): ThemeDefinition {
    return THEMES.find(t => t.id === id) ?? THEMES[0];
  }

  private applyTheme(id: ThemeId): void {
    const body = document.body;
    // Remove all theme classes
    body.classList.remove('theme-default', 'theme-feminine', 'theme-corporate');
    body.classList.add(`theme-${id}`);
  }

  private loadFromStorage(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return (stored && THEMES.some(t => t.id === stored)) ? stored : 'default';
  }
}
