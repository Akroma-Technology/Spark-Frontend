// src/app/admin/nichos/admin-nichos.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { environment } from '../../../environments/environment';

interface NicheTemplate {
  niche: string;
  label: string;
  imageStyle: string;
  language: string;
  logoUrl: string;
  searchDescription: string;
  negativeTopics: string;
  fixedHashtags: string;
}

@Component({
  selector: 'app-admin-nichos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: block; min-height: 100vh; background: #050810; color: #e5e7eb; font-family: sans-serif; }
    .admin-wrap { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 1.5rem; }
    .login-card { background: #0d1117; border: 1px solid rgba(251,191,36,.2); border-radius: 12px; padding: 2rem; max-width: 400px; margin: 4rem auto; }
    .login-card h2 { color: #fff; margin: 0 0 1.5rem; font-size: 1.25rem; }
    label { display: block; font-size: .8rem; color: #9ca3af; margin-bottom: .35rem; }
    input, textarea { width: 100%; background: #131a2b; border: 1px solid #2d3748; border-radius: 8px; color: #e5e7eb; padding: .5rem .75rem; font-size: .875rem; box-sizing: border-box; }
    textarea { resize: vertical; min-height: 80px; }
    input:focus, textarea:focus { outline: 2px solid #fbbf24; border-color: transparent; }
    .btn { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: .875rem; font-weight: 600; transition: opacity .15s; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg,#f59e0b,#d97706); color: #000; }
    .btn-secondary { background: #1e293b; color: #e5e7eb; border: 1px solid #2d3748; }
    .btn-danger { background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }
    .btn-sm { padding: .3rem .7rem; font-size: .8rem; }
    .niche-card { background: #0d1117; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 1rem; overflow: hidden; }
    .niche-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; cursor: pointer; }
    .niche-badge { background: rgba(251,191,36,.12); color: #fbbf24; border-radius: 6px; padding: .15rem .5rem; font-size: .75rem; font-weight: 700; font-family: monospace; }
    .niche-label { font-weight: 600; color: #fff; font-size: 1rem; margin-left: .75rem; }
    .niche-body { padding: 1.25rem; border-top: 1px solid #1e293b; display: grid; gap: 1rem; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: .35rem; }
    .actions { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .5rem; }
    .err { color: #f87171; font-size: .8rem; margin-top: .5rem; }
    .success-toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #14532d; color: #86efac; border: 1px solid #166534; border-radius: 10px; padding: .75rem 1.25rem; font-size: .875rem; font-weight: 600; z-index: 999; animation: slideIn .25s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .add-form { background: #0d1117; border: 2px dashed rgba(251,191,36,.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .confirm-row { display: flex; align-items: center; gap: .5rem; background: #7f1d1d; color: #fca5a5; border-radius: 8px; padding: .35rem .75rem; font-size: .8rem; }
  `],
  template: `
    <!-- Login gate -->
    <div class="admin-wrap" *ngIf="!adminAuth.isLoggedIn()">
      <div class="login-card">
        <h2>Admin — Akroma Spark</h2>
        <div style="margin-bottom:1rem">
          <label>Email</label>
          <input type="email" [(ngModel)]="loginEmail" placeholder="admin@akroma.com.br">
        </div>
        <div style="margin-bottom:1.5rem">
          <label>Senha</label>
          <input type="password" [(ngModel)]="loginPassword" (keyup.enter)="doLogin()">
        </div>
        <button class="btn btn-primary" style="width:100%" (click)="doLogin()" [disabled]="loggingIn">
          {{ loggingIn ? 'Entrando...' : 'Entrar' }}
        </button>
        <div class="err" *ngIf="loginError">{{ loginError }}</div>
      </div>
    </div>

    <!-- Main content -->
    <div class="admin-wrap" *ngIf="adminAuth.isLoggedIn()">
      <div class="top-bar">
        <h1>Gerenciar Nichos</h1>
        <div style="display:flex;gap:.75rem;align-items:center">
          <button class="btn btn-secondary btn-sm" (click)="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ Cancelar' : '+ Novo Nicho' }}
          </button>
          <button class="btn btn-secondary btn-sm" (click)="adminAuth.logout()">Sair</button>
        </div>
      </div>

      <!-- Add new niche form -->
      <div class="add-form" *ngIf="showAddForm">
        <h3 style="color:#fbbf24;margin:0 0 1rem;font-size:1rem">Novo Nicho</h3>
        <div class="field-row">
          <div class="field-group">
            <label>Slug (ex: fitness)</label>
            <input [(ngModel)]="newT.niche" placeholder="fitness">
          </div>
          <div class="field-group">
            <label>Label (ex: Fitness / Academia)</label>
            <input [(ngModel)]="newT.label" placeholder="Fitness / Academia">
          </div>
        </div>
        <div class="field-row" style="margin-top:.75rem">
          <div class="field-group">
            <label>Estilo da Imagem</label>
            <input [(ngModel)]="newT.imageStyle" placeholder="modern, professional...">
          </div>
          <div class="field-group">
            <label>Idioma</label>
            <input [(ngModel)]="newT.language" placeholder="pt-BR">
          </div>
        </div>
        <div class="field-group" style="margin-top:.75rem">
          <label>Contexto da Empresa (usado pela IA)</label>
          <textarea [(ngModel)]="newT.searchDescription"></textarea>
        </div>
        <div class="field-row" style="margin-top:.75rem">
          <div class="field-group">
            <label>Tópicos Proibidos</label>
            <textarea [(ngModel)]="newT.negativeTopics" style="min-height:60px"></textarea>
          </div>
          <div class="field-group">
            <label>Hashtags Fixas</label>
            <textarea [(ngModel)]="newT.fixedHashtags" style="min-height:60px"></textarea>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" (click)="createTemplate()" [disabled]="saving">
            {{ saving ? 'Salvando...' : 'Criar Nicho' }}
          </button>
        </div>
        <div class="err" *ngIf="addError">{{ addError }}</div>
      </div>

      <div style="color:#6b7280;text-align:center;padding:2rem" *ngIf="loading">Carregando...</div>

      <!-- Template cards -->
      <div class="niche-card" *ngFor="let t of templates">
        <div class="niche-header" (click)="toggleExpand(t.niche)">
          <div style="display:flex;align-items:center">
            <span class="niche-badge">{{ t.niche }}</span>
            <span class="niche-label">{{ t.label }}</span>
          </div>
          <span style="color:#6b7280;font-size:.8rem">{{ expanded === t.niche ? '▲' : '▼' }}</span>
        </div>

        <div class="niche-body" *ngIf="expanded === t.niche">
          <div class="field-row">
            <div class="field-group">
              <label>Estilo da Imagem</label>
              <input [(ngModel)]="editBuffers[t.niche].imageStyle">
            </div>
            <div class="field-group">
              <label>Idioma</label>
              <input [(ngModel)]="editBuffers[t.niche].language">
            </div>
          </div>
          <div class="field-group">
            <label>URL do Logo</label>
            <input [(ngModel)]="editBuffers[t.niche].logoUrl" placeholder="https://...">
          </div>
          <div class="field-group">
            <label>Contexto da Empresa (usado pela IA)</label>
            <textarea [(ngModel)]="editBuffers[t.niche].searchDescription"></textarea>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label>Tópicos Proibidos</label>
              <textarea [(ngModel)]="editBuffers[t.niche].negativeTopics"></textarea>
            </div>
            <div class="field-group">
              <label>Hashtags Fixas</label>
              <textarea [(ngModel)]="editBuffers[t.niche].fixedHashtags"></textarea>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-danger btn-sm" (click)="confirmDelete = t.niche" *ngIf="confirmDelete !== t.niche">
              🗑 Excluir
            </button>
            <div class="confirm-row" *ngIf="confirmDelete === t.niche">
              <span>Confirmar?</span>
              <button class="btn btn-danger btn-sm" (click)="deleteTemplate(t.niche)">Sim</button>
              <button class="btn btn-secondary btn-sm" (click)="confirmDelete = null">Não</button>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="resetBuffer(t.niche)">Desfazer</button>
            <button class="btn btn-primary btn-sm" (click)="saveTemplate(t.niche)" [disabled]="saving">
              {{ saving ? '...' : '💾 Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <div style="color:#6b7280;text-align:center;padding:2rem" *ngIf="!loading && templates.length === 0">
        Nenhum nicho cadastrado.
      </div>
    </div>

    <div class="success-toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class AdminNichosComponent implements OnInit {
  adminAuth = inject(AdminAuthService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loginEmail = '';
  loginPassword = '';
  loggingIn = false;
  loginError = '';

  templates: NicheTemplate[] = [];
  editBuffers: Record<string, NicheTemplate> = {};
  expanded: string | null = null;
  loading = false;
  saving = false;
  toast = '';
  confirmDelete: string | null = null;
  showAddForm = false;
  addError = '';
  newT: Partial<NicheTemplate> = this.blank();

  ngOnInit(): void {
    if (this.adminAuth.isLoggedIn()) this.loadTemplates();
  }

  doLogin(): void {
    this.loggingIn = true;
    this.loginError = '';
    this.adminAuth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => { this.loggingIn = false; this.loadTemplates(); },
      error: () => { this.loggingIn = false; this.loginError = 'Credenciais inválidas.'; }
    });
  }

  loadTemplates(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/api/v1/niche-templates`, {
      headers: this.adminAuth.authHeaders()
    }).subscribe({
      next: (data) => {
        this.templates = data.map(d => this.fromApi(d));
        this.templates.forEach(t => { this.editBuffers[t.niche] = { ...t }; });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleExpand(niche: string): void {
    this.expanded = this.expanded === niche ? null : niche;
    this.confirmDelete = null;
  }

  saveTemplate(niche: string): void {
    this.saving = true;
    this.http.put(`${this.apiUrl}/api/v1/niche-templates/${niche}`, this.toApi(this.editBuffers[niche]), {
      headers: this.adminAuth.authHeaders()
    }).subscribe({
      next: (data: any) => {
        const idx = this.templates.findIndex(t => t.niche === niche);
        if (idx >= 0) { this.templates[idx] = this.fromApi(data); this.editBuffers[niche] = { ...this.templates[idx] }; }
        this.saving = false;
        this.showToast('Salvo ✓');
      },
      error: () => { this.saving = false; }
    });
  }

  resetBuffer(niche: string): void {
    const t = this.templates.find(t => t.niche === niche);
    if (t) this.editBuffers[niche] = { ...t };
  }

  deleteTemplate(niche: string): void {
    this.http.delete(`${this.apiUrl}/api/v1/niche-templates/${niche}`, {
      headers: this.adminAuth.authHeaders()
    }).subscribe({
      next: () => {
        this.templates = this.templates.filter(t => t.niche !== niche);
        delete this.editBuffers[niche];
        this.expanded = null;
        this.confirmDelete = null;
        this.showToast('Nicho excluído');
      }
    });
  }

  createTemplate(): void {
    this.addError = '';
    if (!this.newT.niche || !this.newT.label) { this.addError = 'Slug e Label são obrigatórios.'; return; }
    this.saving = true;
    this.http.post(`${this.apiUrl}/api/v1/niche-templates`, this.toApi(this.newT as NicheTemplate), {
      headers: this.adminAuth.authHeaders()
    }).subscribe({
      next: (data: any) => {
        const t = this.fromApi(data);
        this.templates.push(t);
        this.editBuffers[t.niche] = { ...t };
        this.newT = this.blank();
        this.showAddForm = false;
        this.saving = false;
        this.showToast('Nicho criado ✓');
      },
      error: (err: any) => { this.addError = err?.error?.detail || 'Erro ao criar.'; this.saving = false; }
    });
  }

  private fromApi(d: any): NicheTemplate {
    return {
      niche: d.niche, label: d.label,
      imageStyle: d.image_style, language: d.language, logoUrl: d.logo_url ?? '',
      searchDescription: d.search_description ?? '', negativeTopics: d.negative_topics ?? '',
      fixedHashtags: d.fixed_hashtags ?? '',
    };
  }

  private toApi(t: NicheTemplate): object {
    return {
      niche: t.niche, label: t.label, image_style: t.imageStyle, language: t.language,
      logo_url: t.logoUrl, search_description: t.searchDescription,
      negative_topics: t.negativeTopics, fixed_hashtags: t.fixedHashtags,
    };
  }

  private blank(): Partial<NicheTemplate> {
    return { niche: '', label: '', imageStyle: 'modern', language: 'pt-BR', logoUrl: '', searchDescription: '', negativeTopics: '', fixedHashtags: '' };
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3500);
  }
}
