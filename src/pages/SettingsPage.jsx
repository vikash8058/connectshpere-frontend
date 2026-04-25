import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, setInitialPassword } from '../api/auth';
import { uploadMedia } from '../api/social';
import { PlusSquare } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { Camera, X as CloseIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, saveSession } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({
    fullName:      user?.fullName || '',
    username:      user?.username || '',
    bio:           user?.bio || '',
    profilePicUrl: user?.profilePicUrl || '',
  });
  const [profLoading, setProfLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const fileRef = useRef();

  const handleAvatarClick = () => fileRef.current.click();

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewFileUrl(URL.createObjectURL(file));
    setZoom(1);
    setPosition({ x: 0, y: 0 }); // Reset position
    setShowCropModal(true);
    e.target.value = null;
  };

  const onDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const onDragEnd = () => setIsDragging(false);

  const finalizeAvatarUpload = async () => {
    console.log("Finalizing upload. Zoom:", zoom, "Pos:", position);
    if (!pendingFile) return;
    
    setAvatarLoading(true);
    const toastId = toast.loading('Applying crop & saving...');
    
    try {
      // 1. Create a canvas to perform the crop
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Load the image into the canvas
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewFileUrl;
      });

      // Set canvas size (standard high-res avatar size)
      const size = 400; 
      canvas.width = size;
      canvas.height = size;

      // Calculate crop logic based on zoom AND drag position
      const imgWidth = img.width;
      const imgHeight = img.height;
      const minSide = Math.min(imgWidth, imgHeight);
      
      // The "view" is a square relative to the zoom
      const cropSize = minSide / zoom;
      
      // Map the 240px preview drag to actual image pixels
      const dragFactor = minSide / 240;
      const sx = ((imgWidth - cropSize) / 2) - (position.x * dragFactor);
      const sy = ((imgHeight - cropSize) / 2) - (position.y * dragFactor);

      // Draw the cropped/zoomed/panned image onto our square canvas
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      // 2. Convert canvas to blob for upload
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      
      const fd = new FormData();
      fd.append('file', blob, 'profile-avatar.jpg');
      
      console.log("Uploading cropped blob...");
      const res = await uploadMedia(fd);
      const url = res.data?.data?.url;

      if (url) {
        const updatedProfile = { ...profile, profilePicUrl: url };
        setProfile(updatedProfile);
        
        // Instant Save to Database (Professional behavior)
        await updateProfile(user.userId, updatedProfile);
        saveSession({ ...user, ...updatedProfile }, localStorage.getItem('token'));
        
        setShowCropModal(false);
        setPendingFile(null);
        toast.success('Profile picture updated!', { id: toastId });
      }
    } catch (err) {
      console.error("Crop/Upload error:", err);
      toast.error('Could not save resized photo', { id: toastId });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      await updateProfile(user.userId, profile);
      saveSession({ ...user, ...profile }, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setProfLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPw.length < 6) { toast.error('Min 6 characters'); return; }
    setPwLoading(true);
    try {
      if (user?.isPasswordSet) {
        await changePassword(user.userId, { currentPassword: passwords.current, newPassword: passwords.newPw });
        toast.success('Password changed!');
      } else {
        await setInitialPassword({ newPassword: passwords.newPw, confirmPassword: passwords.confirm });
        saveSession({ ...user, isPasswordSet: true }, localStorage.getItem('token'));
        toast.success('Password set! You can now login with email too.');
      }
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already set')) {
        // If it was already set (maybe via double-click or stale session), just update the local UI
        saveSession({ ...user, isPasswordSet: true }, localStorage.getItem('token'));
        toast.success('Password is already set! Switching to update mode.');
      } else {
        toast.error(msg || 'Action failed');
      }
    } finally { setPwLoading(false); }
  };


  const inputStyle = { marginBottom: '1rem' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {['profile', 'password'].map((t) => (
          <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* Profile settings */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <Avatar src={profile.profilePicUrl} name={profile.username} size="xl" viewable={true} />
              <div 
                style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--amber)', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                onClick={handleAvatarClick}
              >
                <PlusSquare size={16} />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{user?.username}</div>
              <button type="button" onClick={handleAvatarClick} className="btn-link" style={{ fontSize: '0.88rem', color: 'var(--amber)', fontWeight: 600, marginTop: '0.25rem' }}>
                Change profile photo
              </button>
            </div>
          </div>

          {[
            { key: 'fullName', label: 'Full Name', placeholder: 'Your full name' },
            { key: 'username', label: 'Username', placeholder: 'username' },
          ].map(({ key, label, placeholder }) => (
            <div className="input-group" key={key} style={inputStyle}>
              <label className="input-label">{label}</label>
              <input className="input" placeholder={placeholder} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
            </div>
          ))}

          <div className="input-group" style={inputStyle}>
            <label className="input-label">Bio</label>
            <textarea className="input" placeholder="Tell people about yourself…" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} style={{ minHeight: 80 }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={profLoading}>
            {profLoading ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Password settings */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordChange}>
          {!user?.isPasswordSet && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--amber-light)', borderRadius: '8px', border: '1px solid var(--amber)', color: 'var(--amber-dark)', fontSize: '0.88rem' }}>
              <strong>Setting up your account:</strong> You logged in via Google. Set a password below so you can also log in using your email directly.
            </div>
          )}

          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password', hidden: !user?.isPasswordSet },
            { key: 'newPw',   label: 'New Password',     placeholder: 'Min 6 characters' },
            { key: 'confirm', label: 'Confirm New',      placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder, hidden }) => (
            !hidden && (
              <div className="input-group" key={key} style={inputStyle}>
                <label className="input-label">{label}</label>
                <input className="input" type="password" placeholder={placeholder} value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} />
              </div>
            )
          ))}
          <button type="submit" className="btn btn-primary" disabled={pwLoading}>
            {pwLoading ? <Spinner size="sm" /> : user?.isPasswordSet ? 'Change Password' : 'Set Initial Password'}
          </button>
        </form>
      )}

      {/* Framing / Crop Modal */}
      {showCropModal && (
        <Modal open={showCropModal} title="Frame your profile photo" onClose={() => setShowCropModal(false)}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Drag to position • Slide to zoom
            </p>
            
            {/* The "Frame" with Drag Listeners */}
            <div 
              style={{ 
                width: 240, height: 240, 
                margin: '0 auto 1.5rem', 
                borderRadius: '50%', 
                border: '4px solid #fff',
                boxShadow: '0 0 0 4px var(--amber-light), var(--shadow-lg)',
                overflow: 'hidden',
                background: '#f8f9fa',
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
            >
              <img 
                src={previewFileUrl} 
                alt="Preview" 
                draggable={false}
                style={{ 
                  minWidth: '100%', 
                  minHeight: '100%', 
                  width: 'auto',
                  height: 'auto',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: 'cover',
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  userSelect: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }} 
              />
            </div>

            {/* Zoom Slider */}
            <div style={{ marginBottom: '2rem', padding: '0 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer',
                  accentColor: 'var(--amber)'
                }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setShowCropModal(false)}
                style={{ minWidth: 120 }}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={finalizeAvatarUpload}
                disabled={avatarLoading}
                style={{ minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {avatarLoading ? <Spinner size="sm" /> : 'Set Profile Picture'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
