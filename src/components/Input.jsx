const Input = ({ label, type = "text", name, value, onChange, placeholder, className, disabled = false, ...props }) => {
  return (
    <div className="input-wrapper">
      {label && <label htmlFor={name}>{label}</label>}
      <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className={className} disabled={disabled} {...props} />
    </div>
  );
};

export default Input;
