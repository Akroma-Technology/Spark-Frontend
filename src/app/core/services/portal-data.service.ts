import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PortalData {
  client: {
    name: string;
    instagramUsername?: string;
    hasFacebook?: boolean;
    hasLinkedin?: boolean;
  };
  stats: {
    totalPosts: number;
    igLikes: number;
    fbLikes: number;
    igComments: number;
    fbComments: number;
    igSaves: number;
    fbShares: number;
  };
  stylePerformance: Array<{
    style: string;
    postCount: number;
    avgEngagement: number;
  }>;
  recentPosts: Array<{
    imageUrlTemp?: string;
    hasInstagram?: boolean;
    hasFacebook?: boolean;
    hasLinkedin?: boolean;
    scheduledFor: string;
    postFormat: string;
    topicUsed?: string;
    caption?: string;
    likesCount?: number;
    commentsCount?: number;
    savesCount?: number;
    fbLikesCount?: number;
    fbCommentsCount?: number;
    fbSharesCount?: number;
    instagramPermalink?: string;
    facebookPermalink?: string;
    linkedinPermalink?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class PortalDataService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getPortalData(token: string): Observable<PortalData> {
    return this.http.get<PortalData>(`${this.apiUrl}/api/v1/portal/${token}`);
  }
}
