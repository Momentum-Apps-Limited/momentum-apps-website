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

export interface PromoFeature {
  title: string;
  description: string;
  screenshot: Screenshot;
}

/** Desktop shows the phones beside this copy. Mobile pairs each phone with its feature. */
export interface PromoBlock {
  heading: string;
  features: PromoFeature[];
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
  languages?: string[];
  screenshots: Screenshot[];
  /** Overview sections on the app page. */
  promo?: PromoBlock[];
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
    promo: [
      {
        heading: "Stay Consistent, Stay Motivated",
        features: [
          {
            title: "Flexible Habit Scheduling",
            description: "Set daily, weekly, monthly, or custom habits that fit your lifestyle.",
            screenshot: {
              src: "/images/habit-home.webp",
              alt: "Habit Tracker list of daily, weekly, and monthly habits",
              ...phone,
            },
          },
          {
            title: "Track and Visualize Progress",
            description: "Stay motivated with habit streaks and progress tracking.",
            screenshot: {
              src: "/images/habit-progress.webp",
              alt: "Habit Tracker streak statistics and completion calendar",
              ...phone,
            },
          },
          {
            title: "Monthly Reports & Insights",
            description: "Review your performance and get insightful habit reports.",
            screenshot: {
              src: "/images/habit-report.webp",
              alt: "Habit Tracker monthly report with completion rates",
              ...phone,
            },
          },
        ],
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
    promo: [
      {
        heading: "Why Use StudyMap-Flashcards?",
        features: [
          {
            title: "100% Offline",
            description:
              "Your data stays on your device. No internet required. Study anywhere, from the subway to the library.",
            screenshot: {
              src: "/images/flashcards-list.webp",
              alt: "StudyMap Flashcards vocabulary list stored on the device",
              ...phone,
            },
          },
          {
            title: "Spaced Repetition System (SRS)",
            description:
              "Our smart algorithm schedules reviews based on your performance, ensuring you never forget what you've learned.",
            screenshot: {
              src: "/images/flashcards-srs.webp",
              alt: "StudyMap Flashcards spaced-repetition review",
              ...phone,
            },
          },
          {
            title: "Simple, Clean, Modern Interface",
            description:
              "With everything you need and nothing you don't. StudyMap-Flashcards provides an environment to study without distractions.",
            screenshot: {
              src: "/images/flashcards-review.webp",
              alt: "StudyMap Flashcards review screen with spaced repetition, manual review, and dictation",
              ...phone,
            },
          },
        ],
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
    promo: [
      {
        heading: "Why StudyMap?",
        features: [
          {
            title: "Unlimited Tasks, Subjects, and Classes",
            description:
              "Add as many tasks, subjects, and classes as you need to keep track of your study schedule.",
            screenshot: {
              src: "/images/planner-create.webp",
              alt: "StudyMap Study Planner screen for creating a task or class",
              ...phone,
            },
          },
          {
            title: "Smart Study Planning & Scheduling",
            description:
              "View your tasks and classes in a structured calendar format. Includes a daily overview for detailed planning and a monthly overview for a broader perspective.",
            screenshot: {
              src: "/images/planner-calendar.webp",
              alt: "StudyMap Study Planner calendar with classes and tasks",
              ...phone,
            },
          },
          {
            title: "Subject Management",
            description:
              "Link your tasks and assignments to specific subjects. Easily view related tasks and due dates, ensuring nothing falls through the cracks.",
            screenshot: {
              src: "/images/planner-subject.webp",
              alt: "StudyMap Study Planner subject screen listing related tasks and classes",
              ...phone,
            },
          },
        ],
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
