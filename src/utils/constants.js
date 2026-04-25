export const REACTION_TYPES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];

export const REACTION_EMOJI = {
  LIKE:  '👍',
  LOVE:  '❤️',
  HAHA:  '😂',
  WOW:   '😮',
  SAD:   '😢',
  ANGRY: '😠',
};

export const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC',        label: 'Public',        icon: '🌍' },
  { value: 'FOLLOWERS_ONLY', label: 'My Followers', icon: '👥' },
  { value: 'PRIVATE',       label: 'Private',        icon: '🔒' },
];

export const NOTIFICATION_TYPES = {
  LIKE:    'liked your post',
  COMMENT: 'commented on your post',
  REPLY:   'replied to your comment',
  FOLLOW:  'started following you',
  MENTION: 'mentioned you in a post',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  USER:  'USER',
};
