import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

interface NicheOpt { value: string; label: string; }

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <main class="contato-page">
      <section class="page-hero">
        <div class="container">
          <span class="label">FALE COM A GENTE</span>
          <h1 class="page-hero__title">Entre em contato com o <span class="accent">Spark</span></h1>
          <p class="page-hero__subtitle">
            Preencha o formulário abaixo e entraremos em contato em até 24 horas.
          </p>
        </div>
      </section>

      <section class="contato-body">
        <div class="container contato-grid">
          <aside class="contact-info">
            <h2 class="contact-info__title">Fale conosco</h2>
            <p class="contact-info__lead">
              Dúvidas sobre planos, nichos ou integrações? Nossa equipe responde rápido.
            </p>

            <div class="contact-channel">
              <div class="contact-channel__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <p class="contact-channel__label">E-mail</p>
                <a href="mailto:contato@akroma.com.br" class="contact-channel__value">contato&#64;akroma.com.br</a>
              </div>
            </div>

            <div class="contact-channel">
              <div class="contact-channel__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <p class="contact-channel__label">WhatsApp</p>
                <a href="https://wa.me/5521983833318" target="_blank" rel="noopener" class="contact-channel__value">+55 (21) 98383-3318</a>
              </div>
            </div>

            <div class="contact-channel">
              <div class="contact-channel__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <p class="contact-channel__label">Localização</p>
                <p class="contact-channel__value">Rio de Janeiro, RJ — Brasil</p>
              </div>
            </div>

            <div class="contact-cta">
              <p class="contact-cta__label">Quer testar sem falar com ninguém?</p>
              <a routerLink="/cadastro" class="btn btn--spark btn--full">Começar teste grátis &rarr;</a>
            </div>
          </aside>

          <form class="contact-form" (submit)="submit($event)" novalidate>
            <div class="field">
              <label for="name">Nome *</label>
              <input id="name" name="name" type="text" required [(ngModel)]="form.name" placeholder="Seu nome completo">
            </div>

            <div class="field-row">
              <div class="field">
                <label for="email">E-mail *</label>
                <input id="email" name="email" type="email" required [(ngModel)]="form.email" placeholder="seu@email.com">
              </div>
              <div class="field">
                <label for="phone">Telefone</label>
                <input id="phone" name="phone" type="tel" [(ngModel)]="form.phone" placeholder="+55 (21) 00000-0000">
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="company">Empresa</label>
                <input id="company" name="company" type="text" [(ngModel)]="form.company" placeholder="Nome da empresa">
              </div>
              <div class="field">
                <label for="niche">Nicho de interesse *</label>
                <select id="niche" name="niche" required [(ngModel)]="form.niche">
                  <option value="" disabled>Selecione um nicho</option>
                  <option *ngFor="let n of niches" [value]="n.value">{{ n.label }}</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label for="message">Mensagem *</label>
              <textarea id="message" name="message" rows="5" required [(ngModel)]="form.message" placeholder="Conte-nos sobre seu projeto..."></textarea>
            </div>

            <button type="submit" class="btn btn--spark btn--lg btn--full" [disabled]="sending">
              {{ sending ? 'Enviando...' : 'Enviar mensagem' }}
            </button>

            <p *ngIf="sentOk" class="form-feedback form-feedback--ok">Mensagem enviada</p>
            <p *ngIf="sentErr" class="form-feedback form-feedback--err">Erro ao enviar. Tente novamente ou escreva para contato&#64;akroma.com.br.</p>
          </form>
        </div>
      </section>
    </main>

    <app-spark-footer></app-spark-footer>
  `,
  styles: [`
    :host { display: block; background: #0a0a12; color: #e5e7eb; min-height: 100vh; }
    .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
    .label {
      display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
      color: #fbbf24; margin-bottom: 12px;
    }
    .accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .page-hero {
      padding: 140px 0 40px;
      background:
        radial-gradient(ellipse at top, rgba(251,191,36,0.08), transparent 60%),
        #0a0a12;
    }
    .page-hero__title {
      font-size: 44px; line-height: 1.1; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.02em;
    }
    .page-hero__subtitle { color: #9ca3af; font-size: 17px; max-width: 640px; margin: 0; }

    .contato-body { padding: 48px 0 80px; }
    .contato-grid {
      display: grid; grid-template-columns: 360px 1fr; gap: 48px;
    }
    @media (max-width: 880px) {
      .contato-grid { grid-template-columns: 1fr; gap: 32px; }
      .page-hero__title { font-size: 34px; }
    }

    .contact-info {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(251,191,36,0.15);
      border-radius: 16px;
      padding: 28px;
      display: flex; flex-direction: column; gap: 20px;
      height: fit-content;
    }
    .contact-info__title { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
    .contact-info__lead { margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6; }

    .contact-channel { display: flex; gap: 14px; align-items: flex-start; }
    .contact-channel__icon {
      flex-shrink: 0;
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(251,191,36,0.1);
      color: #fbbf24;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .contact-channel__icon svg { width: 18px; height: 18px; }
    .contact-channel__label {
      margin: 0 0 2px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 700;
    }
    .contact-channel__value { color: #e5e7eb; font-size: 14px; text-decoration: none; }
    .contact-channel__value:hover { color: #fbbf24; }

    .contact-cta {
      margin-top: 8px; padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .contact-cta__label { margin: 0 0 12px; font-size: 13px; color: #9ca3af; }

    .contact-form {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 32px;
      display: flex; flex-direction: column; gap: 18px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    @media (max-width: 560px) { .field-row { grid-template-columns: 1fr; } }
    .field label {
      font-size: 13px; color: #d1d5db; font-weight: 600;
    }
    .field input, .field select, .field textarea {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 14px;
      color: #fff; font-size: 14px; font-family: inherit;
      transition: border-color 0.15s, background 0.15s;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: rgba(251,191,36,0.5);
      background: rgba(255,255,255,0.06);
    }
    .field textarea { resize: vertical; min-height: 120px; }
    .field select {
      appearance: none; -webkit-appearance: none; -moz-appearance: none;
      cursor: pointer;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    .field select option {
      background-color: #111422; color: #e5e7eb;
    }
    .field select option:disabled { color: #6b7280; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;
      text-decoration: none; transition: all 0.2s; border: none; cursor: pointer;
    }
    .btn--spark {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 16px -4px rgba(245,158,11,0.3);
    }
    .btn--spark:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .btn--spark:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn--full { width: 100%; box-sizing: border-box; }
    .btn--lg { padding: 16px 32px; font-size: 16px; }

    .form-feedback {
      margin: 0; font-size: 14px; padding: 12px 14px; border-radius: 8px;
      text-align: center; font-weight: 600;
    }
    .form-feedback--ok {
      background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); color: #86efac;
    }
    .form-feedback--err {
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5;
    }
  `]
})
export class ContatoComponent {
  readonly niches: NicheOpt[] = [
    { value: 'fitness',      label: 'Fitness / Academia' },
    { value: 'tecnologia',   label: 'Tecnologia' },
    { value: 'gastronomia',  label: 'Gastronomia' },
    { value: 'moda',         label: 'Moda' },
    { value: 'juridico',     label: 'Jurídico' },
    { value: 'imobiliario',  label: 'Imobiliário' },
    { value: 'educacao',     label: 'Educação' },
    { value: 'saude',        label: 'Saúde' },
    { value: 'outro',        label: 'Outro' },
  ];

  private http = inject(HttpClient);
  private readonly CONTACT_API = 'https://trp1e71ohd.execute-api.us-east-1.amazonaws.com/api/v1/contact';

  form = { name: '', email: '', phone: '', company: '', niche: '', message: '' };
  sending = false;
  sentOk = false;
  sentErr = false;

  submit(ev: Event): void {
    ev.preventDefault();
    if (!this.form.name || !this.form.email || !this.form.niche || !this.form.message) return;
    this.sending = true;
    this.sentErr = false;
    const niche = this.niches.find(n => n.value === this.form.niche)?.label ?? this.form.niche;
    const payload = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      company: this.form.company,
      service: `[Spark] ${niche}`,
      message: this.form.message,
    };
    this.http.post<{ success: boolean }>(this.CONTACT_API, payload).subscribe({
      next: () => {
        this.sending = false;
        this.sentOk = true;
        this.form = { name: '', email: '', phone: '', company: '', niche: '', message: '' };
      },
      error: () => {
        this.sending = false;
        this.sentErr = true;
      },
    });
  }
}
