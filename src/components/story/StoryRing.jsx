import { useEffect, useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { getActiveStories, createStory, viewStory, uploadMedia } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';
import toast from 'react-hot-toast';

export default function StoryRing() {
  const { user } = useAuth();
  const [stories, setStories]       = useState([]);   // other users
  const [myStories, setMyStories]   = useState(null); // own group
  const [viewing, setViewing]       = useState(null);
  const [viewedIds, setViewedIds]   = useState(() => {
    const saved = localStorage.getItem('viewed_stories');
    return saved ? JSON.parse(saved) : [];
  });
  const fileRef = useRef();

  useEffect(() => {
    getActiveStories()
      .then((r) => {
        const raw = r.data?.data || [];
        if (!Array.isArray(raw)) return;
        
        const othersMap = {};
        let mine = null;

        raw.forEach((s) => {
          if (s.authorId == user?.userId) {
            if (!mine) mine = { 
              authorId: s.authorId, 
              username: 'Your Story', 
              profilePic: user?.profilePicUrl || s.authorProfilePic, 
              items: [] 
            };
            mine.items.push(s);
          } else {
            if (!othersMap[s.authorId]) othersMap[s.authorId] = { 
              authorId: s.authorId, 
              username: s.authorUsername, 
              profilePic: s.authorProfilePic, 
              items: [] 
            };
            othersMap[s.authorId].items.push(s);
          }
        });
        setMyStories(mine);
        setStories(Object.values(othersMap));
      })
      .catch(() => setStories([]));
  }, [user?.userId]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const toastId = toast.loading('Sharing story...');
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const uploadRes = await uploadMedia(fd);
      const mediaUrl = uploadRes.data?.data?.url;
      if (!mediaUrl) throw new Error('Upload failed');

      await createStory({
        mediaUrl,
        mediaType: selectedFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
        caption: caption,
        visibility: visibility
      });
      toast.success('Story shared!', { id: toastId });
      setShowUploadModal(false);
      window.location.reload();
    } catch (err) { 
      toast.error('Upload failed', { id: toastId }); 
    } finally {
      setIsUploading(false);
    }
  };

  const openStories = (group) => {
    setViewing(group);
    // Mark first item as viewed locally
    if (group.items[0]) {
      const newViewed = [...new Set([...viewedIds, group.items[0].storyId])];
      setViewedIds(newViewed);
      localStorage.setItem('viewed_stories', JSON.stringify(newViewed));
      viewStory(group.items[0].storyId).catch(() => {});
    }
  };

  const isGroupViewed = (group) => {
    if (!group || !group.items.length) return true;
    return group.items.every(s => viewedIds.includes(s.storyId));
  };

  return (
    <>
      <div className="story-bar">
        {/* Your Story */}
        <div className="story-ring" onClick={() => myStories ? openStories(myStories) : fileRef.current.click()}>
          <div className={`story-ring-border ${isGroupViewed(myStories) ? 'seen' : ''}`} style={{ position: 'relative' }}>
            <div className="story-inner">
              <Avatar src={user?.profilePicUrl} name={user?.username} size="md" />
            </div>
            {!myStories && (
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--amber)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', fontSize: '14px', fontWeight: 'bold' }}>
                +
              </div>
            )}
          </div>
          <span className="story-username">Your Story</span>
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>

        {/* Others */}
        {stories.map((group) => (
          <div key={group.authorId} className="story-ring" onClick={() => openStories(group)}>
            <div className={`story-ring-border ${isGroupViewed(group) ? 'seen' : ''}`}>
              <div className="story-inner">
                <Avatar src={group.profilePic} name={group.username} size="md" />
              </div>
            </div>
            <span className="story-username">{group.username}</span>
          </div>
        ))}
      </div>

      {/* Share Story Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Share Story</h3>
              <button onClick={() => setShowUploadModal(false)}><X size={20}/></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              {selectedFile?.type.startsWith('video') ? (
                <div style={{ padding: '2rem', background: '#f5f5f5', borderRadius: 'var(--r-md)' }}>🎥 Video Selected</div>
              ) : (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="preview" 
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--r-md)' }} 
                />
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Caption (Optional)</label>
              <textarea 
                className="input" 
                placeholder="Add a caption..." 
                value={caption} 
                onChange={e => setCaption(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Who can see this?</label>
              <select 
                className="input" 
                value={visibility} 
                onChange={e => setVisibility(e.target.value)}
              >
                <option value="PUBLIC">🌍 Public</option>
                <option value="FOLLOWERS_ONLY">👥 My Followers</option>
                <option value="PRIVATE">🔒 Only Me</option>
              </select>
            </div>

            <div className="post-form-footer">
              <button 
                className="btn btn-primary btn-full" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Sharing...' : 'Share Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && <StoryViewer group={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
