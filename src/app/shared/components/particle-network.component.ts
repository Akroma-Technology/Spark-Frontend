import {
  Component, AfterViewInit, OnDestroy, ElementRef, ViewChild,
  Input, NgZone, Inject, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle { x: number; y: number; vx: number; vy: number; }

@Component({
  selector: 'app-particle-network',
  standalone: true,
  template: `<canvas #cv class="particle-canvas"></canvas>`,
  styles: [`
    :host {
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .particle-canvas { width: 100%; height: 100%; display: block; }
    @media (prefers-reduced-motion: reduce) {
      :host { display: none; }
    }
  `],
})
export class ParticleNetworkComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() color = '#ffffff';
  @Input() count = 70;
  @Input() linkDistance = 140;
  @Input() dotAlpha = 0.55;
  @Input() linkAlpha = 0.35;

  private raf = 0;
  private particles: Particle[] = [];
  private ctx!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private paused = false;
  private onResize = () => this.resize();
  private onVisibility = () => {
    if (typeof document === 'undefined') return;
    const wasPaused = this.paused;
    this.paused = document.visibilityState !== 'visible';
    if (wasPaused && !this.paused) this.loop();
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Respect reduced-motion preference: don't run any animation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resize();
    this.spawn();
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.paused = document.visibilityState !== 'visible';
    this.zone.runOutsideAngular(() => this.loop());
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    canvas.style.width = this.w + 'px';
    canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.spawn();
  }

  private spawn(): void {
    // Auto-tune density by viewport, hard-cap to 30 on mobile (< 768px).
    const auto = Math.floor((this.w * this.h) / 16000);
    const isMobile = this.w < 768;
    const cap = isMobile ? 30 : this.count;
    const n = Math.min(cap, auto);
    this.particles = Array.from({ length: n }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }

  private loop = (): void => {
    if (this.paused) return;
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw(): void {
    const { ctx, w, h, particles, linkDistance, color, dotAlpha, linkAlpha } = this;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx = -p.vx;
      if (p.y < 0 || p.y > h) p.vy = -p.vy;
    }

    ctx.fillStyle = color;
    for (const p of particles) {
      ctx.globalAlpha = dotAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.7;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDistance) {
          ctx.globalAlpha = (1 - dist / linkDistance) * linkAlpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}
