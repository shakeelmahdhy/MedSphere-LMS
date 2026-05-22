import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';
import { resolveMediaUrl } from '../../lib/mediaUrl';

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
    const resolved = resolveMediaUrl(url);
    if (!resolved) return undefined;
    return `${resolved}?t=${Date.now()}`;
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
