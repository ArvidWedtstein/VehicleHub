export const useLastVehicle = () => {
  const lastVehicleId = useCookie("lastVehicle", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  const setLastVehicle = (vehicleId: number) => {
    lastVehicleId.value = vehicleId.toString();
  };

  return {
    lastVehicleId,
    setLastVehicle,
  };
};
