import type { Tables, TablesUpdate } from "~/types/supabase";
import * as z from "zod";

const expenseSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number().optional(),
  date: z.string().default(convertToDatetimeLocal()),
  type: z.string().default("Fuel"),
  unit: z.string().default("liter"),
  amount: z
    .number({ error: "Amount is required" })
    .min(0, "Amount cannot be less than 0")
    .default(0),
  cost: z.number({ error: "Cost is required" }).default(0),
  mileage: z.number().optional(),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: z.string().optional(),
});

export type ExpenseSchema = z.output<typeof expenseSchema>;

export const useExpenseForm = () => {
  const expense = ref<Partial<ExpenseSchema>>(expenseSchema.parse({}));

  const vehicle = ref<Partial<Tables<"Vehicles">>>();

  const isEdit = computed(() => !!expense.value?.id);

  const initialize = async (
    vehicleId: Tables<"VehicleExpenses">["vehicle_id"],
    expenseId?: TablesUpdate<"VehicleExpenses">["id"],
  ) => {
    const { data: vehicleData } = await useVehicle(vehicleId);
    vehicle.value = vehicleData.value;

    // Edit mode
    if (expenseId) {
      const { data: editExpense, error } = useVehicleExpense(
        vehicleId,
        expenseId,
      );

      if (error.value) throw error.value;

      expense.value = expenseSchema.parse({
        ...editExpense.value,
        date: convertToDatetimeLocal(editExpense.value?.date),
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

    expense.value = expenseSchema.parse({
      vehicle_id: vehicleId,
      mileage: lastMileage,
    });
  };

  const save = async () => {
    try {
      if (!expense.value) throw new Error("No expense");

      const parsed = expenseSchema.parse(expense.value);
      const vehicleId = parsed.vehicle_id;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }

      console.log("Saving expense:", parsed, convertLocalToUTC(parsed.date));

      const payload = {
        ...parsed,
        date: convertLocalToUTC(parsed.date),
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
    expenseSchema,
    save,
    initialize,
  };
};
