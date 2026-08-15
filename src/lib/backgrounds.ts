// One background image per screen. When the user switches tabs, the
// background crossfades to that screen's image.
export const backgroundImages = {
  auth: "/backgrounds/auth.jpg",
  reset: "/backgrounds/reset.jpg",
  dashboard: "/backgrounds/home.jpg",
  planner: "/backgrounds/planner.jpg",
  calendar: "/backgrounds/calendar.jpg",
  stats: "/backgrounds/stats.jpg",
  profile: "/backgrounds/profile.jpg",
} as const;

export type ScreenBackgroundKey = keyof typeof backgroundImages;
