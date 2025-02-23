import clsx from "clsx";

const Avatar = ({ name, className = "" }) => {
  return <div className={clsx("avatar", className)}>{name?.charAt(0) || ""}</div>;
};

export default Avatar;
