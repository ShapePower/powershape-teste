import { Preferences } from "@capacitor/preferences";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Wrapper from "../components/Wrapper.jsx";
import useStore from "../lib/store.js";
import { DayPicker } from "react-day-picker";

const ProfileScreen = ({ history }) => {
  const store = useStore();
  const currentUser = useStore((state) => state.currentUser);

  const workoutsOnWeek = currentUser?.mesocycles?.reduce((acc, curr) => acc + curr?.weeks?.reduce((acc2, curr2) => acc2 + curr2?.workouts?.filter((wo) => wo?.result?.length > 0)?.length, 0), 0);
  const workoutsOnMonth = currentUser?.mesocycles?.reduce((acc, curr) => acc + curr?.weeks?.reduce((acc2, curr2) => acc2 + curr2?.workouts?.filter((wo) => wo?.result?.length > 0)?.length, 0), 0);
  const workoutDays =
    currentUser?.mesocycles
      ?.flatMap((mesocycle) => mesocycle?.weeks?.flatMap((week) => week?.workouts?.filter((workout) => workout?.result?.length > 0).map((workout) => new Date(workout.day))))
      ?.filter(Boolean) || [];

  const handleLogout = async () => {
    await Preferences.clear();
    store.clear();
    history.push("/");
  };

  return (
    <Wrapper className="profile" history={history}>
      <div className="profile-container">
        <header className="profile-header">
          <Avatar name={currentUser?.name} />
          <h2>{currentUser?.name}</h2>
        </header>
        <div className="profile-fields">
          <Input label="Email" value={currentUser?.email} disabled />
          <Input label="Celular" value={currentUser?.phone} disabled />
        </div>
        <div className="profile-stats">
          <div className="profile-stats-item">
            <p>{workoutsOnWeek}</p>
            <p>Treinos feitos na semana</p>
          </div>
          <div className="profile-stats-item">
            <p>{workoutsOnMonth}</p>
            <p>Treinos feitos no mês</p>
          </div>
        </div>
        <DayPicker mode="multiple" selected={workoutDays} onSelect={() => {}} hideNavigation components={{ MonthCaption: () => null }} />
        <Button className="text error" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </Wrapper>
  );
};

export default ProfileScreen;
