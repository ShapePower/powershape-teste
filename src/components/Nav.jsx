import { HiHome, HiClock, HiUser } from "react-icons/hi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaRunning } from "react-icons/fa";
import clsx from "clsx";
import useStore from "../lib/store.js"; // Importing useStore to access the payment data

const Nav = ({ history }) => {
  const currentPath = history.location.pathname;
  const currentUser = useStore((state) => state.currentUser);
  const payments = currentUser?.payments || [];

  const hasLatePayment = payments.some((payment) => !payment.paid && new Date(payment.expectedPaymentDate) < new Date());

  const items = [
    {
      path: "/home",
      icon: HiHome,
      label: "Treinos",
    },
    {
      path: "/cardio",
      icon: FaRunning,
      label: "Cardios",
    },
    {
      path: "/history",
      icon: HiClock,
      label: "Histórico",
    },
    {
      path: "/payments",
      icon: BiMoneyWithdraw,
      label: "Pagos",
    },
    {
      path: "/profile",
      icon: HiUser,
      label: "Perfil",
    },
  ];

  const handleClick = (path) => {
    history.push(path);
  };

  return (
    <nav className="nav">
      {items.map((item) => (
        <div key={item.path} className={clsx("nav-item", currentPath === item.path && "active")} onClick={() => handleClick(item.path)}>
          <div className="nav-item__icon">
            <item.icon />
          </div>
          <p>{item.label}</p>
          {hasLatePayment && item.path === "/payments" && <div className="nav-item__red-dot" />}
        </div>
      ))}
    </nav>
  );
};

export default Nav;
