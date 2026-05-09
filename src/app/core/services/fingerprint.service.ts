import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FingerprintService {
  private isBrowser: boolean;
  private _promise: Promise<string> | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Returns a stable visitor ID for this browser/device combination.
   * On SSR or if FingerprintJS fails, returns empty string (the backend
   * silently skips fingerprint checks when the header is absent/empty).
   */
  async getVisitorId(): Promise<string> {
    if (!this.isBrowser) return '';
    if (!this._promise) {
      this._promise = this._load();
    }
    return this._promise;
  }

  private async _load(): Promise<string> {
    try {
      const FP = await import('@fingerprintjs/fingerprintjs');
      const fp = await FP.default.load();
      const result = await fp.get();
      return result.visitorId;
    } catch {
      return '';
    }
  }
}
