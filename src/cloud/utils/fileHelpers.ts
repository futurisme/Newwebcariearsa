import { FileCategory } from '../types';

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function cleanDisplayName(filename: string): string {
  // If it starts with timestamp (e.g. 1725450000000_name.ext), extract the real name
  const match = filename.match(/^\d+_(.+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return filename;
}

export function getFileCategory(filename: string): FileCategory {
  const ext = getFileExtension(filename);
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'ico'].includes(ext)) {
    return 'image';
  }
  if (['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v', '3gp'].includes(ext)) {
    return 'video';
  }
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus', 'wma'].includes(ext)) {
    return 'audio';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'md'].includes(ext)) {
    return 'document';
  }
  return 'other';
}

export function isAudioFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus', 'wma'].includes(ext);
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext);
}

export function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v'].includes(ext);
}

export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function isWordFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['doc', 'docx', 'odt', 'rtf'].includes(ext);
}

export interface FileTypeBadgeInfo {
  tag: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconType: 'image' | 'video' | 'audio' | 'pdf' | 'word' | 'sheet' | 'code' | 'archive' | 'file';
}

export function getFileTypeBadge(filename: string): FileTypeBadgeInfo {
  const ext = getFileExtension(filename);

  if (isImageFile(filename)) {
    return {
      tag: ext.toUpperCase(),
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      iconType: 'image',
    };
  }

  if (isVideoFile(filename)) {
    return {
      tag: ext.toUpperCase(),
      badgeBg: 'bg-purple-500/15',
      badgeText: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      iconType: 'video',
    };
  }

  if (isAudioFile(filename)) {
    return {
      tag: ext.toUpperCase(),
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      iconType: 'audio',
    };
  }

  if (isPdfFile(filename)) {
    return {
      tag: 'PDF',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      iconType: 'pdf',
    };
  }

  if (isWordFile(filename)) {
    return {
      tag: ext.toUpperCase() === 'DOC' ? 'DOC' : 'DOCX',
      badgeBg: 'bg-blue-500/15',
      badgeText: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      iconType: 'word',
    };
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      tag: ext.toUpperCase(),
      badgeBg: 'bg-teal-500/15',
      badgeText: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      iconType: 'sheet',
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      tag: 'ZIP',
      badgeBg: 'bg-yellow-500/15',
      badgeText: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      iconType: 'archive',
    };
  }

  if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py', 'sql', 'md', 'txt'].includes(ext)) {
    return {
      tag: ext.toUpperCase() || 'TXT',
      badgeBg: 'bg-cyan-500/15',
      badgeText: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      iconType: 'code',
    };
  }

  return {
    tag: ext ? ext.toUpperCase() : 'FILE',
    badgeBg: 'bg-slate-700/50',
    badgeText: 'text-slate-300',
    borderColor: 'border-slate-700',
    iconType: 'file',
  };
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatTimestamp(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
