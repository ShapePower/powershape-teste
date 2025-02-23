import { forwardRef } from "react";
import clsx from "clsx";

const Button = forwardRef(({ onClick, children, disabled, className = "", ...props }, ref) => {
  return (
    <button ref={ref} onClick={onClick} disabled={disabled} className={clsx("button", className)} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
