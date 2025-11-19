// Generate consistent theme colors based on group ID
export const getGroupTheme = (groupId) => {
  // Predefined theme palette with 20 unique color combinations
  const themes = [
    {
      name: "Purple Dream",
      gradient: "linear-gradient(135deg, #b8a8e8 0%, #c5a8d8 100%)",
      primary: "#b8a8e8",
      secondary: "#c5a8d8",
      accent: "#d4c5f9",
    },
    {
      name: "Ocean Blue",
      gradient: "linear-gradient(135deg, #7ec8e3 0%, #a8e6f5 100%)",
      primary: "#7ec8e3",
      secondary: "#a8e6f5",
      accent: "#9dd9f3",
    },
    {
      name: "Sunset Orange",
      gradient: "linear-gradient(135deg, #ffc4e8 0%, #ffb3c6 100%)",
      primary: "#ffc4e8",
      secondary: "#ffb3c6",
      accent: "#ffd0e5",
    },
    {
      name: "Forest Green",
      gradient: "linear-gradient(135deg, #7dd3c0 0%, #a8f5d0 100%)",
      primary: "#7dd3c0",
      secondary: "#a8f5d0",
      accent: "#95e8c8",
    },
    {
      name: "Midnight Blue",
      gradient: "linear-gradient(135deg, #7a93c1 0%, #90b1e3 100%)",
      primary: "#7a93c1",
      secondary: "#90b1e3",
      accent: "#a3c2f0",
    },
    {
      name: "Rose Pink",
      gradient: "linear-gradient(135deg, #ff99bd 0%, #ffb380 100%)",
      primary: "#ff99bd",
      secondary: "#ffb380",
      accent: "#ffa8a8",
    },
    {
      name: "Teal Wave",
      gradient: "linear-gradient(135deg, #80e8ff 0%, #9db3f5 100%)",
      primary: "#80e8ff",
      secondary: "#9db3f5",
      accent: "#8dceff",
    },
    {
      name: "Golden Hour",
      gradient: "linear-gradient(135deg, #ffb380 0%, #ffe099 100%)",
      primary: "#ffb380",
      secondary: "#ffe099",
      accent: "#ffd199",
    },
    {
      name: "Lavender Dream",
      gradient: "linear-gradient(135deg, #d4f4f2 0%, #ffe9f0 100%)",
      primary: "#d4f4f2",
      secondary: "#ffe9f0",
      accent: "#ead9ec",
    },
    {
      name: "Crimson Fire",
      gradient: "linear-gradient(135deg, #ff9999 0%, #ffad99 100%)",
      primary: "#ff9999",
      secondary: "#ffad99",
      accent: "#ffa3a3",
    },
    {
      name: "Cool Mint",
      gradient: "linear-gradient(135deg, #7fd8cd 0%, #c9e79f 100%)",
      primary: "#7fd8cd",
      secondary: "#c9e79f",
      accent: "#a3eacc",
    },
    {
      name: "Royal Purple",
      gradient: "linear-gradient(135deg, #9980a0 0%, #7fc3c9 100%)",
      primary: "#9980a0",
      secondary: "#7fc3c9",
      accent: "#a598b5",
    },
    {
      name: "Coral Reef",
      gradient: "linear-gradient(135deg, #ffc299 0%, #ffafb0 100%)",
      primary: "#ffc299",
      secondary: "#ffafb0",
      accent: "#ffb8a3",
    },
    {
      name: "Arctic Blue",
      gradient: "linear-gradient(135deg, #a3b8d9 0%, #80c1e3 100%)",
      primary: "#a3b8d9",
      secondary: "#80c1e3",
      accent: "#94c8e8",
    },
    {
      name: "Cherry Blossom",
      gradient: "linear-gradient(135deg, #fff5e6 0%, #ffd9cf 100%)",
      primary: "#fff5e6",
      secondary: "#ffd9cf",
      accent: "#ffe7db",
    },
    {
      name: "Emerald City",
      gradient: "linear-gradient(135deg, #7da3a8 0%, #a8d9b3 100%)",
      primary: "#7da3a8",
      secondary: "#a8d9b3",
      accent: "#95c1ad",
    },
    {
      name: "Neon Night",
      gradient: "linear-gradient(135deg, #ff80e5 0%, #9999cc 100%)",
      primary: "#ff80e5",
      secondary: "#9999cc",
      accent: "#cc99e5",
    },
    {
      name: "Amber Glow",
      gradient: "linear-gradient(135deg, #ffd699 0%, #ffe699 100%)",
      primary: "#ffd699",
      secondary: "#ffe699",
      accent: "#ffecb3",
    },
    {
      name: "Deep Sea",
      gradient: "linear-gradient(135deg, #8fa3b0 0%, #94c9e8 100%)",
      primary: "#8fa3b0",
      secondary: "#94c9e8",
      accent: "#92b4c8",
    },
    {
      name: "Peachy Keen",
      gradient: "linear-gradient(135deg, #ffb3b3 0%, #ffecb3 100%)",
      primary: "#ffb3b3",
      secondary: "#ffecb3",
      accent: "#ffccb3",
    },
  ];

  // Hash function to convert groupId to index
  let hash = 0;
  if (!groupId) return themes[0];
  
  for (let i = 0; i < groupId.length; i++) {
    const char = groupId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get positive index within themes array length
  const index = Math.abs(hash) % themes.length;
  return themes[index];
};

// Get lighter version of theme for cards/backgrounds
export const getLightTheme = (theme) => {
  return {
    ...theme,
    gradient: theme.gradient.replace(/[\d.]+(?=%)/g, (match) => Math.min(100, parseFloat(match) + 10)),
    glassBg: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
  };
};
