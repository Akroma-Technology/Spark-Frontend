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
    <header class="topbar" [class.topbar--scrolled]="scrolled">
      <div class="topbar__inner">
        <a routerLink="/" class="topbar__brand" aria-label="Akroma Spark — inicio" (click)="closeDrawer()">
          <img src="assets/icone-akroma.png" alt="" class="topbar__logo" aria-hidden="true">
          <span class="topbar__name">Akroma <span class="topbar__accent">Spark</span></span>
        </a>

        <nav class="topbar__nav" aria-label="Navegacao principal">
          <a routerLink="/"
             routerLinkActive="topbar__link--active"
             [routerLinkActiveOptions]="{exact: true}"
             class="topbar__link">Início</a>
          <a routerLink="/como-funciona"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Como funciona</a>
          <a routerLink="/recursos"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Recursos</a>
          <a routerLink="/planos"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Planos</a>
        </nav>

        <div class="topbar__actions">
          <a routerLink="/entrar" class="topbar__login">Entrar</a>
          <a routerLink="/cadastro" class="topbar__cta">Teste grátis</a>
        </div>

        <button type="button"
                class="topbar__burger"
                [class.topbar__burger--open]="drawerOpen"
                aria-label="Abrir menu"
                [attr.aria-expanded]="drawerOpen"
                (click)="toggleDrawer()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <!-- Mobile drawer -->
    <div class="drawer"
         [class.drawer--open]="drawerOpen"
         role="dialog"
         aria-modal="true"
         aria-label="Menu"
         (click)="closeDrawer()">
      <div class="drawer__panel" (click)="$event.stopPropagation()">
        <a routerLink="/" routerLinkActive="drawer__link--active" [routerLinkActiveOptions]="{exact: true}"
           class="drawer__link" (click)="closeDrawer()">Início</a>
        <a routerLink="/como-funciona" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Como funciona</a>
        <a routerLink="/recursos" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Recursos</a>
        <a routerLink="/planos" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Planos</a>
        <div class="drawer__divider"></div>
        <a routerLink="/entrar" class="drawer__link drawer__link--muted" (click)="closeDrawer()">Entrar</a>
        <a routerLink="/cadastro" class="drawer__cta" (click)="closeDrawer()">Teste grátis 7 dias &rarr;</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Top bar ───────────────────────────────────────────────────────── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      height: 72px;
      background: rgba(5, 8, 16, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s, border-color 0.2s;
    }
    .topbar--scrolled {
      background: rgba(5, 8, 16, 0.95);
      border-bottom-color: rgba(251,191,36,0.2);
    }
    .topbar__inner {
      max-width: 1200px; height: 100%; margin: 0 auto;
      padding: 0 24px;
      display: flex; align-items: center;
      position: relative;
    }
    .topbar__brand {
      display: inline-flex; align-items: center; gap: 12px;
      text-decoration: none; color: #fff;
      transition: opacity 0.2s;
    }
    .topbar__brand:hover { opacity: 0.85; }
    .topbar__logo {
      height: 40px; width: auto;
      filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .topbar__name {
      font-size: 18px; font-weight: 700; letter-spacing: -0.01em;
    }
    .topbar__accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .topbar__nav {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 28px;
    }
    .topbar__actions {
      margin-left: auto;
      display: flex; align-items: center; gap: 8px;
    }
    .topbar__link {
      position: relative;
      color: #9ca3af; font-size: 14px; font-weight: 500;
      text-decoration: none; padding: 6px 0;
      transition: color 0.15s;
    }
    .topbar__link::after {
      content: ''; position: absolute;
      left: 0; right: 0; bottom: -4px; height: 2px;
      background: #fbbf24;
      transform: scaleX(0); transform-origin: center;
      transition: transform 0.25s;
      border-radius: 2px;
    }
    .topbar__link:hover { color: #fff; }
    .topbar__link--active {
      color: #fbbf24;
    }
    .topbar__link--active::after {
      transform: scaleX(1);
    }
    .topbar__login {
      color: #d1d5db; font-size: 14px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .topbar__login:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .topbar__cta {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; font-size: 14px; font-weight: 700;
      padding: 10px 18px; border-radius: 10px;
      text-decoration: none;
      border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 14px -4px rgba(245,158,11,0.35);
      transition: filter 0.15s, transform 0.15s;
    }
    .topbar__cta:hover { filter: brightness(1.08); transform: translateY(-1px); }

    /* ── Burger (mobile) ───────────────────────────────────────────────── */
    .topbar__burger {
      display: none;
      width: 40px; height: 40px;
      background: none; border: none;
      flex-direction: column; justify-content: center; align-items: center;
      gap: 5px; cursor: pointer; padding: 0;
    }
    .topbar__burger span {
      display: block; width: 22px; height: 2px;
      background: #fff; border-radius: 2px;
      transition: transform 0.25s, opacity 0.2s;
    }
    .topbar__burger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .topbar__burger--open span:nth-child(2) { opacity: 0; }
    .topbar__burger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 820px) {
      .topbar__nav { display: none; }
      .topbar__actions { display: none; }
      .topbar__burger { display: flex; }
    }

    /* ── Drawer ────────────────────────────────────────────────────────── */
    .drawer {
      position: fixed; inset: 0; z-index: 49;
      background: rgba(5, 6, 12, 0);
      pointer-events: none;
      transition: background 0.25s;
    }
    .drawer--open {
      background: rgba(5, 6, 12, 0.7);
      pointer-events: auto;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .drawer__panel {
      position: absolute; top: 72px; left: 0; right: 0;
      padding: 24px;
      background: #050810;
      border-bottom: 1px solid rgba(251,191,36,0.15);
      display: flex; flex-direction: column; gap: 4px;
      transform: translateY(-12px);
      opacity: 0;
      transition: transform 0.25s, opacity 0.2s;
    }
    .drawer--open .drawer__panel {
      transform: translateY(0);
      opacity: 1;
    }
    .drawer__link {
      display: block;
      padding: 14px 8px;
      color: #e5e7eb; font-size: 17px; font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .drawer__link:hover { background: rgba(255,255,255,0.04); }
    .drawer__link--active { color: #fbbf24; }
    .drawer__link--muted { color: #9ca3af; font-weight: 500; }
    .drawer__divider {
      height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0;
    }
    .drawer__cta {
      margin-top: 8px;
      display: block; text-align: center;
      padding: 14px 18px; border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; font-size: 15px; font-weight: 700;
      text-decoration: none;
      border: 1px solid rgba(251,191,36,0.4);
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
