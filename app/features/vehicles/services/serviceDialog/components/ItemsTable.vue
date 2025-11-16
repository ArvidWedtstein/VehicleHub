<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

const props = withDefaults(
  defineProps<{
    allowEdit?: boolean;
  }>(),
  {
    allowEdit: true,
  }
);

const service = defineModel<
  TablesInsert<"VehicleServiceLogs"> | TablesUpdate<"VehicleServiceLogs">
>({ required: true });

const serviceItems = defineModel<
  | TablesInsert<"VehicleServiceLogsItems">[]
  | TablesUpdate<"VehicleServiceLogsItems">[]
>("serviceItems", { required: true });

const handleAddItem = () => {
  serviceItems.value.push({
    cost: 0,
    description: "",
    quantity: 1,
  } as TablesInsert<"VehicleServiceLogsItems">);
};

const handleRemoveItem = (index: number) => {
  serviceItems.value.splice(index, 1);
};
</script>

<template>
  <div
    class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
  >
    <table class="table table-sm table-pin-rows">
      <thead>
        <tr>
          <th width="30">
            <button
              v-if="allowEdit"
              type="button"
              class="btn btn-secondary btn-soft btn-xs btn-square"
              @click="handleAddItem"
            >
              <Icon name="mdi:plus" size="1.2em" />
            </button>
          </th>
          <th>Description</th>
          <th>Cost</th>
          <th>Quantity</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-if="service">
        <tr v-for="(item, index) in serviceItems" :key="index">
          <th width="30">{{ index + 1 }}</th>
          <td>
            <FormInput
              type="text"
              size="sm"
              v-model="item.description"
              :class="{ 'input-ghost': !allowEdit }"
              placeholder="Item title"
              :readonly="!allowEdit"
            />
          </td>
          <td>
            <FormInput
              type="number"
              size="xs"
              v-model="item.cost"
              :class="{ 'input-ghost': !allowEdit }"
              :min="0"
              :readonly="!allowEdit"
            />
          </td>
          <td>
            <FormInput
              type="number"
              size="sm"
              v-model="item.quantity"
              :class="{ 'input-ghost': !allowEdit }"
              :min="0"
              :readonly="!allowEdit"
            />
          </td>
          <td>
            <button
              type="button"
              class="btn btn-error btn-soft btn-sm btn-square"
              tabindex="-1"
              @click="handleRemoveItem(index)"
            >
              <Icon name="mdi:trash" size="1.2em" />
              <span class="sr-only">Remove Item</span>
            </button>
          </td>
        </tr>

        <tr v-if="serviceItems.length === 0">
          <td colspan="6" class="text-center">No items found</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2">Sum:</th>
          <td>
            {{
              formatNumber(sum(serviceItems || [], "cost"), {
                style: "currency",
                currency: service?.currency || "EUR",
                currencyDisplay: "narrowSymbol",
                compactDisplay: "short",
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
              })
            }}
          </td>
          <td>{{ sum(serviceItems || [], "quantity") }}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
