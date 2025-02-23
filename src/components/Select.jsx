import clsx from "clsx";

const Select = ({ options, className = "", onChange, value, ...props }) => {
  return (
    <select {...props} className={clsx("select", className)} onChange={onChange} value={value}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
