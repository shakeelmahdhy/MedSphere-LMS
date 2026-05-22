const backendBase =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';

/** Resolve stored media paths (relative, localhost, or Supabase public URLs). */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  let finalUrl = url;
  if (url.startsWith('http')) {
    if (url.includes('localhost:8000') && !backendBase.includes('localhost:8000')) {
      finalUrl = url.replace('http://localhost:8000', backendBase);
    }
  } else {
    finalUrl = `${backendBase}${url.startsWith('/') ? url : `/${url}`}`;
  }

  return finalUrl;
}
