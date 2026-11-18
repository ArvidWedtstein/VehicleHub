export function useExpenseStats(expenseId: Ref<number | null>) {
  const supabase = useSupabaseClient();

  return useLazyAsyncData(
    () => `expense-stats-${expenseId.value}`,
    async () => {
      if (!expenseId.value) return null;
      const { data, error } = await supabase
        .rpc("expense_stats", { expense_id: expenseId.value })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    { watch: [expenseId] },
  );
}
