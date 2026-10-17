import { useState, useEffect, useCallback } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    );
  });

  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkSupport = () => {
      const doc = document as unknown as {
        fullscreenEnabled?: boolean;
        webkitFullscreenEnabled?: boolean;
      };
      return !!(
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        document.documentElement.requestFullscreen ||
        (document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen
      );
    };

    setIsSupported(checkSupport());

    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as unknown as {
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
      };
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
      setIsFullscreen(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      return exitFullscreen();
    } else {
      return enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
}
