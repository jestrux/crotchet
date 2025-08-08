import React from "react";

export function CommandPalette(): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
      }}
    >
      <input
        placeholder="Type a command..."
        style={{ width: "100%", padding: 8 }}
      />
    </div>
  );
}
