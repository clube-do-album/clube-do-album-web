import { useEffect } from 'react';

export function usePageRevalidation(pathname: string, enabled: boolean, revalidate: (pathname: string) => void) {
  useEffect(() => {
    if (enabled) {
      revalidate(pathname);
    }
  }, [enabled, pathname, revalidate]);
}
