export default function Field({ label, children, hint }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}
