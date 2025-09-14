import { VIDEO_SERVERS } from '../config/constants';
import { VideoServer, MediaType } from '../types';

export const videoServerService = {
  getServers(): VideoServer[] {
    return Object.values(VIDEO_SERVERS);
  },

  getEmbedUrl(
    serverId: string, 
    mediaType: MediaType, 
    tmdbId: number, 
    imdbId?: string, 
    season?: number, 
    episode?: number
  ): string {
    const server = VIDEO_SERVERS[serverId as keyof typeof VIDEO_SERVERS];
    if (!server) return '';

    let template = mediaType === 'movie' ? server.movie : server.tv;
    
    template = template.replace('{tmdbId}', tmdbId.toString());
    if (imdbId) {
      template = template.replace('{imdbId}', imdbId);
    }
    if (season !== undefined) {
      template = template.replace('{season}', season.toString());
    }
    if (episode !== undefined) {
      template = template.replace('{episode}', episode.toString());
    }
    
    return template;
  }
};