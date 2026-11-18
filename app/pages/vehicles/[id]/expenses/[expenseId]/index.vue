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

const overlay = useOverlay();
const toast = useToast();
const confirm = useConfirmDialog();

const vehicleExpenseDialog = overlay.create(VehicleExpenseDialog);

const { data: createdBy } = useProfile(expense.value?.createdby_id);

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

const formatCurrency = (
  cost?: number | null,
  opts?: FormatNumberOptions,
  currency?: string,
) =>
  formatNumber(cost || 0, {
    style: "currency",
    currency:
      currency ||
      stats.value?.reporting_currency ||
      expense.value?.currency ||
      "EUR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...opts,
  });

const cardClass = {
  container: "p-2 sm:p-4 gap-y-2",
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
      :ui="{
        footer: 'flex gap-2',
        header: 'flex gap-2 justify-between items-center',
      }"
    >
      <template #header>
        <div class="">
          <div class="text-highlighted font-semibold">
            {{ expense.type }}
          </div>

          <div class="mt-1 text-muted text-sm flex gap-2 items-center">
            <NuxtTime
              :datetime="expense.date"
              dateStyle="long"
              :relative="
                addToDate(new Date(), -7, 'day') < new Date(expense.date)
              "
              class="shrink-0"
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
              class="shrink-0"
            />
          </div>
        </div>

        <UAlert
          v-if="stats?.bad_mileage"
          color="warning"
          variant="subtle"
          icon="mdi:exclamation"
          title="Odometer is not higher than the previous reading"
          class="w-auto"
        />

        <p class="text-xl">{{ formatCurrency(stats?.cost_reporting) }}</p>
      </template>

      <UPageGrid :ui="{ base: 'grid-cols-2 gap-4 lg:gap-8' }">
        <UPageCard
          title="Mileage"
          icon="mdi:car-speed-limiter"
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
              v-if="expense.amount"
              v-model="expense.amount"
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
          v-if="stats?.price_per_unit"
          :title="`Price per ${expense.unit || 'litre'}`"
          :description="formatCurrency(stats.price_per_unit, { per: 'L' })"
          icon="mdi:tag-outline"
          variant="subtle"
          :ui="cardClass"
        >
          <template #footer>
            <UTooltip
              v-if="stats?.price_vs_avg_pct != null"
              :text="`${formatCurrency(stats.avg_price_before, { per: 'L' })} before`"
            >
              <small
                class="text-muted"
                :class="{
                  'text-warning': stats.price_vs_avg_pct > 5,
                  'text-error': stats.price_vs_avg_pct > 10,
                }"
              >
                <UIcon
                  :name="
                    stats.price_vs_avg_pct > 0
                      ? 'mdi:trending-up'
                      : 'mdi:trending-down'
                  "
                />
                {{
                  `${stats.price_vs_avg_pct}% ${stats.price_vs_avg_pct > 0 ? "above" : "below"} average`
                }}
              </small>
            </UTooltip>

            <UBadge
              v-if="stats?.cheapest_so_far"
              color="success"
              variant="subtle"
              label="Cheapest so far"
            />
          </template>
        </UPageCard>

        <UPageCard
          v-if="stats?.distance_since_prev"
          title="Since last fill-up"
          :description="formatDistance(stats.distance_since_prev)"
          icon="mdi:road-variant"
          variant="subtle"
          :ui="cardClass"
        >
          <div class="flex flex-row items-center gap-2">
            <span v-if="stats?.days_since_prev">{{
              `${stats?.days_since_prev} days`
            }}</span>

            <template v-if="stats.distance_per_day">
              <span
                class="size-1 bg-current rounded-full inline-block leading-none"
              ></span>
              <span>{{
                formatDistance(stats.distance_per_day, { per: "day" })
              }}</span>
            </template>
          </div>
        </UPageCard>

        <UPageCard
          v-if="stats?.fuel_per_100"
          title="Consumption"
          :description="`${formatAmount(stats?.fuel_per_100, { per: formatDistance(100) })}`"
          icon="mdi:drop-outline"
          variant="subtle"
          :ui="cardClass"
        >
          <template #footer>
            <UTooltip
              v-if="stats?.consumption_vs_avg_pct != null"
              :text="`${formatAmount(stats?.avg_fuel_per_100_before, { per: formatDistance(100) })} before`"
            >
              <small class="text-muted">
                <UIcon
                  :name="
                    stats.consumption_vs_avg_pct > 0
                      ? 'mdi:trending-up'
                      : 'mdi:trending-down'
                  "
                />
                {{
                  `${stats.consumption_vs_avg_pct}% ${stats.consumption_vs_avg_pct > 0 ? "above" : "below"} average`
                }}
              </small>
            </UTooltip>
          </template>
        </UPageCard>

        <UPageCard
          v-if="stats?.cost_per_distance"
          :title="`Cost per ${formatDistance(0).replace('0', '')}`"
          :description="`${formatCurrency(stats.cost_per_distance, { per: formatDistance(0).replace('0', '') })}`"
          icon="mdi:coin-outline"
          variant="subtle"
          :ui="cardClass"
        >
          <template #footer>
            <small class="text-muted">Fuel Only</small>
          </template>
        </UPageCard>

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
          class="col-span-2"
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
