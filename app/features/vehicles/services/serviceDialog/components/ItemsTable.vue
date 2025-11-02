<script setup lang="ts">
import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

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
    <table class="table table-xs">
      <thead>
        <tr>
          <th>Description</th>
          <th>Cost</th>
          <th>Quantity</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-if="service">
        <tr v-for="(item, index) in serviceItems" :key="index">
          <td class="py-0">
            <FormInput
              type="text"
              size="sm"
              v-model="item.description"
              placeholder="Item title"
            />
          </td>
          <td class="py-0">
            <FormInput type="number" size="sm" v-model="item.cost" :min="0" />
          </td>
          <td class="py-0">
            <FormInput
              type="number"
              size="sm"
              v-model="item.quantity"
              :min="0"
            />
          </td>
          <td class="py-0 max-w-fit">
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
          <td colspan="4" class="text-center">No items found</td>
        </tr>
        <tr>
          <td colspan="4" class="text-center">
            <button
              type="button"
              class="btn btn-secondary btn-soft btn-sm"
              @click="handleAddItem"
            >
              <Icon name="mdi:plus" size="1.2em" />
              Add Item
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Sum:</th>
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
        </tr>
      </tfoot>
    </table>
  </div>
</template>
