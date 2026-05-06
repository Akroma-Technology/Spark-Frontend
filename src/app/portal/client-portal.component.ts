import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PortalDataService } from '../core/services/portal-data.service';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="portal-container">
      <!-- Loading -->
      <div *ngIf="loading" class="portal-loading">
        <div class="spinner"></div>
        <span>Carregando portal...</span>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="portal-error">
        <div class="error-icon">&#128274;</div>
        <h2>Link inv&#225;lido ou expirado</h2>
        <p>N&#227;o foi poss&#237;vel carregar os dados. Verifique o link com a Akroma.</p>
      </div>

      <!-- Portal Content -->
      <div *ngIf="!loading && !error && data">
        <!-- Header com identifica&#231;&#227;o do cliente -->
        <header class="portal-header">
          <div class="portal-brand">
            <span class="brand-logo">A</span>
            <span class="brand-name">Akroma</span>
          </div>
        </header>

        <!-- Hero: identifica&#231;&#227;o do cliente -->
        <div class="portal-hero">
          <div class="hero-avatar">{{ data.client.name?.charAt(0)?.toUpperCase() }}</div>
          <div class="hero-info">
            <h1 class="hero-name">{{ data.client.name }}</h1>
            <div class="hero-networks">
              <span class="hero-network" *ngIf="data.client.instagramUsername">
                <svg class="network-icon ig" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                &#64;{{ data.client.instagramUsername }}
              </span>
              <span class="hero-network" *ngIf="data.client.hasFacebook">
                <svg class="network-icon fb" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </span>
              <span class="hero-network" *ngIf="data.client.hasLinkedin">
                <svg class="network-icon li" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </span>
            </div>
          </div>
        </div>

        <!-- Stats por rede social -->
        <div class="portal-stats">
          <!-- Posts totais -->
          <div class="stat-card stat-card--highlight">
            <span class="stat-card__value">{{ data.stats.totalPosts }}</span>
            <span class="stat-card__label">Posts Publicados</span>
          </div>

          <!-- Likes -->
          <div class="stat-card">
            <span class="stat-card__label-top">Likes</span>
            <div class="stat-card__networks">
              <div class="stat-network">
                <svg class="stat-network__icon ig" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span class="stat-network__value">{{ data.stats.igLikes | number }}</span>
              </div>
              <div class="stat-network" *ngIf="data.client.hasFacebook">
                <svg class="stat-network__icon fb" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span class="stat-network__value">{{ data.stats.fbLikes | number }}</span>
              </div>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="stat-card">
            <span class="stat-card__label-top">Comentarios</span>
            <div class="stat-card__networks">
              <div class="stat-network">
                <svg class="stat-network__icon ig" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span class="stat-network__value">{{ data.stats.igComments | number }}</span>
              </div>
              <div class="stat-network" *ngIf="data.client.hasFacebook">
                <svg class="stat-network__icon fb" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span class="stat-network__value">{{ data.stats.fbComments | number }}</span>
              </div>
            </div>
          </div>

          <!-- Salvos (IG only) -->
          <div class="stat-card">
            <span class="stat-card__label-top">Salvos</span>
            <div class="stat-card__networks">
              <div class="stat-network">
                <svg class="stat-network__icon ig" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span class="stat-network__value">{{ data.stats.igSaves | number }}</span>
              </div>
              <div class="stat-network" *ngIf="data.client.hasFacebook">
                <svg class="stat-network__icon fb" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span class="stat-network__value stat-network__value--label">{{ data.stats.fbShares | number }} comp.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Style Performance -->
        <div *ngIf="data.stylePerformance && data.stylePerformance.length > 0" class="portal-section">
          <h2 class="portal-section__title">Performance por Estilo</h2>
          <div class="style-grid">
            <div *ngFor="let sp of data.stylePerformance" class="style-card">
              <span class="style-card__name">{{ sp.style }}</span>
              <div class="style-card__metrics">
                <span>{{ sp.postCount }} posts</span>
                <span>&#8226;</span>
                <span>{{ sp.avgEngagement }} eng m&#233;dio</span>
              </div>
              <div class="style-card__bar-bg">
                <div class="style-card__bar" [style.width.%]="getStyleBarWidth(sp)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Posts -->
        <div class="portal-section">
          <h2 class="portal-section__title">Postagens Recentes</h2>
          <div class="posts-grid">
            <div *ngFor="let post of data.recentPosts" class="post-card">
              <div class="post-card__img" *ngIf="post.imageUrlTemp">
                <img [src]="post.imageUrlTemp" alt="Post" loading="lazy" />
                <!-- Network badges sobre a imagem -->
                <div class="post-card__network-badges">
                  <span class="net-badge net-badge--ig" *ngIf="post.hasInstagram" title="Instagram">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </span>
                  <span class="net-badge net-badge--fb" *ngIf="post.hasFacebook" title="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                  <span class="net-badge net-badge--li" *ngIf="post.hasLinkedin" title="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </span>
                </div>
              </div>
              <div class="post-card__body">
                <div class="post-card__header">
                  <span class="post-card__date">{{ post.scheduledFor | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span class="post-card__format">{{ post.postFormat }}</span>
                </div>
                <!-- Network badges quando n&#227;o tem imagem -->
                <div class="post-card__network-row" *ngIf="!post.imageUrlTemp">
                  <span class="net-badge-inline net-badge--ig" *ngIf="post.hasInstagram">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Instagram
                  </span>
                  <span class="net-badge-inline net-badge--fb" *ngIf="post.hasFacebook">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </span>
                  <span class="net-badge-inline net-badge--li" *ngIf="post.hasLinkedin">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </span>
                </div>
                <p class="post-card__topic" *ngIf="post.topicUsed">{{ post.topicUsed }}</p>
                <p class="post-card__caption" *ngIf="post.caption">{{ post.caption | slice:0:150 }}{{ post.caption.length > 150 ? '...' : '' }}</p>
                <!-- IG Metrics -->
                <div class="post-card__metrics" *ngIf="post.hasInstagram && (post.likesCount > 0 || post.commentsCount > 0)">
                  <span class="metrics-label metrics-label--ig">IG</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> {{ post.likesCount }}</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg> {{ post.commentsCount }}</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg> {{ post.savesCount }}</span>
                </div>
                <!-- FB Metrics -->
                <div class="post-card__metrics" *ngIf="post.hasFacebook && (post.fbLikesCount > 0 || post.fbCommentsCount > 0)">
                  <span class="metrics-label metrics-label--fb">FB</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> {{ post.fbLikesCount }}</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg> {{ post.fbCommentsCount }}</span>
                  <span class="metric-item"><svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> {{ post.fbSharesCount }}</span>
                </div>
                <!-- Links por rede social -->
                <div class="post-card__links">
                  <a *ngIf="post.instagramPermalink" class="post-card__link post-card__link--ig" [href]="post.instagramPermalink" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Ver no Instagram
                  </a>
                  <a *ngIf="post.facebookPermalink" class="post-card__link post-card__link--fb" [href]="post.facebookPermalink" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Ver no Facebook
                  </a>
                  <a *ngIf="post.linkedinPermalink" class="post-card__link post-card__link--li" [href]="post.linkedinPermalink" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Ver no LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="portal-footer">
          <span>Powered by <strong>Akroma</strong> &mdash; Automa&#231;&#227;o inteligente para redes sociais</span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0a0820;
      color: #e2e8f0;
    }

    .portal-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    .portal-loading, .portal-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
      color: #9ca3af;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(124, 58, 237, 0.2);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-icon { font-size: 48px; }
    .portal-error h2 { color: #fff; font-size: 20px; margin: 0; }
    .portal-error p { color: #9ca3af; margin: 0; }

    /* Header */
    .portal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .portal-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      color: #a78bfa;
    }

    /* Hero — identifica&#231;&#227;o do cliente */
    .portal-hero {
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(168, 85, 247, 0.06));
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 16px;
      padding: 28px 32px;
      margin-bottom: 28px;
    }

    .hero-avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }

    .hero-info {
      flex: 1;
    }

    .hero-name {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px 0;
    }

    .hero-networks {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hero-network {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #9ca3af;
      font-weight: 500;
    }

    .network-icon {
      width: 16px;
      height: 16px;
    }

    .network-icon.ig { color: #E1306C; }
    .network-icon.fb { color: #1877F2; }
    .network-icon.li { color: #0A66C2; }

    /* Stats por rede social */
    .portal-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: #12102a;
      border: 1px solid rgba(124, 58, 237, 0.15);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stat-card--highlight {
      text-align: center;
      justify-content: center;
      align-items: center;
    }

    .stat-card--highlight .stat-card__value {
      font-size: 36px;
    }

    .stat-card__value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }

    .stat-card__label {
      font-size: 13px;
      color: #9ca3af;
    }

    .stat-card__label-top {
      font-size: 13px;
      color: #9ca3af;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card__networks {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .stat-network {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stat-network__icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .stat-network__icon.ig { color: #E1306C; }
    .stat-network__icon.fb { color: #1877F2; }

    .stat-network__value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    /* Sections */
    .portal-section {
      margin-bottom: 32px;
    }

    .portal-section__title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px 0;
    }

    /* Style Performance */
    .style-grid {
      display: grid;
      gap: 12px;
    }

    .style-card {
      background: #12102a;
      border: 1px solid rgba(124, 58, 237, 0.1);
      border-radius: 10px;
      padding: 16px;
    }

    .style-card__name {
      font-weight: 600;
      color: #fff;
      font-size: 14px;
    }

    .style-card__metrics {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: #9ca3af;
      margin: 6px 0;
    }

    .style-card__bar-bg {
      background: rgba(255,255,255,0.06);
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }

    .style-card__bar {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      transition: width 0.4s ease;
    }

    /* Posts */
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .post-card {
      background: #12102a;
      border: 1px solid rgba(124, 58, 237, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .post-card__img {
      aspect-ratio: 4/3;
      overflow: hidden;
      position: relative;
    }

    .post-card__img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Network badges sobre a imagem */
    .post-card__network-badges {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 6px;
    }

    .net-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
    }

    .net-badge svg {
      width: 16px;
      height: 16px;
    }

    .net-badge--ig {
      background: rgba(225, 48, 108, 0.85);
      color: #fff;
    }

    .net-badge--fb {
      background: rgba(24, 119, 242, 0.85);
      color: #fff;
    }

    .net-badge--li {
      background: rgba(10, 102, 194, 0.85);
      color: #fff;
    }

    /* Network badges inline (sem imagem) */
    .post-card__network-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .net-badge-inline {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .net-badge-inline svg {
      width: 12px;
      height: 12px;
    }

    .net-badge-inline.net-badge--ig {
      background: rgba(225, 48, 108, 0.15);
      color: #E1306C;
    }

    .net-badge-inline.net-badge--fb {
      background: rgba(24, 119, 242, 0.15);
      color: #1877F2;
    }

    .net-badge-inline.net-badge--li {
      background: rgba(10, 102, 194, 0.15);
      color: #0A66C2;
    }

    .post-card__body {
      padding: 14px;
    }

    .post-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .post-card__date {
      font-size: 12px;
      color: #9ca3af;
    }

    .post-card__format {
      font-size: 10px;
      font-weight: 700;
      background: rgba(124, 58, 237, 0.15);
      color: #a78bfa;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .post-card__topic {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      margin: 0 0 4px 0;
    }

    .post-card__caption {
      font-size: 13px;
      color: #9ca3af;
      margin: 0 0 10px 0;
      line-height: 1.5;
    }

    .post-card__metrics {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 4px;
      align-items: center;
    }

    .metrics-label {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 3px;
      letter-spacing: 0.3px;
    }

    .metrics-label--ig {
      background: rgba(225, 48, 108, 0.15);
      color: #E1306C;
    }

    .metrics-label--fb {
      background: rgba(24, 119, 242, 0.15);
      color: #1877F2;
    }

    .stat-network__value--label {
      font-size: 18px;
    }

    .metric-item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .metric-icon {
      width: 14px;
      height: 14px;
      opacity: 0.7;
    }

    .post-card__links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .post-card__link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .post-card__link:hover { opacity: 0.8; }

    .post-card__link svg {
      width: 14px;
      height: 14px;
    }

    .post-card__link--ig { color: #E1306C; }
    .post-card__link--fb { color: #1877F2; }
    .post-card__link--li { color: #0A66C2; }

    /* Footer */
    .portal-footer {
      text-align: center;
      padding: 32px 0 16px;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid rgba(124, 58, 237, 0.1);
      margin-top: 32px;
    }

    @media (max-width: 768px) {
      .portal-stats {
        grid-template-columns: repeat(2, 1fr);
      }
      .portal-hero {
        flex-direction: column;
        text-align: center;
        padding: 24px 20px;
      }
      .hero-networks {
        justify-content: center;
      }
      .hero-name {
        font-size: 20px;
      }
      .posts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .portal-stats {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .stat-card {
        padding: 14px;
      }
      .stat-network__value {
        font-size: 20px;
      }
    }
  `]
})
export class ClientPortalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(PortalDataService);

  loading = true;
  error = false;
  data: any = null;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    console.log('[Portal] Component loaded, token:', token);
    if (!token) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.service.getPortalData(token).subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  getStyleBarWidth(sp: any): number {
    if (!this.data?.stylePerformance?.length) return 0;
    const max = Math.max(...this.data.stylePerformance.map((s: any) => s.avgEngagement || 0));
    return max > 0 ? (sp.avgEngagement / max) * 100 : 0;
  }
}
