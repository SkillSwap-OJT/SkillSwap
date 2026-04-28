export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (date: string | Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name = ''): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (text: string, len = 80): string => {
  if (!text || text.length <= len) return text;
  return text.slice(0, len) + '…';
};

export const timeAgo = (date: string | Date | undefined): string => {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
