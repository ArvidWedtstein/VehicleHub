<script setup lang="ts">
import type { Database, Tables } from "~/types/supabase";
import { useVehicleChangelog } from "./useVehicleChangelog";

const props = defineProps<{ vehicleId: number }>();

const open = ref(false);

const {
  data: changelog,
  pending: loading,
  refresh,
} = useVehicleChangelog(props.vehicleId);

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
  open.value = false;
};

defineExpose({
  open: () => (open.value = true),
  close: handleClose,
});
</script>

<template>
  <UDrawer
    direction="left"
    title="Changelog"
    v-model:open="open"
    :snapPoints="[0.3, 0.5]"
  >
    <template #body>
      <UChangelogVersions
        :indicator="false"
        :versions="
          formattedChangelog.map((change) => ({
            author: {
              name: change.createdby_name || 'N/A',
              avatar: {
                loading: 'lazy' as const,
                src: change.createdby_profile_image_url || '',
                alt: change.createdby_name || 'N/A',
              },
            },

            title: change.action,
            description: change.sentence,
            date: change.created_at || '',
            ui: {
              container: 'max-w-lg me-0',
            },
          }))
        "
      >
        <template #title="{ version }">
          <div class="capitalize" v-html="version.title"></div>
        </template>
        <template #description="{ version }">
          <div v-html="version.description"></div>
        </template>
        <template #footer="{ version }">
          <UUser v-bind="version.author" />
        </template>
      </UChangelogVersions>

      <UEmpty
        v-if="!formattedChangelog.length || loading"
        :title="loading ? 'Loading' : 'No Changes found'"
        :actions="[
          {
            label: 'Refresh',
            icon: 'mdi:refresh',
            loadingAuto: true,
            onClick: () => refresh(),
          },
        ]"
      />
    </template>

    <template #footer>
      <UButton
        label="Close"
        variant="outline"
        block
        size="sm"
        @click="handleClose"
      />
    </template>
  </UDrawer>
</template>
