import { useState, useEffect } from 'react';
import { ThemeMode, ThemePalette, FontSizePreference } from '../types';

export function useThemeManager(
  themeMode: ThemeMode,
  palette: ThemePalette,
  fontSize: FontSizePreference
) {
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  // Apply root classes and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Toggle dark class on html and body
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    }

    // Set font size scale on root
    root.classList.remove('font-compact', 'font-normal-scale', 'font-comfortable');
    if (fontSize === 'compact') {
      root.classList.add('font-compact');
      root.style.fontSize = '14px';
    } else if (fontSize === 'comfortable') {
      root.classList.add('font-comfortable');
      root.style.fontSize = '17px';
    } else {
      root.classList.add('font-normal-scale');
      root.style.fontSize = '15px';
    }

    // Rich Palette definitions for both Dark and Light modes
    const paletteStyles: Record<
      ThemePalette,
      {
        dark: { accent: string; light: string; darkColor: string; subtle: string; border: string; contrast: string };
        light: { accent: string; light: string; darkColor: string; subtle: string; border: string; contrast: string };
      }
    > = {
      gold: {
        dark: {
          accent: '#D4AF37',
          light: '#F5D76E',
          darkColor: '#997715',
          subtle: 'rgba(212, 175, 55, 0.15)',
          border: 'rgba(212, 175, 55, 0.45)',
          contrast: '#09090b',
        },
        light: {
          accent: '#D97706',
          light: '#F59E0B',
          darkColor: '#B45309',
          subtle: 'rgba(217, 119, 6, 0.12)',
          border: 'rgba(217, 119, 6, 0.35)',
          contrast: '#ffffff',
        },
      },
      emerald: {
        dark: {
          accent: '#10B981',
          light: '#34D399',
          darkColor: '#047857',
          subtle: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.45)',
          contrast: '#09090b',
        },
        light: {
          accent: '#059669',
          light: '#10B981',
          darkColor: '#047857',
          subtle: 'rgba(5, 150, 105, 0.12)',
          border: 'rgba(5, 150, 105, 0.35)',
          contrast: '#ffffff',
        },
      },
      sapphire: {
        dark: {
          accent: '#3B82F6',
          light: '#60A5FA',
          darkColor: '#1D4ED8',
          subtle: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.45)',
          contrast: '#ffffff',
        },
        light: {
          accent: '#2563EB',
          light: '#3B82F6',
          darkColor: '#1E40AF',
          subtle: 'rgba(37, 99, 235, 0.12)',
          border: 'rgba(37, 99, 235, 0.35)',
          contrast: '#ffffff',
        },
      },
      ruby: {
        dark: {
          accent: '#F43F5E',
          light: '#FB7185',
          darkColor: '#BE123C',
          subtle: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.45)',
          contrast: '#ffffff',
        },
        light: {
          accent: '#E11D48',
          light: '#F43F5E',
          darkColor: '#9F1239',
          subtle: 'rgba(225, 29, 72, 0.12)',
          border: 'rgba(225, 29, 72, 0.35)',
          contrast: '#ffffff',
        },
      },
      obsidian: {
        dark: {
          accent: '#E2E8F0',
          light: '#FFFFFF',
          darkColor: '#64748B',
          subtle: 'rgba(226, 232, 240, 0.15)',
          border: 'rgba(226, 232, 240, 0.45)',
          contrast: '#09090b',
        },
        light: {
          accent: '#334155',
          light: '#475569',
          darkColor: '#1E293B',
          subtle: 'rgba(51, 65, 85, 0.12)',
          border: 'rgba(51, 65, 85, 0.35)',
          contrast: '#ffffff',
        },
      },
    };

    const paletteGroup = paletteStyles[palette] || paletteStyles.gold;
    const cur = isDark ? paletteGroup.dark : paletteGroup.light;

    root.style.setProperty('--accent', cur.accent);
    root.style.setProperty('--accent-light', cur.light);
    root.style.setProperty('--accent-dark', cur.darkColor);
    root.style.setProperty('--accent-subtle', cur.subtle);
    root.style.setProperty('--accent-border', cur.border);
    root.style.setProperty('--accent-contrast', cur.contrast);
    root.style.setProperty('--accent-ring', cur.border);

    // Update meta theme-color for mobile header
    const metaTheme = document.getElementById('theme-color-meta');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#09090b' : '#f4f4f5');
    }
  }, [isDark, palette, fontSize]);

  return { isDark, systemIsDark };
}
