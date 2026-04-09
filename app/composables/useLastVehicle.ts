export const useLastVehicle = () => {
  const lastVehicleId = useCookie("lastVehicle", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  const setLastVehicle = (vehicleId: number) => {
    lastVehicleId.value = vehicleId.toString();
    console.log("Set last vehicle ID to:", lastVehicleId.value);
  };

  return {
    lastVehicleId,
    setLastVehicle,
  };
};
