import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PortalDataService } from './portal-data.service';
import { environment } from '../../../environments/environment';

describe('PortalDataService', () => {
  let service: PortalDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PortalDataService] });
    service = TestBed.inject(PortalDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calls GET /api/v1/portal/:token with the provided token', () => {
    service.getPortalData('abc123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/api/v1/portal/abc123`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('does NOT set an Authorization header (unauthenticated endpoint)', () => {
    service.getPortalData('abc123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/api/v1/portal/abc123`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
