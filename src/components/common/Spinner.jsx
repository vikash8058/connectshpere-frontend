export default function Spinner({ size = '', centered = false }) {
  const el = <div className={`spinner ${size ? `spinner-${size}` : ''}`} />;
  if (centered) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>{el}</div>;
  return el;
}
