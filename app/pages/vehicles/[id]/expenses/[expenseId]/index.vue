<script setup lang="ts">
import VehicleExpenseDialog from "~/components/vehicle/expense/dialog/VehicleExpenseDialog.vue";

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

const { data: vehicle } = useVehicle(vehicleId);

const { data: profiles } = useProfiles();

const overlay = useOverlay();
const toast = useToast();
const confirm = useConfirmDialog();

const vehicleExpenseDialog = overlay.create(VehicleExpenseDialog);

/** TODO: remove & move to fetching of expense instead */
const createdBy = computed(() => {
  return profiles.value?.find(
    ({ user_id }) => user_id === expense.value?.createdby_id,
  );
});

const handleEditExpense = () => {
  if (!vehicleId.value) return;

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

const formatDistance = (distance: number | null) =>
  formatNumber(distance || 0, {
    style: "unit",
    unit: vehicle.value?.mileage_unit || "kilometer",
    compactDisplay: "short",
    useGrouping: true,
  });

const formatAmount = (amount?: number | null) =>
  formatNumber(amount || 0, {
    style: "unit",
    unit: expense.value?.unit || "liter",
    unitDisplay: "short",
    compactDisplay: "short",
  });

const formatCurrency = (cost?: number | null) =>
  formatNumber(cost || 0, {
    style: "currency",
    currency: expense.value?.currency || "EUR",
    currencyDisplay: "narrowSymbol",
    compactDisplay: "short",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
</script>

<template>
  <UContainer class="flex-1 px-0">
    <ULink
      :to="{
        name: 'vehicles-id-expenses',
        params: { id: vehicleId },
      }"
      class="inline-flex items-center"
    >
      <UIcon name="mdi:chevron-left" class="size-5" />
      Back to Expenses
    </ULink>

    <span v-if="error">{{ error }}</span>

    <LazyVehicleExpenseSkeleton v-else-if="loading" />

    <UCard
      v-else-if="expense"
      :title="expense.type || ''"
      :ui="{
        description: 'flex gap-2 items-center',
        footer: 'flex gap-2',
      }"
    >
      <template #description>
        <NuxtTime
          :datetime="expense.date"
          dateStyle="long"
          :relative="addToDate(new Date(), -7, 'day') < new Date(expense.date)"
        />

        <div
          class="size-1 bg-current rounded-full inline-block leading-none"
        ></div>

        <UUser
          v-if="createdBy"
          :avatar="{
            src: createdBy.profile_image_url || '',
            loading: 'lazy',
          }"
          :name="createdBy.name || ''"
          :to="{
            name: 'profiles-profileId',
            params: { profileId: createdBy.id },
          }"
          size="xs"
        />
      </template>

      <UPageGrid :ui="{ base: 'grid-cols-2 gap-4 lg:gap-8' }">
        <UPageCard
          title="Mileage"
          :description="formatDistance(expense.mileage)"
          variant="subtle"
          :ui="{
            container: 'p-2 sm:p-4',
            title: 'text-xs font-normal text-muted',
            description: 'text-highlighted font-semibold',
          }"
        />

        <UPageCard
          :title="
            pluralize(expense.amount || 0, expense.unit || 'Liter', 's', false)
          "
          :description="formatAmount(expense.amount)"
          variant="subtle"
          :ui="{
            container: 'p-2 sm:p-4',
            title: 'text-xs font-normal text-muted capitalize',
            description: 'text-highlighted font-semibold',
          }"
        />

        <UPageCard
          title="Cost"
          :description="formatCurrency(expense.cost)"
          variant="subtle"
          :ui="{
            container: 'p-2 sm:p-4',
            title: 'text-xs font-normal text-muted',
            description: 'text-highlighted font-semibold',
          }"
        />

        <UPageCard
          :title="`Per ${expense.unit || 'liter'}`"
          :description="formatCurrency(expense.price_per_unit)"
          variant="subtle"
          :ui="{
            container: 'p-2 sm:p-4',
            title: 'text-xs font-normal text-muted',
            description: 'text-highlighted font-semibold',
          }"
        />
      </UPageGrid>

      <template #footer>
        <UButton
          label="Edit"
          icon="mdi:pencil"
          variant="soft"
          block
          @click="handleEditExpense"
        />
        <UButton
          label="Delete"
          icon="mdi:trash"
          color="error"
          variant="soft"
          block
          @click="handleDeleteExpense"
        />
      </template>
    </UCard>
  </UContainer>
</template>
