export const company = {
  name: "Momentum Apps Limited",
  shortName: "Momentum Apps",
  email: "support@momentum-apps.com",
  url: "https://momentum-apps.com",
  facebook: "https://www.facebook.com/profile.php?id=61573096473546",
  x: "https://x.com/AppsMomentum",
  storyLingua: "https://story-lingua.com/",
} as const;

export type Platform = "Web" | "Android" | "iOS";
export type AppStatus = "live" | "soon";

export interface Screenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AppEntry {
  id: string;
  /** Folder under /apps. Omitted for apps that live on their own site. */
  slug?: string;
  name: string;
  pitch: string;
  summary: string;
  platform: Platform;
  status: AppStatus;
  cta: string;
  href: string;
  external: boolean;
  /** Google Play listing. Present only for apps that are on Play. */
  playUrl?: string;
  features: string[];
  languages?: string[];
  screenshots: Screenshot[];
  /** Extra legacy pages besides help, privacy, and terms. */
  extraPages?: { page: string; label: string }[];
}

const phone = { width: 720, height: 1280 };

export const apps: AppEntry[] = [
  {
    id: "storylingua",
    name: "StoryLingua",
    pitch: "Learn a new language by reading stories you enjoy.",
    summary:
      "Graded reading in Spanish, Japanese, Chinese, and Korean. Tap any word for a translation, then keep it with spaced-repetition flashcards.",
    platform: "Web",
    status: "live",
    cta: "Try StoryLingua",
    href: company.storyLingua,
    external: true,
    features: [
      "Graded reading stories from beginner to advanced",
      "Tap any word for an instant translation",
      "Spaced-repetition flashcards built from your reading",
    ],
    languages: ["Spanish", "Japanese", "Chinese", "Korean"],
    screenshots: [
      {
        src: "/images/storylingua.webp",
        alt: "StoryLingua banner: Read. Tap. Remember. Learn a language by reading stories.",
        width: 1200,
        height: 630,
      },
    ],
  },
  {
    id: "habit-tracker",
    slug: "habittracker",
    name: "Habit Tracker",
    pitch: "Build and maintain good habits with simple tracking and reports.",
    summary:
      "Habit Tracker - Plan, Succeed helps you stay with a habit using flexible schedules, streaks, reminders, and monthly reports.",
    platform: "Android",
    status: "live",
    cta: "Learn more",
    href: "/apps/habittracker/",
    external: false,
    playUrl: "https://play.google.com/store/apps/details?id=com.johnnycwatt.habittracker",
    features: [
      "Set daily, weekly, monthly, or custom habits that fit your routine.",
      "Track streaks and see progress build on a completion calendar.",
      "Review monthly reports so you can see what is sticking.",
    ],
    screenshots: [
      {
        src: "/images/habit-home.webp",
        alt: "Habit Tracker home screen on Android",
        ...phone,
      },
      {
        src: "/images/habit-progress.webp",
        alt: "Habit Tracker progress screen with a completion calendar",
        ...phone,
      },
      {
        src: "/images/habit-report.webp",
        alt: "Habit Tracker monthly report screen",
        ...phone,
      },
    ],
    extraPages: [{ page: "news", label: "News" }],
  },
  {
    id: "studymap-flashcards",
    slug: "studymap-flashcards",
    name: "StudyMap Flashcards",
    pitch: "Learn and retain information with spaced-repetition flashcards.",
    summary:
      "An offline-first flashcard app for vocabulary and study decks, with manual review, dictation, and spaced repetition.",
    platform: "Android",
    status: "live",
    cta: "Learn more",
    href: "/apps/studymap-flashcards/",
    external: false,
    playUrl: "https://play.google.com/store/apps/details?id=com.johnnycwatt.studymap",
    features: [
      "Your decks stay on your device. Study with or without a connection.",
      "Review manually, by dictation, or with spaced repetition.",
      "Import CSV, Excel, or JSON, or start from a pre-made language deck.",
    ],
    screenshots: [
      {
        src: "/images/flashcards-review.webp",
        alt: "StudyMap Flashcards review options on Android",
        ...phone,
      },
      {
        src: "/images/flashcards-srs.webp",
        alt: "StudyMap Flashcards spaced-repetition review on Android",
        ...phone,
      },
      {
        src: "/images/flashcards-list.webp",
        alt: "StudyMap Flashcards vocabulary list on Android",
        ...phone,
      },
    ],
  },
  {
    id: "studymap-planner",
    slug: "studymap",
    name: "StudyMap Study Planner",
    pitch: "Stay organised and keep up with classes, tasks, and subjects.",
    summary:
      "A study planner for tasks, classes, and subjects, with a daily list and a calendar. Coming soon for iPhone.",
    platform: "iOS",
    status: "soon",
    cta: "Learn more",
    href: "/apps/studymap/",
    external: false,
    features: [
      "Add as many tasks, subjects, and classes as your timetable needs.",
      "See today in a list, and the wider plan on a calendar.",
      "Attach tasks and classes to a subject so due dates stay together.",
    ],
    screenshots: [
      {
        src: "/images/planner-home.webp",
        alt: "StudyMap Study Planner home screen on iPhone",
        ...phone,
      },
      {
        src: "/images/planner-create.webp",
        alt: "StudyMap Study Planner screen for creating a task or class",
        ...phone,
      },
      {
        src: "/images/planner-calendar.webp",
        alt: "StudyMap Study Planner calendar on iPhone",
        ...phone,
      },
    ],
  },
];

export function appHome(slug: string): string {
  return `/apps/${slug}/`;
}

export function appDoc(slug: string, page: string): string {
  return `/apps/${slug}/${page}.html`;
}

export function policyLinks(app: AppEntry): { href: string; label: string }[] {
  if (!app.slug) return [];
  const links = [
    { href: appHome(app.slug), label: "Overview" },
    { href: appDoc(app.slug, "help"), label: "Help" },
    { href: appDoc(app.slug, "privacy"), label: "Privacy" },
    { href: appDoc(app.slug, "terms"), label: "Terms" },
  ];
  for (const extra of app.extraPages ?? []) {
    links.push({ href: appDoc(app.slug, extra.page), label: extra.label });
  }
  return links;
}
