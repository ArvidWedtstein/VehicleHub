import z from "zod";
import { decodeVehicleIdentificationNumber } from "~~/server/utils/decodeVin";

const paramsSchema = z.object({
  vin: z.string().min(11).toUpperCase(),
});

export default defineCachedEventHandler(async (event) => {
  const { vin } = await getValidatedRouterParams(event, paramsSchema.parse);

  const decodedVin = await decodeVehicleIdentificationNumber(event, vin);

  return decodedVin;
});
