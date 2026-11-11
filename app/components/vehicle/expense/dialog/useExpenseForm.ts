import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";
import * as z from "zod";
import { expenseFormSchema } from "#shared/schemas/expense";

export type ExpenseSchema = z.output<typeof expenseFormSchema>;

export const useExpenseForm = (
  vehicleId: Tables<"VehicleExpenses">["vehicle_id"],
  expenseId?: TablesUpdate<"VehicleExpenses">["id"],
) => {
  const expense = ref<Partial<ExpenseSchema>>(
    expenseFormSchema.parse({ vehicle_id: 0 }),
  );

  const { data: vehicle, execute: loadVehicle } = useVehicle(vehicleId);
  const editExpenseQuery = expenseId
    ? useVehicleExpense(vehicleId, expenseId)
    : null;

  const isEdit = computed(() => !!expenseId);

  const initialize = async () => {
    if (!vehicle.value) {
      await loadVehicle();
    }

    // Edit mode
    if (expenseId && editExpenseQuery) {
      if (!editExpenseQuery.data.value) {
        await editExpenseQuery.execute();
      }

      if (editExpenseQuery.error.value) {
        throw editExpenseQuery.error.value;
      }

      expense.value = expenseFormSchema.parse({
        ...editExpenseQuery.data.value,
        date: convertToDatetimeLocal(editExpenseQuery.data.value?.date),
      });

      return;
    }

    // Create mode
    const client = useSupabaseClient();
    const { data, error } = await client.rpc("get_last_mileage", {
      vehicle_id: vehicleId,
      type: "expenses",
    });

    if (error) throw error;

    const lastMileage = data[0]?.mileage;

    expense.value = expenseFormSchema.parse({
      vehicle_id: vehicleId,
      mileage: lastMileage,
    });
  };

  const save = async () => {
    try {
      if (!expense.value) throw new Error("No expense");

      const parsed = expenseFormSchema.parse(expense.value);
      const vehicleId = vehicle.value?.id;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }

      console.log("Saving expense:", parsed, convertLocalToUTC(parsed.date));

      const payload = {
        ...parsed,
        date: convertLocalToUTC(parsed.date),
        vehicle_id: vehicleId,
      };

      if (isEdit.value && parsed.id) {
        await updateVehicleExpense(vehicleId, parsed.id, payload);
        return;
      }

      await createVehicleExpense(vehicleId, payload);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    expense,
    isEdit,
    vehicle,
    expenseSchema: expenseFormSchema,
    save,
    initialize,
  };
};
