import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import type { AvatarProps } from "../AvatarImage.vue";

export type CommandPaletteProps<T extends readonly CommandPaletteGroup[]> = {
  disabled?: boolean;

  /**
   * Icon displayed on search
   */
  icon?: string;
  /**
   * Icon displayed when an item is selected
   */
  selectedIcon?: string;

  /** Indicates loading... */
  loading?: boolean;
  loadingIcon?: string;

  /** Displays a close button in the right top */
  closeButton?: boolean;
  /** Icon for the close button */
  closeIcon?: string;

  /** Automatically focuses the input when mounted */
  autofocus?: boolean;

  groups: T;
  labelKey?: string;

  placeholder?: string;

  multiple?: boolean;
};

export type CommandPaletteGroup = {
  id: string;

  /**
   * Label of the group
   */
  label?: string;
  items?: readonly CommandPaletteItem[];

  /** Allows for filtering items after search */
  postFilter?: (
    searchTerm: string,
    items: readonly CommandPaletteItem[]
  ) => readonly CommandPaletteItem[];

  /** Group will not be affected by searching  */
  ignoreFilter?: boolean;
} & {
  [key: string]: unknown;
};

export type CommandPaletteItem = {
  label?: string;

  href?: "_self" | "_blank" | "_parent" | "_top";
  to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;

  prefix?: string;
  suffix?: string;

  loading?: boolean;

  /**
   * Bootstrap icon class
   */
  icon?: string;
  class?: string;

  avatar?: AvatarProps;

  disabled?: boolean;

  kbds?: string[];

  onSelect?: (item: CommandPaletteItem) => void;

  /** Creates a slot for this item */
  slot?: string;
} & {
  [key: string]: unknown;
};

export type ExtractSlotNames<T extends readonly CommandPaletteGroup[]> =
  NonNullable<NonNullable<T[number]["items"]>[number]>["slot"];

type DynamicSlotKeys<T extends readonly CommandPaletteGroup[]> =
  | "item"
  | "itemLabel"
  | "itemTrailing"
  | "itemLeading"
  | NonNullable<ExtractSlotNames<T>>
  | `${NonNullable<ExtractSlotNames<T>>}Label`
  | `${NonNullable<ExtractSlotNames<T>>}Trailing`
  | `${NonNullable<ExtractSlotNames<T>>}Leading`;

export type Slots<
  T extends readonly CommandPaletteGroup[],
  ExtraSlots extends string = never
> = {
  // Dynamic item-related slots
  [K in DynamicSlotKeys<T>]?: (props: { item: CommandPaletteItem }) => unknown;
} & {
  [K in ExtraSlots]?: () => unknown;
};
