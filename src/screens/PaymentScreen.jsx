import clsx from "clsx";
import Wrapper from "../components/Wrapper.jsx";
import useStore from "../lib/store.js";
import { FiCheck, FiClock, FiAlertTriangle, FiMinusCircle } from "react-icons/fi";
import { Tooltip } from "antd";

const formatDate = (date) => {
  const options = { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" };
  return new Date(date).toLocaleDateString("pt-BR", options);
};

const PaymentScreen = ({ history }) => {
  const currentUser = useStore((state) => state.currentUser);
  const payments = currentUser?.payments || []; // the structure is { "amount": 60, "expectedPaymentDate": "2024-10-02T00:00:00.000Z", "paymentDate": null, "paid": false, "_id": "66f1b87e4ba661119b698477" }

  const isBeforeExpectedDate = (item) => {
    return !item.paid && new Date(item.expectedPaymentDate) > new Date();
  };

  const isLate = (item) => {
    return !item.paid && new Date(item.expectedPaymentDate) < new Date();
  };

  const getTooltipText = (item) => {
    if (item.paid) return "Pago";
    if (isBeforeExpectedDate(item)) return "Em aberto";
    if (isLate(item)) return "Atrasado";
    return "Não aplicável";
  };

  const getIcon = (item) => {
    let icon;
    if (item.paid) icon = <FiCheck color="green" />;
    else if (isBeforeExpectedDate(item)) icon = <FiClock color="blue" />;
    else if (isLate(item)) icon = <FiAlertTriangle color="#CF4A39" />;
    else icon = <FiMinusCircle color="grey" />;

    return <Tooltip title={getTooltipText(item)}>{icon}</Tooltip>;
  };

  const sortedPayments = payments.sort((a, b) => new Date(b.expectedPaymentDate) - new Date(a.expectedPaymentDate));

  return (
    <Wrapper className="payment" history={history}>
      <div className="payment-container">
        <h2>Pagamentos</h2>
        <div className="payment-list">
          {sortedPayments.map((payment) => (
            <div key={payment._id}>
              <span className="payment-item-expected-date">{formatDate(payment.expectedPaymentDate)}</span>

              <div className={clsx("payment-item", { late: isLate(payment) })}>
                <span className="payment-item-amount">${payment.amount}</span>
                <div className="payment-item-right">
                  <span className="payment-item-date">{payment.paymentDate ? formatDate(payment.paymentDate) : "Pendente"}</span>
                  {getIcon(payment)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default PaymentScreen;
