const explicitWords = [
  "nude", "nudes", "naked", "porn", "sex", "dick", "cock", "pussy", 
  "boobs", "tits", "ass", "fuck", "blowjob", "handjob", "masturbat",
  "orgasm", "cum", "horny", "slut", "whore", "bitch",
];

const minorKeywords = [
  "underage", "minor", "child", "kid", "teen", "teenager",
  "young girl", "young boy", "little girl", "little boy",
  "12 year", "13 year", "14 year", "15 year", "16 year", "17 year",
];

const personalInfoPatterns = [
  /\b\d{10,}\b/, // phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
  /(?:https?:\/\/|www\.)\S+/i, // URLs
  /@\w{2,}/, // social handles
];

export type ModerationResult = {
  allowed: boolean;
  reason?: "explicit" | "minor" | "personal_info" | "spam";
};

export function moderateMessage(text: string): ModerationResult {
  const lower = text.toLowerCase();

  for (const keyword of minorKeywords) {
    if (lower.includes(keyword)) {
      return { allowed: false, reason: "minor" };
    }
  }

  for (const word of explicitWords) {
    if (lower.includes(word)) {
      return { allowed: false, reason: "explicit" };
    }
  }

  for (const pattern of personalInfoPatterns) {
    if (pattern.test(text)) {
      return { allowed: false, reason: "personal_info" };
    }
  }

  return { allowed: true };
}

export function getModerationWarning(reason: ModerationResult["reason"]): string {
  switch (reason) {
    case "minor":
      return "⚠️ Any mention of minors is strictly prohibited. You have been disconnected.";
    case "explicit":
      return "⚠️ Explicit sexual content is not allowed. Please keep it suggestive but non-graphic.";
    case "personal_info":
      return "⚠️ Sharing personal information (emails, phone numbers, links, social handles) is not allowed.";
    case "spam":
      return "⚠️ Please slow down. You're sending messages too quickly.";
    default:
      return "⚠️ Message blocked.";
  }
}
