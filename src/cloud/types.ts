export interface FileData {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: any;
  };
  publicUrl: string;
}

export type FileCategory = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';

export type SortField = 'name_asc' | 'name_desc' | 'date_desc' | 'date_asc' | 'size_desc' | 'size_asc';

export interface SortOption {
  id: SortField;
  label: string;
  shortLabel: string;
}

export interface AudioPlaybackState {
  file: FileData | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}
