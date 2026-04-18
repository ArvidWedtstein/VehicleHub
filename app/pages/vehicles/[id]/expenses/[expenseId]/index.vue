<script setup lang="ts">
import ExpenseDialog from "~/components/vehicle/expense/dialog/ExpenseDialog.vue";
import { useProfiles } from "~/features/profiles/useProfiles";
import {
  deleteVehicleExpense,
  useVehicleExpense,
} from "~/features/vehicles/expenses/useVehicleExpenses";

useHead({
  title: "Expense",
});

definePageMeta({
  auth: true,

  validate: async (route) => {
    return typeof route.params.id === "string" && /^\d+$/.test(route.params.id);
  },
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");
const expenseId = useRouteParam("expenseId", "number");

const {
  data: expense,
  pending: loading,
  error,
} = useVehicleExpense(vehicleId, expenseId);

const { data: profiles } = useProfiles();

const overlay = useOverlay();
const toast = useToast();
const confirm = useConfirmDialog();

const vehicleExpenseDialog = overlay.create(ExpenseDialog);

/** TODO: remove & move to fetching of expense instead */
const createdBy = computed(() => {
  return profiles.value?.find(
    ({ user_id }) => user_id === expense.value?.createdby_id,
  );
});

const handleEditExpense = () => {
  if (!vehicleId.value) return;

  console.log("Opening expense dialog for expense", expense.value);

  vehicleExpenseDialog.open({
    vehicleId: vehicleId.value,
    expenseId: expenseId.value,
  });
};

const handleDeleteExpense = async () => {
  if (!vehicleId.value) return;
  if (!expense.value) return;

  const res = await confirm({
    title: "Delete Expense?",
    description:
      "Are you sure you want to delete this expense? This cannot be undone.",
    button: {
      label: "Delete",
      color: "error",
    },
  });

  if (!res) return;

  await deleteVehicleExpense(vehicleId.value, expense.value.id);

  toast.add({ title: "Successfully deleted expense", color: "success" });

  navigateTo({
    name: "vehicles-id-expenses",
    params: { id: vehicleId.value },
  });
};
</script>

<template>
  <div>
    <ULink
      :to="{
        name: 'vehicles-id-expenses',
        params: { id: vehicleId },
      }"
      icon="mdi:chevron-left"
      label="Back to Expenses"
      prefetch
    />

    <span v-if="error">{{ error }}</span>
    <span v-else-if="loading">loading</span>

    <!-- <SkeletonLoader v-if="loading" /> -->

    <UPageCard
      v-else-if="expense"
      :title="expense.type || ''"
      variant="soft"
      :ui="{ footer: 'flex gap-3' }"
    >
      <template #description>
        <UPageList>
          <UUser
            v-if="createdBy"
            :avatar="{
              src: createdBy.profile_image_url || '',
              alt: createdBy.name || '',
              loading: 'lazy',
            }"
            :name="createdBy.name || ''"
            :to="{
              name: 'profiles-profileId',
              params: { profileId: createdBy.id },
            }"
            size="sm"
          />

          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Date:</span>
            <span>
              {{
                formatDate(expense.date, {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              }}
            </span>
          </div>

          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Mileage:</span>
            <span>
              {{
                formatNumber(expense.mileage || 0, {
                  style: "unit",
                  unit: "kilometer",
                  compactDisplay: "short",
                  useGrouping: true,
                })
              }}
            </span>
          </div>
          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Amount:</span>
            <span>
              {{
                formatNumber(expense.amount || 0, {
                  style: "unit",
                  unit: expense.unit || "liter",
                  unitDisplay: "long",
                  compactDisplay: "short",
                })
              }}
            </span>
          </div>
          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Cost:</span>
            <span>
              {{
                formatNumber(expense.cost || 0, {
                  style: "currency",
                  currency: expense.currency || "EUR",
                  currencyDisplay: "narrowSymbol",
                  compactDisplay: "short",
                  notation: "standard",
                })
              }}
            </span>
          </div>
          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold"
              >Price per {{ expense.unit || "litre" }}:</span
            >
            <span>
              {{
                formatNumber(expense.price_per_unit || 0, {
                  style: "currency",
                  currency: expense.currency || "EUR",
                  currencyDisplay: "narrowSymbol",
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </div>
        </UPageList>
      </template>
      <template #footer>
        <UButton
          label="Edit"
          icon="mdi:pencil"
          variant="subtle"
          color="neutral"
          @click="handleEditExpense"
        />
        <UButton
          label="Delete"
          icon="mdi:trash"
          variant="subtle"
          color="error"
          @click="handleDeleteExpense"
        />
      </template>
    </UPageCard>
  </div>
</template>
