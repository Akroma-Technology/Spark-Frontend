import { Injectable, Inject, LOCALE_ID, RendererFactory2, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  locale?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://spark.akroma.com.br';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;
  private ldJsonEl: HTMLScriptElement | null = null;
  private canonicalEl: HTMLLinkElement | null = null;
  private hreflangEls: HTMLLinkElement[] = [];

  constructor(
    private meta: Meta,
    private titleService: Title,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(LOCALE_ID) private localeId: string,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  setPage(config: SeoConfig): void {
    const { title, description, canonical, ogImage, noindex } = config;
    const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE;
    const localeCode = this.buildLocaleCode();
    const canonicalUrl = canonical ?? this.buildCanonicalUrl();

    this.titleService.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: ogImageUrl });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: localeCode });
    this.meta.updateTag({ property: 'og:site_name', content: 'Akroma' });

    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImageUrl });

    if (!noindex) {
      this.setCanonicalAndHreflang(canonicalUrl);
    }
  }

  setSchema(schema: object): void {
    const json = JSON.stringify(schema);
    if (this.ldJsonEl) {
      this.ldJsonEl.textContent = json;
    } else {
      const script = this.renderer.createElement('script') as HTMLScriptElement;
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      script.textContent = json;
      this.renderer.appendChild(this.doc.head, script);
      this.ldJsonEl = script;
    }
  }

  removeSchema(): void {
    if (this.ldJsonEl) {
      this.renderer.removeChild(this.doc.head, this.ldJsonEl);
      this.ldJsonEl = null;
    }
  }

  private setCanonicalAndHreflang(canonicalUrl: string): void {
    if (this.canonicalEl) {
      this.renderer.removeChild(this.doc.head, this.canonicalEl);
    }
    this.hreflangEls.forEach(el => this.renderer.removeChild(this.doc.head, el));
    this.hreflangEls = [];

    const ptUrl = this.toPtUrl(canonicalUrl);
    this.canonicalEl = this.createLink('canonical', ptUrl);

    const path = this.extractPath(canonicalUrl);
    const hreflangs = [
      { lang: 'pt', url: `${BASE_URL}${path}` },
      { lang: 'en', url: `${BASE_URL}/en${path}` },
      { lang: 'es', url: `${BASE_URL}/es${path}` },
      { lang: 'x-default', url: `${BASE_URL}${path}` },
    ];
    hreflangs.forEach(({ lang, url }) => {
      this.hreflangEls.push(this.createAlternate(lang, url));
    });
  }

  private createLink(rel: string, href: string): HTMLLinkElement {
    const el = this.renderer.createElement('link') as HTMLLinkElement;
    this.renderer.setAttribute(el, 'rel', rel);
    this.renderer.setAttribute(el, 'href', href);
    this.renderer.appendChild(this.doc.head, el);
    return el;
  }

  private createAlternate(hreflang: string, href: string): HTMLLinkElement {
    const el = this.renderer.createElement('link') as HTMLLinkElement;
    this.renderer.setAttribute(el, 'rel', 'alternate');
    this.renderer.setAttribute(el, 'hreflang', hreflang);
    this.renderer.setAttribute(el, 'href', href);
    this.renderer.appendChild(this.doc.head, el);
    return el;
  }

  private buildCanonicalUrl(): string {
    const path = this.doc.location?.pathname ?? '/';
    return `${BASE_URL}${this.toPtPath(path)}`;
  }

  private toPtUrl(url: string): string {
    return `${BASE_URL}${this.toPtPath(this.extractPath(url))}`;
  }

  private toPtPath(path: string): string {
    return path.replace(/^\/(en|es)(\/|$)/, '/').replace(/\/$/, '') || '/';
  }

  private extractPath(url: string): string {
    try {
      return new URL(url).pathname.replace(/\/$/, '') || '/';
    } catch {
      return url.replace(/\/$/, '') || '/';
    }
  }

  private buildLocaleCode(): string {
    if (this.localeId.startsWith('en')) return 'en_US';
    if (this.localeId.startsWith('es')) return 'es_ES';
    return 'pt_BR';
  }
}
