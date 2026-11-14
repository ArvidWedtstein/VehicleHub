<script setup lang="ts">
import VehicleExpenseDialog from "~/components/vehicle/expense/dialog/VehicleExpenseDialog.vue";
import type { Database } from "~/types/supabase";
import type { QueryData } from "@supabase/supabase-js";

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

const vehicleId = useRouteParam("id", { type: "number", required: true });
const expenseId = useRouteParam("expenseId", {
  type: "number",
  required: true,
});

const {
  data: expense,
  pending: loading,
  error,
} = useVehicleExpense(vehicleId, expenseId);

const { data: stats } = useExpenseStats(expenseId);

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

const formatDistance = (distance: number | null, opts?: FormatNumberOptions) =>
  formatNumber(distance || 0, {
    style: "unit",
    unit: vehicle.value?.mileage_unit || "kilometer",
    compactDisplay: "short",
    useGrouping: true,
    ...opts,
  });

const formatAmount = (amount?: number | null, opts?: FormatNumberOptions) =>
  formatNumber(amount || 0, {
    style: "unit",
    unit: expense.value?.unit || "liter",
    unitDisplay: "short",
    compactDisplay: "short",
    ...opts,
  });

const formatCurrency = (cost?: number | null, opts?: FormatNumberOptions) =>
  formatNumber(cost || 0, {
    style: "currency",
    currency:
      stats.value?.reporting_currency || expense.value?.currency || "EUR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...opts,
  });

const pct = (v: number | null) =>
  v == null ? null : `${v > 0 ? "+" : ""}${v}%`;

const cardClass = {
  container: "p-2 sm:p-4",
  title: "text-xs font-normal text-muted capitalize",
  description: "text-highlighted font-semibold",
};
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
          :ui="cardClass"
        >
          <small v-if="stats?.prev_mileage">
            Previous {{ formatDistance(stats.prev_mileage) }}
          </small>
        </UPageCard>

        <UPageCard
          :title="
            pluralize(expense.amount || 0, expense.unit || 'Liter', 's', false)
          "
          icon="mdi:water-circle"
          :description="formatAmount(expense.amount)"
          variant="subtle"
          :ui="cardClass"
        >
          <template #default>
            <UProgress
              v-if="stats?.km_per_day"
              v-model="stats.km_per_day"
              :max="vehicle?.fuel_capacity || 100"
              size="sm"
              status
              :ui="{ status: 'w-full justify-between' }"
            >
              <template #status="{ percent }">
                <p>{{ percent }}% of tank</p>
                <p>{{ formatAmount(vehicle?.fuel_capacity || 0) }}</p>
              </template>
            </UProgress>
          </template>
        </UPageCard>

        <UPageCard
          v-if="stats?.price_per_l"
          :title="`Price per ${expense.unit || 'litre'}`"
          :description="formatCurrency(stats.price_per_l, { per: 'L' })"
          icon="mdi:tag-outline"
          variant="subtle"
          :ui="cardClass"
        >
          <template #footer>
            <small
              v-if="stats?.price_vs_avg_pct != null"
              class="text-muted"
              :class="{
                'text-warning': stats.price_vs_avg_pct > 5,
                'text-error': stats.price_vs_avg_pct > 10,
              }"
            >
              {{ pct(stats.price_vs_avg_pct) }} above average
            </small>

            <UBadge
              v-if="stats?.cheapest_so_far"
              color="success"
              variant="subtle"
              label="Cheapest so far"
            />
          </template>
        </UPageCard>

        <UPageCard
          title="Cost"
          :description="formatCurrency(expense.cost)"
          variant="subtle"
          :ui="cardClass"
        />

        <UPageCard
          v-if="stats?.km_since_prev"
          title="Since last fill-up"
          :description="formatDistance(stats.km_since_prev)"
          icon="mdi:road-variant"
          variant="subtle"
          :ui="cardClass"
        >
          <span v-if="stats?.days_since_prev">{{
            `${stats?.days_since_prev} days - ${formatDistance(stats.km_per_day, { per: "day" })}`
          }}</span>
        </UPageCard>

        <UPageCard
          v-if="stats?.l_per_100km"
          title="Consumption"
          :description="`${formatAmount(stats?.l_per_100km, { per: '100 km' })}`"
          icon="mdi:drop-outline"
          variant="subtle"
          :ui="cardClass"
        >
          <template #footer>
            <span
              v-if="stats?.consumption_vs_avg_pct != null"
              class="text-muted"
            >
              ({{ pct(stats.consumption_vs_avg_pct) }} vs avg)
            </span>
          </template>
        </UPageCard>

        <UPageCard
          v-if="stats?.cost_per_km"
          title="Cost per km"
          :description="`${formatCurrency(stats.cost_per_km, { per: 'km' })}`"
          icon="mdi:coin-outline"
          variant="subtle"
          :ui="cardClass"
        />

        <UPageCard
          v-if="expense.location || expense.latitude || expense.longitude"
          title="Location"
          :description="
            expense.location || `${expense.latitude}, ${expense.longitude}`
          "
          icon="mdi:map-marker-outline"
          variant="subtle"
          :ui="cardClass"
          :to="`https://www.openstreetmap.org/#map=19/${expense.latitude}/${expense.longitude}`"
          target="_blank"
        />

        <UPageCard
          v-if="expense?.notes"
          title="Notes"
          :description="expense.notes"
          icon="mdi:note-outline"
          variant="subtle"
          :ui="cardClass"
        />

        <UAlert
          v-if="stats?.bad_mileage"
          color="warning"
          variant="subtle"
          class="mt-3"
          title="Odometer is not higher than the previous reading"
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
          @click="handleDeleteExpense"
        />
      </template>
    </UCard>
  </UContainer>
</template>
