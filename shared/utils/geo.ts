interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findClosestElement(
  elements: OverpassElement[],
  userLat: number,
  userLng: number,
) {
  let closest: (OverpassElement & { distanceMeters: number }) | null = null;

  for (const el of elements) {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;

    if (elLat === undefined || elLng === undefined) continue;

    const distanceMeters = Math.round(
      getDistanceMeters(userLat, userLng, elLat, elLng),
    );

    if (!closest || distanceMeters < closest.distanceMeters) {
      closest = {
        ...el,
        distanceMeters,
      };
    }
  }

  return closest;
}
