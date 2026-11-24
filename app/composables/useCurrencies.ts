import type { Database } from "~/types/supabase";

type CurrenciesReturn =
  Database["public"]["Functions"]["get_currencies"]["Returns"];
export type Currency = CurrenciesReturn extends (infer Row)[] ? Row : never;

export function useCurrencies() {
  const user = useSupabaseUser();
  const { execute } = useSupabaseRpc("get_currencies");

  const { data, pending, error, refresh } = useAsyncData(
    "currencies",
    async () => {
      const res = await execute();
      if (res.error) throw res.error;
      return res.data ?? [];
    },
  );

  const setUserCurrency = async (currency: string) => {
    if (!user.value) return;
    await updateProfile(user.value.sub, {
      currency,
    });
  };

  const currencies = computed(() => data.value ?? []);

  return { currencies, pending, error, refresh, setUserCurrency };
}
