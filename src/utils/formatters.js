// 1200 → "1.2K", 1000000 → "1M"
export function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Get initials from a name or username — used for avatar placeholder
export function getInitials(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

// Parse #hashtags from post content → returns array of tags
export function extractHashtags(text = '') {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? matches.map((t) => t.slice(1)) : [];
}

// Parse @mentions from post content → returns array of usernames
export function extractMentions(text = '') {
  const matches = text.match(/@[a-zA-Z0-9_]+/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

// Linkify hashtags and mentions inside text for rendering
export function linkifyText(text = '') {
  return text
    .replace(/#([a-zA-Z0-9_]+)/g, '<a href="/hashtag/$1" class="hashtag">#$1</a>')
    .replace(/@([a-zA-Z0-9_]+)/g, '<a href="/profile/$1" class="mention">@$1</a>');
}
