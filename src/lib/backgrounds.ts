// One background image per screen. When the user switches tabs, the
// background crossfades to that screen's image.
//
// Each screen has a list of candidate filenames (in priority order), so the
// images work no matter what they're called — e.g. the user's originals are
// named HOME, PLANNER, CALENDAR, STATS, PROFILE, RESETPASSWORD.
// The first candidate that exists in /public/backgrounds wins.
export const backgroundCandidates: Record<string, string[]> = {
  auth: ["auth", "login", "LOGIN"],
  reset: ["reset", "RESETPASSWORD", "resetpassword"],
  dashboard: ["dashboard", "HOME", "home"],
  planner: ["planner", "PLANNER"],
  calendar: ["calendar", "CALENDAR"],
  stats: ["stats", "STATS"],
  profile: ["profile", "PROFILE"],
};

// Extensions tried for each candidate name.
export const backgroundExtensions = ["jpg", "jpeg", "png", "webp"] as const;

export type ScreenBackgroundKey = keyof typeof backgroundCandidates;

/** All candidate URLs for a screen, e.g. ["/backgrounds/HOME.jpg", ...] */
export function backgroundSrcs(screen: string): string[] {
  const names = backgroundCandidates[screen] ?? [screen];
  const srcs: string[] = [];
  for (const name of names) {
    for (const ext of backgroundExtensions) {
      srcs.push(`/backgrounds/${name}.${ext}`);
    }
  }
  return srcs;
}
