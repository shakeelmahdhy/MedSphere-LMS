import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

interface UserAvatarProps {
  user?: {
    name?: string;
    avatar_url?: string;
  };
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    
    // If it's already an absolute URL, check if it's pointing to localhost:8000
    // and replace it with our dynamic baseUrl if needed
    let finalUrl = url;
    const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    
    if (url.startsWith('http')) {
      // Replace hardcoded localhost:8000 with dynamic backendBase if they differ
      if (url.includes('localhost:8000') && !backendBase.includes('localhost:8000')) {
        finalUrl = url.replace('http://localhost:8000', backendBase);
      }
    } else {
      finalUrl = `${backendBase}${url}`;
    }
    
    // Add cache buster to ensure images refresh when re-uploaded with same name
    return `${finalUrl}?t=${new Date().getTime()}`;
  };

  return (
    <Avatar className={cn("shadow-sm", className)}>
      <AvatarImage src={getAvatarUrl(user?.avatar_url)} alt={user?.name} />

      <AvatarFallback className={cn("bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
