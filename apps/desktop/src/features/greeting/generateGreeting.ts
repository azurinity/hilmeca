const FOLLOW_UPS = [
  "What's on your mind?",
  'How can I help you today?',
  'What would you like to explore?',
  'What shall we work on today?',
  'What can I help you figure out?',
  'Ready to dive into something?',
  'Where should we start?',
  "Anything you'd like to talk about?",
  'What are we doing today?',
] as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function getGreetings(hour: number): readonly string[] {
  if (hour >= 5 && hour < 12) {
    return ['Good morning', 'Morning', 'Hello', 'Welcome', 'Hey there'];
  }

  if (hour >= 12 && hour < 17) {
    return ['Good afternoon', 'Hello', 'Welcome', 'Hey there'];
  }

  if (hour >= 17 && hour < 22) {
    return ['Good evening', 'Hello', 'Welcome', 'Hey there'];
  }

  // Late night and early morning
  return ['Hello', 'Hey there', 'Welcome', 'Welcome back'];
}

export function generateGreeting(name?: string): string {
  const hour = new Date().getHours();
  const greeting = pickRandom(getGreetings(hour));
  const followUp = pickRandom(FOLLOW_UPS);

  const cleanName = name?.trim();

  const opening = cleanName ? `${greeting}, ${cleanName}.` : `${greeting}.`;

  return `${opening} ${followUp}`;
}
