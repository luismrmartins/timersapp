export type FAQItem = {
  q: string;
  a: string;
};

export type FAQSection = {
  label: string;
  items: FAQItem[];
};

export const FAQ_SECTIONS: FAQSection[] = [
  {
    label: "Getting started",
    items: [
      {
        q: "What is Tempo and what can I use it for?",
        a: `Tempo is a browser-based timer app that supports three modes: <strong>Countdown timers</strong> (set a duration and count down to zero), <strong>Stopwatches</strong> (count up from zero with lap support), and <strong>Alarms</strong> (fire at a specific wall-clock time, like 07:30). You can run multiple timers simultaneously, chain them together, and save sets of timers for later reuse — all without creating an account.`,
      },
      {
        q: "How do I create my first timer?",
        a: `<ol>
  <li>Click the <strong>+ Add timer</strong> button.</li>
  <li>Choose a mode at the top of the modal: <strong>Timer</strong>, <strong>Stopwatch</strong>, or <strong>Alarm</strong>.</li>
  <li>Enter a name (and an optional description).</li>
  <li>For a countdown, type the duration in HH:MM:SS. For an alarm, pick the time you want it to fire.</li>
  <li>Click <strong>Save</strong>. Your timer appears on the board, ready to start.</li>
</ol>`,
      },
      {
        q: "Do I need to sign up or create an account?",
        a: `No. Tempo works entirely in your browser with no account required. All your timers, saved sequences, and preferences are stored in your browser's local storage and never sent to a server.`,
      },
      {
        q: "Can I install Tempo like an app?",
        a: `Yes. Tempo is a Progressive Web App (PWA). In Chrome or Edge, click the install icon in the address bar (or choose <strong>Install Tempo</strong> from the browser menu). On iOS, tap <strong>Share → Add to Home Screen</strong>. On Android, tap <strong>Add to Home Screen</strong> from the browser menu. Once installed, Tempo opens in its own window without browser chrome.`,
      },
    ],
  },
  {
    label: "Timer modes",
    items: [
      {
        q: "What's the difference between a countdown timer and an alarm?",
        a: `A <strong>countdown timer</strong> counts down from a duration you set (e.g., 25 minutes). An <strong>alarm</strong> fires at a specific wall-clock time (e.g., 14:30). If the time you set has already passed today, the alarm arms itself for the same time tomorrow.`,
      },
      {
        q: "How do I use the stopwatch and record laps?",
        a: `Create a timer in <strong>Stopwatch</strong> mode, then press <strong>Start</strong>. While it's running, press the <strong>Lap</strong> button to record a split. Each lap entry shows the cumulative time and the time since the previous lap. You can pause and resume the stopwatch at any point without losing your lap history.`,
      },
    ],
  },
  {
    label: "Running timers",
    items: [
      {
        q: "Will my timers keep running if I close the tab or my laptop goes to sleep?",
        a: `Yes. Tempo uses wall-clock time rather than counting ticks, so a running timer stays accurate across tab closes, page refreshes, and laptop sleep. When you reopen the tab, the timer reflects the real elapsed time. If a countdown finished while the tab was closed, Tempo will show it as completed.`,
      },
      {
        q: "How will I know when a timer finishes?",
        a: `Tempo alerts you in several ways:
<ul>
  <li><strong>Audio chime</strong> — a multi-tone sound plays when the timer reaches zero.</li>
  <li><strong>Desktop notification</strong> — a browser notification appears (you'll be asked for permission the first time).</li>
  <li><strong>Tab title badge</strong> — if the tab is hidden, the title changes to <code>(N) Timer Tempo...</code> so you can see it in your tab list.</li>
  <li><strong>Visual flash</strong> — the theme blinks twice per second during the final 10 seconds as a visual countdown warning.</li>
</ul>`,
      },
      {
        q: "What is the screen wake lock?",
        a: `On supported browsers, Tempo activates the Screen Wake Lock API while a timer is running, preventing your screen from dimming or locking automatically. This is especially useful when you're watching a countdown and don't want the display to go dark. The lock is released automatically when all timers stop.`,
      },
      {
        q: "What does the total time shown in the header mean?",
        a: `The header displays the combined remaining time across all currently running countdown timers. It gives you a quick at-a-glance view of how much time is left in total without having to read each card individually.`,
      },
    ],
  },
  {
    label: "Chaining timers",
    items: [
      {
        q: "How do I chain timers so one starts automatically after another?",
        a: `Chaining is available for countdown timers. There are two ways to set it up:
<ul>
  <li><strong>On an existing timer:</strong> Open the timer card and use the <strong>Then</strong> dropdown to pick which timer should auto-start when this one finishes.</li>
  <li><strong>When adding a new timer:</strong> Use the <strong>Start after</strong> field in the Add modal to insert the new timer before an existing one in the chain.</li>
</ul>
When a chained timer finishes, the next one starts immediately. If Focus mode is open, the focus view follows the chain automatically.`,
      },
    ],
  },
  {
    label: "Views and focus mode",
    items: [
      {
        q: "What views are available?",
        a: `<ul>
  <li><strong>Grid view</strong> — shows all your timer cards in a 1-, 2-, or 3-column layout depending on screen size. Good for managing many timers at once.</li>
  <li><strong>Single-timer view</strong> — a horizontal carousel where you swipe or click dots to move between timers. Each timer fills the screen. A large + button lets you add timers quickly.</li>
  <li><strong>Focus mode</strong> — a fullscreen view for one timer at a time, with arrow-key navigation between timers, lap support, and a "Next: ..." indicator showing the next chained timer.</li>
</ul>
Switch between views using the controls in the header.`,
      },
      {
        q: "What is Picture-in-Picture and how do I use it?",
        a: `Picture-in-Picture (PiP) pops out a small always-on-top mini window that lists your running timers. It stays visible while you switch to other tabs or applications — for example, while watching YouTube or working in a document. Click the PiP button in the header to activate it. <strong>Note:</strong> this feature is currently available in desktop Chrome and Edge only.`,
      },
    ],
  },
  {
    label: "Managing timers",
    items: [
      {
        q: "How do I edit, duplicate, or delete a timer?",
        a: `Each timer card has action buttons for <strong>Edit</strong> (reopens the modal with existing values prefilled), <strong>Duplicate</strong> (creates a copy with an auto-incremented name), and <strong>Delete</strong>. To remove all timers at once, use the <strong>Clear all</strong> button — you'll be asked to confirm before anything is deleted.`,
      },
      {
        q: "How do saved sequences work?",
        a: `A <strong>saved sequence</strong> captures your entire current board — all timers, their settings, and any chains between them — under a name you choose. To save the current board, open the Library and click <strong>Save current board</strong>. To restore a sequence later, click it in the Library — your board will be replaced with the saved one. You can also <strong>overwrite</strong> an existing sequence with the current board, or <strong>delete</strong> it when you no longer need it.`,
      },
      {
        q: "What is the saved timers library?",
        a: `The saved timers library lets you save a single timer's template (name, description, and duration or alarm time) for quick reuse. Once saved, you can add it back to your board with one click from the Library panel, without having to reconfigure it from scratch each time. Delete a saved timer from the Library when you no longer need it.`,
      },
    ],
  },
  {
    label: "Sharing",
    items: [
      {
        q: "How do I share my timers with someone else?",
        a: `Click <strong>Copy shareable link</strong>. Tempo encodes all your current timers — names, descriptions, durations, modes, and chain configuration — directly into the URL. Send that URL to anyone. When they open it, they'll be prompted to add those timers to their own board. No server is involved: all the data lives in the URL itself.`,
      },
    ],
  },
  {
    label: "Keyboard shortcuts",
    items: [
      {
        q: "What keyboard shortcuts are available?",
        a: `<ul>
  <li><code>Esc</code> — close any open modal, or exit Focus mode</li>
  <li><code>←</code> / <code>→</code> — navigate between timers in Focus mode or Single-timer view</li>
</ul>
All icon buttons also have accessible labels, so Tempo works well with screen readers and keyboard navigation.`,
      },
    ],
  },
  {
    label: "Language and appearance",
    items: [
      {
        q: "What languages does Tempo support?",
        a: `Tempo is available in six locales: English, French, German, Spanish, Portuguese (EU), and Portuguese (BR). On your first visit, Tempo auto-detects your browser's language. You can switch languages at any time using the picker in the header — your choice is remembered for future visits.`,
      },
      {
        q: "Can I switch between light and dark mode?",
        a: `Yes. Use the theme toggle in the header to switch between light and dark mode. Your preference is saved in the browser and applied on every subsequent visit. On your first visit, Tempo uses your operating system's theme preference.`,
      },
    ],
  },
  {
    label: "Privacy and data",
    items: [
      {
        q: "Where is my data stored? Does Tempo send anything to a server?",
        a: `All your data — timers, saved sequences, saved timer templates, theme preference, view mode, and language — is stored exclusively in your browser's <code>localStorage</code>. Nothing is sent to any server. Clearing your browser data will erase your Tempo data.`,
      },
      {
        q: "Does Tempo use tracking cookies?",
        a: `Tempo itself sets only one cookie: <code>lang</code>, used to remember your language preference. No analytics or tracking cookies are set by the app. The site does display Google AdSense ads, which may set their own third-party cookies for advertising purposes — this is disclosed in the Privacy Policy.`,
      },
      {
        q: "What happens to my timers if I clear my browser data?",
        a: `Clearing your browser's site data or local storage will erase all your Tempo timers, saved sequences, and preferences. To preserve a set of timers before clearing data, use <strong>Copy shareable link</strong> to save the configuration as a URL you can reload later.`,
      },
    ],
  },
];

const STRIP_TAGS = /<[^>]+>/g;
const COLLAPSE_WS = /\s+/g;

export function answerToPlainText(html: string): string {
  return html
    .replace(STRIP_TAGS, "")
    .replace(COLLAPSE_WS, " ")
    .trim();
}
