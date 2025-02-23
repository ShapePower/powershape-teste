const Textarea = ({ label, name, value, onChange, placeholder, className, disabled = false, rows = 3 }) => {
  return (
    <div className="textarea-wrapper">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className={className} disabled={disabled} rows={rows} />
    </div>
  );
};

export default Textarea;
