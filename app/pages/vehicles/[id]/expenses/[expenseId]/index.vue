<script setup lang="ts">
import { useProfiles } from "~/features/profiles/useProfiles";
import {
  deleteVehicleExpense,
  useVehicleExpense,
} from "~/features/vehicles/expenses/useVehicleExpenses";

useHead({
  title: "Expense",
});

definePageMeta({
  middleware: "auth",

  validate: async (route) => {
    return typeof route.params.id === "string" && /^\d+$/.test(route.params.id);
  },
  layout: "vehicle",
});

const ExpenseDialog = defineAsyncComponent(
  async () =>
    await import("~/features/vehicles/expenses/expenseDialog/ExpenseDialog.vue")
);

const vehicleId = useRouteParam("id", "number");
const expenseId = useRouteParam("expenseId", "number");

const {
  data: expense,
  pending: loading,
  error,
} = await useVehicleExpense(vehicleId, expenseId);

const { data: profiles } = await useProfiles();

const expenseDialog = ref<InstanceType<typeof ExpenseDialog>>();

/** TODO: remove & move to fetching of expense instead */
const createdBy = computed(() => {
  return profiles.value?.find(
    ({ user_id }) => user_id === expense.value?.createdby_id
  );
});

const handleEditExpense = () => {
  if (!vehicleId.value) return;

  expenseDialog.value?.open(vehicleId.value, expense.value?.id);
};

const handleExpenseDelete = async () => {
  if (!vehicleId.value) return;
  if (!expense.value) return;

  const res = await useConfirm({
    title: "Delete Expense?",
    message:
      "Are you sure you want to delete this expense? This cannot be undone.",
    confirmLabel: "Delete",
    severity: "danger",
  });

  if (!res) return;

  await deleteVehicleExpense(vehicleId.value, expense.value.id);

  toast.success("Successfully deleted expense");

  navigateTo({
    name: "vehicles-id-expenses",
    params: { id: vehicleId.value },
  });
};
</script>

<template>
  <div>
    <NuxtLink
      :to="{
        name: 'vehicles-id-expenses',
        params: { id: vehicleId },
      }"
      class="link link-hover flex items-center gap-2 mb-2"
    >
      <Icon name="mdi:chevron-left" />
      Back to Expenses
    </NuxtLink>

    <span v-if="error">{{ error }}</span>
    <span v-else-if="loading">loading</span>

    <!-- <SkeletonLoader v-if="loading" /> -->

    <div
      v-else-if="expense"
      :key="expense?.id"
      class="card card-sm md:card-normal bg-base-100 md:w-96 shadow-xl"
    >
      <div class="card-body">
        <h2 class="card-title">{{ expense.type }}</h2>

        <ul class="flex flex-col gap-1 text-sm">
          <li class="inline-flex gap-2 items-center">
            <AvatarImage
              :src="createdBy?.profile_image_url"
              :alt="createdBy?.name"
              :fallbackSrc="`https://ui-avatars.com/api/?name=${
                createdBy?.name || 'Unknown User'
              }`"
              size="xxs"
            />

            <NuxtLink
              :to="{
                name: 'profiles-profileId',
                params: { profileId: createdBy?.id },
              }"
              class="link link-hover"
            >
              {{ createdBy?.name }}
            </NuxtLink>
          </li>
          <li class="inline-flex gap-2 items-center">
            <span class="font-semibold">Date:</span>
            <NuxtTime
              :datetime="expense.date"
              dateStyle="medium"
              timeStyle="short"
            />
          </li>
          <li class="inline-flex gap-2 items-center">
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
          </li>
          <li class="inline-flex gap-2 items-center">
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
          </li>
          <li class="inline-flex gap-2 items-center">
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
          </li>
          <li class="inline-flex gap-2 items-center">
            <span class="font-semibold">
              Price per
              {{ expense.unit || "liter" }}:
            </span>
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
          </li>
        </ul>

        <div class="divider my-0 font-semibold text-sm">Notes:</div>

        <p class="capitalize text-sm mb-2">{{ expense.notes }}</p>

        <div class="card-actions justify-between">
          <button type="button" class="btn btn-sm" @click="handleEditExpense">
            <Icon name="mdi:pencil" />
            Edit
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline btn-error"
            @click="handleExpenseDelete"
          >
            <Icon name="mdi:trash" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
