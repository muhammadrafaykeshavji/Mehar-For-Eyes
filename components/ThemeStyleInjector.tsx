import {
  resolveActiveThemeColors,
  type SiteSettings,
} from "@/lib/settings-types";

export function ThemeStyleInjector({ settings }: { settings: SiteSettings }) {
  const {
    bgColor,
    surfaceColor,
    textColor,
    accentColor,
    radiusCard,
    radiusBtn,
  } = resolveActiveThemeColors(settings);

  const css = `:root {
    --background: ${bgColor};
    --surface: ${surfaceColor};
    --foreground: ${textColor};
    --accent: ${accentColor};
    --radius-card: ${radiusCard};
    --radius-btn: ${radiusBtn};
  }`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

