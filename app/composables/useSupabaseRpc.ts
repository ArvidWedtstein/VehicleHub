import { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

type PublicFunctions = Database["public"]["Functions"];
type FunctionName = keyof PublicFunctions;
type FunctionArgs<T extends FunctionName> = PublicFunctions[T]["Args"];
type FunctionReturns<T extends FunctionName> = PublicFunctions[T]["Returns"];

type ExecuteParams<T extends FunctionName> = [FunctionArgs<T>] extends [never]
  ? []
  : {} extends FunctionArgs<T>
    ? [args?: FunctionArgs<T>]
    : [args: FunctionArgs<T>];

export function useSupabaseRpc<T extends FunctionName>(fn: T) {
  const client = useSupabaseClient();

  const data = ref<FunctionReturns<T> | null>(
    null,
  ) as Ref<FunctionReturns<T> | null>;
  const error = ref<PostgrestError | null>(null);
  const pending = ref(false);

  async function execute(...[args]: ExecuteParams<T>) {
    pending.value = true;
    error.value = null;

    try {
      const res = await client.rpc(fn as never, (args ?? {}) as never);

      if (res.error) {
        error.value = res.error;
        data.value = null;
      } else {
        data.value = res.data as FunctionReturns<T>;
      }

      return { data: data.value, error: error.value };
    } finally {
      pending.value = false;
    }
  }

  function reset() {
    data.value = null;
    error.value = null;
    pending.value = false;
  }

  return { data, error, pending, execute, reset };
}
