export type DramaGenre = 
  | 'Todos'
  | 'Romance' 
  | 'Venganza' 
  | 'CEO' 
  | 'Urbano' 
  | 'Fantasía' 
  | 'Reencarnación'
  | 'Suspenso';

export type DramaStatus = 'COMPLETO' | 'EN EMISIÓN' | 'NUEVO' | 'TENDENCIA';

export type VideoSourceType = 'file' | 'url' | 'youtube' | 'sample';

export interface Episode {
  id: string;
  dramaId: string;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  videoType: VideoSourceType;
  fileBlobId?: string; // Reference to IndexedDB for locally uploaded video files
  thumbnail?: string;
  synopsis?: string;
  uploadedAt: string;
  views: number;
  likes: number;
}

export interface Drama {
  id: string;
  title: string;
  originalTitle?: string;
  genre: string;
  episodesCount: number;
  rating: number;
  status: DramaStatus;
  poster: string;
  banner: string;
  synopsis: string;
  author?: string;
  tags: string[];
  episodes: Episode[];
  likesCount: number;
  viewsCount: number;
  isCustom?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadEpisodeForm {
  dramaId: string;
  newDramaTitle?: string;
  newDramaGenre?: string;
  newDramaSynopsis?: string;
  newDramaStatus?: DramaStatus;
  newDramaPoster?: string;
  newDramaBanner?: string;
  episodeNumber: number;
  title: string;
  duration?: string;
  videoSourceType: VideoSourceType;
  videoUrl?: string;
  videoFile?: File | null;
  thumbnailUrl?: string;
  thumbnailFile?: File | null;
  synopsis?: string;
}

export interface MonetizationSettings {
  enabled: boolean;
  adsterraSmartlinkUrl: string;
  secondarySmartlinkUrl?: string;
  freeEpisodesCount: number; // e.g. first 2 or 3 episodes free, then rewarded ad
  rewardCountdownSeconds: number; // seconds to view ad to earn coins (default 15)
  coinsPerAd: number; // coins rewarded per ad view (default 2)
  coinsToUnlockEpisode: number; // coins required to unlock each episode (default 5)
  clicksCount: number;
  unlockedEpisodesCount: number;
  globalSmartlinkEnabled?: boolean; // opens Smartlink when users enter / interact
  globalFrequency?: 'session' | 'interval' | 'every_click';
  bannerAdEnabled?: boolean; // top sponsor banner visible on main page
}

