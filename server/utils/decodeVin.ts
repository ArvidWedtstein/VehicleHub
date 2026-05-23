import type { H3Event } from "h3";

type VinResponseModel = {
  ErrorText: string;
  AdditionalErrorText: string;
  Make: string;
  Model: string;
  ModelYear: string;
  FuelTypePrimary: string;
  PlantCountry: string;
  VehicleType: string;
  SuggestedVIN: string;
};

export const decodeVehicleIdentificationNumber = defineCachedFunction(
  async (_event: H3Event, vin: string) => {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
    );
    const data: { Results: VinResponseModel[]; Count: number } =
      await res.json();

    if (!data.Count) return;

    const vinData = data.Results?.[0];

    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    return {
      country: capitalize(vinData?.PlantCountry.toLowerCase() || ""),
      manufacturer: capitalize(vinData?.Make.toLowerCase() || ""),
      vehicleType: capitalize(vinData?.VehicleType.toLowerCase() || ""),
      modelYear: vinData?.ModelYear ? parseInt(vinData?.ModelYear) : undefined,
      model: vinData?.Model || undefined,
      fuelType: vinData?.FuelTypePrimary || undefined,
      errorText: vinData?.ErrorText || undefined,
      suggestedVIN: vinData?.SuggestedVIN || undefined,
    };
  },
  {
    swr: false,
    maxAge: 3600 * 24,
  },
);
