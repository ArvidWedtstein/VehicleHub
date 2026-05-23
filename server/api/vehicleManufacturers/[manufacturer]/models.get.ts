import z from "zod";
import { getManufacturerModels } from "~~/server/utils/vehicleManufacturerModels";

const paramsSchema = z.object({
  manufacturer: z.string().toLowerCase(),
});

export default defineEventHandler(async (event) => {
  const { manufacturer } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const models = await getManufacturerModels(event, manufacturer);

  return models;
});
