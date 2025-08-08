import React from "react";
import { CommandPalette } from "./components/CommandPalette";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";

function AppContent(): JSX.Element {
  const { themeMode, setThemeMode } = useTheme();
  
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <h1>Crotchet Hybrid Desktop</h1>
        <p>Desktop app scaffold is ready.</p>
        
        <div style={{ marginBottom: 16 }}>
          <label>Theme: </label>
          <select 
            value={themeMode} 
            onChange={(e) => setThemeMode(e.target.value as any)}
            style={{ marginLeft: 8 }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <CommandPalette />
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
