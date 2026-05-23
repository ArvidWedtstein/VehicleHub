import type { H3Event } from "h3";

export const getManufacturerModels = defineCachedFunction(
  async (_event: H3Event, manufacturer: string) => {
    const result = await $fetch<{
      Count: number;
      Results: Partial<{ Model_Name: string }>[];
    }>(
      `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${manufacturer.toLowerCase()}?format=json`,
    );

    const models = result.Results.map((res) => res.Model_Name);
    return models;
  },
  {
    swr: false,
    maxAge: 3600 * 24,
  },
);
