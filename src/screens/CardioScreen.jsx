import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiPlay } from "react-icons/fi";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import Wrapper from "../components/Wrapper.jsx";
import useStore from "../lib/store.js";
import computeCardioData from "../lib/computeCardioData.js";
import getNextCardioIndex from "../lib/getNextCardioIndex.js";
import clsx from "clsx";
import { Pagination } from "antd";

const CardioScreen = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const currentUser = useStore((state) => state.currentUser);
  const firstName = currentUser?.name?.split(" ")[0];

  const { cardioData, currentWeekIndex, allWeeks } = useMemo(() => computeCardioData(currentUser), [currentUser]);
  const nextWorkoutIndex = getNextCardioIndex(cardioData);

  const handleRun = (cardio, idx) => {
    if (cardio?.result?.length) {
      return;
    }
    const computedCardioId = cardio?.modifiedCardioId ?? cardio?.cardioId;
    history.push(`/cardio/${computedCardioId}?index=${idx}`);
  };

  useEffect(() => {
    setCurrentPage(currentWeekIndex);
  }, [currentWeekIndex]);

  return (
    <Wrapper className="home" history={history}>
      <div className="home-container">
        <header className="home-header">
          <Avatar name={currentUser?.name} className="inverted" />
          <h2>Olá, {firstName}!</h2>
        </header>

        <div className="home-workouts">
          <div className="home-workouts-header">
            <p className="home-workouts-title">
              Cardios da Semana{" "}
              <span className="grey">
                ({currentPage + 1}/{allWeeks?.length})
              </span>
            </p>
          </div>
          {allWeeks?.[currentPage]?.cardios?.length === 0 && <p className="home-workouts-empty">Nenhum cardio cadastrado!</p>}
          {allWeeks?.[currentPage]?.cardios?.map((cardio, index) => (
            <div
              className={clsx("home-workout", cardio?.result?.length > 0 && "finished", nextWorkoutIndex === allWeeks?.[currentPage]?.cardios?.indexOf(cardio) && "next")}
              key={`${cardio._id}-${index}`}
            >
              <div className="home-workout-left cardio">
                <h3>{cardio?.cardioId ? cardio.name : "Descanso"}</h3>
              </div>
              <div className="home-workout-right">
                <Button className="icon sm" onClick={() => handleRun(cardio, index)}>
                  {cardio?.result?.length > 0 ? <FiCheck /> : <FiPlay />}
                </Button>
                {/* {cardio?.length > 1 && (
                  <Dropdown
                    overlay={{
                      items: cardioData
                        .filter((c) => c.cardioId && c.result.length === 0)
                        .map((c) => ({
                          label: c.name,
                          key: c.cardioId,
                          onClick: () => handleClick(c.cardioId),
                        })),
                    }}
                    trigger={["click"]}
                  >
                    <Button className="icon sm">
                      <FiRepeat />
                    </Button>
                  </Dropdown>
                )} */}
              </div>
            </div>
          ))}
        </div>
        <Pagination style={{ marginTop: 40 }} align="center" current={currentPage + 1} pageSize={1} total={allWeeks?.length} onChange={(page) => setCurrentPage(page - 1)} />
      </div>
    </Wrapper>
  );
};

export default CardioScreen;
