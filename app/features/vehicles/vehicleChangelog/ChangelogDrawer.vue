<script setup lang="ts">
import Drawer from "~/components/Drawer.vue";
import type { Database, Tables } from "~/types/supabase";
import { useVehicleChangelog } from "./useVehicleChangelog";
import ChangelogListItemPlaceholder from "./components/ChangelogListItemPlaceholder.vue";
import ChangelogListItem from "./components/ChangelogListItem.vue";
import ChangelogList from "./components/ChangelogList.vue";

const props = defineProps<{ vehicleId: number }>();

const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);

const { data: changelog, pending: loading } = useVehicleChangelog(
  props.vehicleId,
);

type TableNames = keyof Database[Extract<keyof Database, "public">]["Tables"];

const generateChangelogSentence = (entry: Tables<"changelog_with_profile">) => {
  const { table_name, operation, changes, createdby_name } = entry;
  if (!table_name) return "";

  const { new: newChanges = {}, old: oldChanges = {} } = changes as {
    new: Record<string, string>;
    old: Record<string, string>;
  };

  const changedValues = calculateJsonChanges(oldChanges, newChanges);

  const tableSentenceMappings: {
    [key in Exclude<
      TableNames,
      | "Changelog"
      | "Roles"
      | "Profiles"
      | "RolesPermissions"
      | "VehicleManufacturers"
    >]: {
      INSERT?: string;
      UPDATE?: string;
      DELETE?: string;
    };
  } = {
    Vehicles: {
      INSERT: `Created a new vehicle`,
      UPDATE: `Updated vehicle`,
      DELETE: `Deleted a vehicle`,
    },
    VehicleShares: {
      INSERT: `Shared vehicle`,
      UPDATE: `Updated share status`,
      DELETE: `Unshared vehicle`,
    },
    VehicleExpenses: {
      INSERT: `Added an expense`,
      UPDATE: `Updated an expense`,
      DELETE: `Deleted an expense`,
    },
    VehicleServiceLogs: {
      INSERT: `Added a service`,
      UPDATE: `Updated a service`,
      DELETE: `Deleted a service`,
    },
    VehicleServiceLogsItems: {
      INSERT: `Added a service item`,
      UPDATE: `Updated a service item`,
      DELETE: `Deleted a service item`,
    },
    VehicleDocuments: {
      INSERT: `added file '{{ nn }}'`,
      UPDATE: `Changed file '{{ on }}' to '{{ nn }}'`,
      DELETE: `deleted file '{{ on }}'`,
    },
  };

  const getAction = () => {
    const operation = entry.operation as
      | "INSERT"
      | "UPDATE"
      | "DELETE"
      | undefined;

    if (!operation || !(table_name in tableSentenceMappings))
      return "Unknown action";
    const mapping =
      tableSentenceMappings[table_name as keyof typeof tableSentenceMappings][
        operation
      ];

    if (!mapping) return `${operation?.toLowerCase()} an entry`;
    const vehicle_id = newChanges?.["vehicle_id"] || oldChanges?.["vehicle_id"];

    let formattedMapping = mapping.replace(
      /\{\{\s*on\s*\}\}/g,
      oldChanges?.["name"] || "",
    );

    if (newChanges) {
      formattedMapping = formattedMapping = mapping
        .replace(/\{\{\s*on\s*\}\}/g, oldChanges?.["name"] || "")
        .replace(/\{\{\s*nn\s*\}\}/g, newChanges?.["name"] || "")
        .replace(
          "expense",
          `<a href="/vehicles/${vehicle_id}/expenses/${newChanges["id"]}" class="font-semibold text-base-content text-nowrap link">Expense</a>`,
        )
        .replace(
          "service",
          `<a href="/vehicles/${vehicle_id}/services/${newChanges["id"]}" class="font-semibold text-base-content text-nowrap link">Service</a>`,
        );
    }

    return formattedMapping;
  };

  const getSentence = () => {
    if (operation === "UPDATE" && changedValues.length > 0) {
      return `Changed ${changedValues
        .map(
          ({ field, oldValue, newValue }) =>
            `<code>${field}</code> ${
              oldValue ? `from '${oldValue}' ` : ""
            }to '${newValue}'`,
        )
        .join(", ")}`;
    }

    return "";
  };

  if (!operation) {
    return {
      action: `Unknown action performed by ${createdby_name}`,
      sentence: "",
    };
  }

  return {
    action: getAction(),
    sentence: getSentence(),
  };
};

const formattedChangelog = computed(() => {
  return changelog.value?.map((changelogEntry) => {
    const formattedText = generateChangelogSentence(changelogEntry);

    return {
      ...changelogEntry,
      ...formattedText,
    };
  });
});

const handleClose = () => {
  drawerRef.value?.close();
};

defineExpose({
  drawerRef: drawerRef,
});
</script>

<template>
  <Drawer ref="drawerRef" direction="left" title="Changelog" disableSwipe>
    <template #header>
      <h3 class="text-lg font-bold">Changelog</h3>
      <button
        class="btn btn-circle btn-sm btn-ghost ms-auto"
        formmethod="dialog"
        value="cancel"
        @click="handleClose"
      >
        ✕
      </button>
    </template>

    <template #body>
      <ChangelogList class="md:max-w-96">
        <template v-if="loading">
          <ChangelogListItemPlaceholder v-for="i in 10" :key="i" />
        </template>

        <ChangelogListItem
          v-for="(change, changelogIndex) in formattedChangelog"
          :key="changelogIndex"
          :avatar="change.createdby_profile_image_url"
          :actionBy="change.createdby_name || undefined"
          :time="change.created_at"
          :type="change.operation === 'UPDATE' ? 'comment' : 'default'"
          :action="change.action"
        >
          <div v-if="change.sentence" v-html="change.sentence"></div>
        </ChangelogListItem>
      </ChangelogList>
    </template>

    <template #footer="{ toggleDrawer }">
      <button
        @click="toggleDrawer(false, 'clickOutside')"
        class="btn btn-sm btn-outline"
      >
        Close
      </button>
    </template>
  </Drawer>
</template>
