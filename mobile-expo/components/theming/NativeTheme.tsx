import React from 'react';

// With darkMode: 'media' in tailwind.config.js, NativeWind follows
// the system color scheme automatically — no dark class wrapper needed.
export function NativeTheme({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
