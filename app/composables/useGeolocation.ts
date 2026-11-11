export const useGeolocation = () => {
  const coordinates = shallowRef<GeolocationCoordinates | null>(null);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const getLocation = () =>
    new Promise<typeof coordinates.value>((resolve) => {
      if (!import.meta.client || !("geolocation" in navigator)) {
        error.value = "Geolocation is not supported by this browser.";
        resolve(null);
        return;
      }

      loading.value = true;
      error.value = null;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coordinates.value = position.coords;
          loading.value = false;
          resolve(coordinates.value);
        },
        (err) => {
          error.value = err.message;
          loading.value = false;
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });

  return {
    coordinates,
    error,
    loading,
    getLocation,
  };
};
