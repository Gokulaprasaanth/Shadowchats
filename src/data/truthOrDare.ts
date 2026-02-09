export const truthQuestions: string[] = [
  "What's a secret you've never told anyone before?",
  "Have you ever had feelings for someone you weren't supposed to?",
  "What's the boldest thing you've ever done because of attraction?",
  "Have you ever flirted with someone knowing it could get complicated?",
  "What kind of attention do you secretly enjoy the most?",
  "What's a memory that still makes your heart beat faster?",
  "Have you ever missed an opportunity because you were scared?",
  "What's something about relationships you learned the hard way?",
  "Have you ever developed feelings unexpectedly?",
  "What's a compliment that stayed with you longer than it should have?",
  "Have you ever felt attracted at the wrong time?",
  "What's the most emotionally intense moment you've shared?",
  "Do you value emotional connection over attraction?",
  "What's something people usually misunderstand about you?",
  "Have you ever kept a crush secret for a long time?",
  "What's the most spontaneous decision you made because of feelings?",
  "Have you ever felt close to someone you barely knew?",
  "What kind of personality instantly attracts you?",
  "What's a bold thought you'd never say out loud in real life?",
  "Have you ever regretted not expressing your feelings?",
  "What does the most confident version of you look like?",
  "Have you ever enjoyed breaking a small rule for the thrill?",
  "What's something you wish people asked you more often?",
  "Have you ever felt closer to a stranger than someone you knew?",
  "What's a memory that feels personal but meaningful?",
  "Do you believe timing matters more than feelings?",
  "What kind of conversation makes you feel instantly connected?",
  "Have you ever surprised yourself emotionally?",
  "What's something you secretly want to experience someday?",
  "What's one feeling you wish you could express more freely?",
];

export const darePrompts: string[] = [
  "Share a bold but non-graphic memory from your life.",
  "Write an honest confession you've never shared before.",
  "Give the other person a flirty compliment without using names.",
  "Finish this sentence honestly: \"I secretly wish that…\"",
  "Describe a moment when you felt unexpectedly confident.",
  "Say something kind you wish someone had told you earlier.",
  "Describe the most exciting place you've ever been without saying where it is.",
  "Share the most daring text message you've ever sent.",
  "Tell the other person what their vibe reminds you of.",
  "Describe your ideal night out in three sentences.",
  "Share a memory that always makes you smile involuntarily.",
  "Describe a moment of unexpected connection with a stranger.",
];

export function getRandomTruth(): string {
  return truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
}

export function getRandomDare(): string {
  return darePrompts[Math.floor(Math.random() * darePrompts.length)];
}
