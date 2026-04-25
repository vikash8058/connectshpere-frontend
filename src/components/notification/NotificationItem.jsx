import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../../utils/timeAgo';
import { NOTIFICATION_TYPES, REACTION_EMOJI } from '../../utils/constants';
import Avatar from '../common/Avatar';
import { markAsRead } from '../../api/social';

const TYPE_ICON = {
  LIKE: '❤️', COMMENT: '💬', REPLY: '↩️', FOLLOW: '👤', MENTION: '@',
};

export default function NotificationItem({ notif, onRead }) {
  const navigate = useNavigate();
  const handleClick = async () => {
    // 1. Mark as read
    if (!notif.isRead) {
      await markAsRead(notif.notificationId).catch(() => {});
      onRead?.(notif.notificationId);
    }

    // 2. Navigate based on type
    if (notif.type === 'FOLLOW') {
      navigate(`/profile/${notif.actorId}`);
    } else if (notif.targetId) {
      // For LIKE, COMMENT, REPLY, MENTION — go to the post
      navigate(`/post/${notif.targetId}`);
    } else if (notif.deepLinkUrl) {
      navigate(notif.deepLinkUrl);
    }
  };

  return (
    <div className={`notif-item${!notif.isRead ? ' unread' : ''}`} onClick={handleClick}>
      {/* Actor avatar */}
      <Avatar src={notif.actorProfilePic} name={notif.actorUsername} size="sm" />

      <div style={{ flex: 1 }}>
        <div className="notif-text">
          <strong>{notif.actorUsername || 'Someone'}</strong>{' '}
          {NOTIFICATION_TYPES[notif.type] || notif.message}
        </div>
        <div className="notif-time">{timeAgo(notif.createdAt)}</div>
      </div>

      <span style={{ fontSize: '1.1rem' }}>{TYPE_ICON[notif.type] || '🔔'}</span>
      {!notif.isRead && <div className="notif-dot" />}
    </div>
  );
}
