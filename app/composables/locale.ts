import type { Ref } from "vue";

export const useNuxtLocale = () =>
  useState<string>("locale", () => useDefaultLocale().value);

export const useDefaultLocale = (fallback = "en-US") => {
  const locale = ref(fallback);
  if (import.meta.server) {
    const reqLocale = useRequestHeaders()["accept-language"]?.split(",")[0];
    if (reqLocale) {
      locale.value = reqLocale;
    }
  } else if (import.meta.client) {
    const navLang = navigator.language;
    if (navLang) {
      locale.value = navLang;
    }
  }
  return locale;
};

export const useNuxtLocales = () => {
  const locale = useNuxtLocale();
  const locales = ref([
    "en-US",
    "en-GB",
    "ko-KR",
    "zh-CN",
    "ar-EG",
    "fa-IR",
    "ja-JP-u-ca-japanese",
  ]);
  if (!locales.value.includes(locale.value)) {
    locales.value.unshift(locale.value);
  }
  return locales;
};
