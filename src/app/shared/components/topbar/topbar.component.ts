import {
  Component, DestroyRef, ElementRef, Inject,
  AfterViewInit, OnDestroy, PLATFORM_ID, inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-spark-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <header class="ak-topbar" [class.ak-topbar--scrolled]="scrolled">
      <div class="ak-topbar__inner">
        <a routerLink="/" class="ak-topbar__brand" aria-label="Akroma Spark — início" (click)="closeDrawer()">
          <img src="assets/icone-akroma.png" alt="" class="ak-topbar__logo" aria-hidden="true">
          <span class="ak-topbar__name">Akroma <span class="ak-topbar__accent">Spark</span></span>
        </a>

        <nav class="ak-topbar__nav" aria-label="Navegação principal">
          <a routerLink="/" routerLinkActive="ak-topbar__link--active"
             [routerLinkActiveOptions]="{exact: true}" class="ak-topbar__link">Início</a>
          <a routerLink="/como-funciona" routerLinkActive="ak-topbar__link--active"
             class="ak-topbar__link">Como funciona</a>
          <a routerLink="/recursos" routerLinkActive="ak-topbar__link--active"
             class="ak-topbar__link">Recursos</a>
          <a routerLink="/planos" routerLinkActive="ak-topbar__link--active"
             class="ak-topbar__link">Planos</a>
        </nav>

        <div class="ak-topbar__actions">
          <!-- Slot lang-switcher (vazio no Spark, usado pelo Akroma-Site) -->
          <div class="ak-topbar__lang"></div>
          <a routerLink="/entrar" class="ak-topbar__login">Entrar</a>
          <a routerLink="/cadastro" class="ak-topbar__cta">Teste grátis</a>
        </div>

        <button type="button"
                class="ak-topbar__burger"
                [class.ak-topbar__burger--open]="drawerOpen"
                aria-label="Abrir menu"
                [attr.aria-expanded]="drawerOpen"
                (click)="toggleDrawer()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <div class="ak-drawer"
         [class.ak-drawer--open]="drawerOpen"
         role="dialog" aria-modal="true" aria-label="Menu"
         (click)="closeDrawer()">
      <div class="ak-drawer__panel" (click)="$event.stopPropagation()">
        <a routerLink="/" routerLinkActive="ak-drawer__link--active" [routerLinkActiveOptions]="{exact: true}"
           class="ak-drawer__link" (click)="closeDrawer()">Início</a>
        <a routerLink="/como-funciona" routerLinkActive="ak-drawer__link--active"
           class="ak-drawer__link" (click)="closeDrawer()">Como funciona</a>
        <a routerLink="/recursos" routerLinkActive="ak-drawer__link--active"
           class="ak-drawer__link" (click)="closeDrawer()">Recursos</a>
        <a routerLink="/planos" routerLinkActive="ak-drawer__link--active"
           class="ak-drawer__link" (click)="closeDrawer()">Planos</a>
        <div class="ak-drawer__divider"></div>
        <a routerLink="/entrar" class="ak-drawer__link ak-drawer__link--muted" (click)="closeDrawer()">Entrar</a>
        <a routerLink="/cadastro" class="ak-drawer__cta" (click)="closeDrawer()">Teste grátis 7 dias &rarr;</a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --ak-accent:       #fbbf24;
      --ak-accent-2:     #f59e0b;
      --ak-accent-deep:  #d97706;
      --ak-bg:           rgba(5, 8, 16, 0.6);
      --ak-bg-scrolled:  rgba(5, 8, 16, 0.95);
    }

    .ak-topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      height: 72px;
      background: var(--ak-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s, border-color 0.2s;
    }
    .ak-topbar--scrolled {
      background: var(--ak-bg-scrolled);
      border-bottom-color: color-mix(in srgb, var(--ak-accent) 20%, transparent);
    }
    .ak-topbar__inner {
      max-width: 1200px; height: 100%; margin: 0 auto;
      padding: 0 24px;
      display: flex; align-items: center;
      position: relative;
    }
    .ak-topbar__brand {
      display: inline-flex; align-items: center; gap: 12px;
      text-decoration: none; color: #fff;
      transition: opacity 0.2s;
    }
    .ak-topbar__brand:hover { opacity: 0.85; }
    .ak-topbar__logo {
      height: 40px; width: auto;
      filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .ak-topbar__name { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .ak-topbar__accent {
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .ak-topbar__nav {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 28px;
    }
    .ak-topbar__actions {
      margin-left: auto;
      display: flex; align-items: center; gap: 8px;
    }
    .ak-topbar__lang { display: inline-flex; align-items: center; }
    .ak-topbar__lang:empty { display: none; }

    .ak-topbar__link {
      position: relative;
      color: #9ca3af; font-size: 14px; font-weight: 500;
      text-decoration: none; padding: 6px 0;
      transition: color 0.15s;
    }
    .ak-topbar__link::after {
      content: ''; position: absolute;
      left: 0; right: 0; bottom: -4px; height: 2px;
      background: var(--ak-accent);
      transform: scaleX(0); transform-origin: center;
      transition: transform 0.25s;
      border-radius: 2px;
    }
    .ak-topbar__link:hover { color: #fff; }
    .ak-topbar__link--active { color: var(--ak-accent); }
    .ak-topbar__link--active::after { transform: scaleX(1); }

    .ak-topbar__login {
      color: #d1d5db; font-size: 14px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .ak-topbar__login:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .ak-topbar__cta {
      background: linear-gradient(135deg, var(--ak-accent-2), var(--ak-accent-deep));
      color: #000; font-size: 14px; font-weight: 700;
      padding: 10px 18px; border-radius: 10px;
      text-decoration: none;
      border: 1px solid color-mix(in srgb, var(--ak-accent) 40%, transparent);
      box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--ak-accent-2) 35%, transparent);
      transition: filter 0.15s, transform 0.15s;
    }
    .ak-topbar__cta:hover { filter: brightness(1.08); transform: translateY(-1px); }

    .ak-topbar__burger {
      display: none;
      width: 40px; height: 40px;
      background: none; border: none;
      flex-direction: column; justify-content: center; align-items: center;
      gap: 5px; cursor: pointer; padding: 0;
    }
    .ak-topbar__burger span {
      display: block; width: 22px; height: 2px;
      background: #fff; border-radius: 2px;
      transition: transform 0.25s, opacity 0.2s;
    }
    .ak-topbar__burger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .ak-topbar__burger--open span:nth-child(2) { opacity: 0; }
    .ak-topbar__burger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 820px) {
      .ak-topbar__nav { display: none; }
      .ak-topbar__actions { display: none; }
      .ak-topbar__burger { display: flex; }
    }

    .ak-drawer {
      position: fixed; inset: 0; z-index: 49;
      background: rgba(5, 6, 12, 0);
      pointer-events: none;
      transition: background 0.25s;
    }
    .ak-drawer--open {
      background: rgba(5, 6, 12, 0.7);
      pointer-events: auto;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .ak-drawer__panel {
      position: absolute; top: 72px; left: 0; right: 0;
      padding: 24px;
      background: #050810;
      border-bottom: 1px solid color-mix(in srgb, var(--ak-accent) 15%, transparent);
      display: flex; flex-direction: column; gap: 4px;
      transform: translateY(-12px);
      opacity: 0;
      transition: transform 0.25s, opacity 0.2s;
    }
    .ak-drawer--open .ak-drawer__panel {
      transform: translateY(0);
      opacity: 1;
    }
    .ak-drawer__link {
      display: block;
      padding: 14px 8px;
      color: #e5e7eb; font-size: 17px; font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .ak-drawer__link:hover { background: rgba(255,255,255,0.04); }
    .ak-drawer__link--active { color: var(--ak-accent); }
    .ak-drawer__link--muted { color: #9ca3af; font-weight: 500; }
    .ak-drawer__divider {
      height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0;
    }
    .ak-drawer__cta {
      margin-top: 8px;
      display: block; text-align: center;
      padding: 14px 18px; border-radius: 10px;
      background: linear-gradient(135deg, var(--ak-accent-2), var(--ak-accent-deep));
      color: #000; font-size: 15px; font-weight: 700;
      text-decoration: none;
      border: 1px solid color-mix(in srgb, var(--ak-accent) 40%, transparent);
    }
  `]
})
export class SparkTopbarComponent implements AfterViewInit, OnDestroy {
  scrolled = false;
  drawerOpen = false;

  private onScroll = () => { this.scrolled = window.scrollY > 20; };
  private onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') this.closeDrawer(); };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private host: ElementRef<HTMLElement>,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeDrawer());
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('keydown', this.onKey);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('keydown', this.onKey);
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
    this.lockBodyScroll(this.drawerOpen);
  }

  closeDrawer(): void {
    if (!this.drawerOpen) return;
    this.drawerOpen = false;
    this.lockBodyScroll(false);
  }

  private lockBodyScroll(locked: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
