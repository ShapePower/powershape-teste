import { Preferences } from "@capacitor/preferences";

const getUserData = async () => {
  const { value: token } = await Preferences.get({ key: "userToken" });
  const { value: userObject } = await Preferences.get({ key: "userObject" });
  const clientId = JSON.parse(userObject).clientId;

  return { clientId, headers: { Authorization: `Bearer ${token}` } };
};

export default getUserData;
