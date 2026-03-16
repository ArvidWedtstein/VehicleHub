import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";
import {
  createVehicleExpense,
  updateVehicleExpense,
  useVehicleExpense,
} from "../useVehicleExpenses";
import { useVehicle } from "../../useVehicles";

const getDefaultExpenseValues = (): TablesUpdate<"VehicleExpenses"> => ({
  amount: 0,
  cost: 0,
  currency: "NOK",
  unit: "liter",
  type: "Fuel",
  date: convertToDatetimeLocal(),
});

export const useExpenseForm = () => {
  const expense = ref<
    TablesInsert<"VehicleExpenses"> | TablesUpdate<"VehicleExpenses">
  >(getDefaultExpenseValues());

  const vehicle = ref<Partial<Tables<"Vehicles">>>();

  const initialize = async (
    vehicleId: Tables<"VehicleExpenses">["vehicle_id"],
    expenseId?: TablesUpdate<"VehicleExpenses">["id"],
  ) => {
    const { data: vehicleData } = await useVehicle(vehicleId);
    vehicle.value = vehicleData.value;

    if (expenseId) {
      const { data: editExpense, error } = useVehicleExpense(
        vehicleId,
        expenseId,
      );

      if (error.value) throw error.value;

      expense.value = {
        ...editExpense.value,
        date: convertToDatetimeLocal(editExpense.value?.date),
      };

      return;
    }

    const client = useSupabaseClient();
    const { data, error } = await client.rpc("get_last_mileage", {
      vehicle_id: vehicleId,
      type: "expenses",
    });

    if (error) throw error;

    const lastMileage = data[0]?.mileage;

    expense.value = {
      vehicle_id: vehicleId,
      ...getDefaultExpenseValues(),
      date: convertToDatetimeLocal(),
      mileage: lastMileage,
    };
  };

  const isEdit = computed(() => !!expense.value.id);

  const save = async () => {
    try {
      // Remove computed values. TODO: find better solution for this in future
      delete expense.value.price_per_unit;

      console.log(
        "Saving expense:",
        expense.value,
        convertLocalToUTC(expense.value.date),
      );

      let expenseId = expense.value.id;
      let vehicleId = expense.value.vehicle_id;

      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }

      if (isEdit.value && expenseId) {
        await updateVehicleExpense(vehicleId, expenseId, {
          ...expense.value,
          date: convertLocalToUTC(expense.value.date),
        });

        return;
      }

      await createVehicleExpense(vehicleId, {
        ...expense.value,
        date: convertLocalToUTC(expense.value.date),
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    expense,
    isEdit,
    vehicle,
    save,
    initialize,
  };
};
