interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  name: string;
  class: string;
  type: string;
  display_name: string;
  address: Record<string, string>;
  namedetails?: Record<string, string>;
  extratags?: Record<string, string>;
}
const fetchLocation = async (lat: number, lon: number) => {
  const res = await $fetch<NominatimResponse>(
    "https://nominatim.openstreetmap.org/reverse",
    {
      method: "GET",
      headers: {
        "User-Agent":
          "vehicleshub.netlify.app (https://vehicleshub.netlify.app)",
      },
      query: {
        lat,
        lon,
        format: "json",
        extratags: 1,
        //addressdetails: 1,
        namedetails: 1,
        entrances: 1,
      },
    },
  );

  return res;
};

export default defineCachedEventHandler(
  async (event) => {
    try {
      const { lat, lon } = getQuery(event);

      const data = await fetchLocation(Number(lat), Number(lon));

      return data;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  },
  {
    maxAge: 60 * 60 * 24,
    getKey: (event) => {
      const { lat, lon } = getQuery(event);
      return `location:${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
    },
  },
);
