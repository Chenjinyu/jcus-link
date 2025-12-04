// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Check if the theme is a dark theme
 */
export const isDarkTheme = (theme: string): boolean => {
  return theme === 'black' || theme === 'dark_blue';
};

/**
 * Available AI models
 */
export const models = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
];

export type Model = typeof models[number];