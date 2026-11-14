import { findClosestElement } from "#shared/utils/geo";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

async function fetchOverpass(query: string, signal?: AbortSignal) {
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "User-Agent":
            "vehicleshub.netlify.app (https://vehicleshub.netlify.app)",
        },
        signal,
      });
    } catch (error) {
      // Stop immediately if the request was intentionally aborted
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

export default defineCachedEventHandler(
  async (event) => {
    const { lat, lng } = getQuery(event);

    const query = `[out:json][timeout:10];nwr["amenity"~"^(fuel|charging_station|car_wash)$"](around:500,${lat},${lng});out center tags 10;`;

    const data = await fetchOverpass(query);

    console.log("data", data);

    const jsonData = await data.json();
    const closestElement = findClosestElement(
      jsonData.elements,
      Number(lat),
      Number(lng),
    );
    return closestElement;
  },
  {
    maxAge: 60 * 60 * 24,
    getKey: (event) => {
      const { lat, lng } = getQuery(event);
      return `nearby:${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
    },
  },
);
