import type { AvatarProps } from "~/components/AvatarImage.vue";

export interface UseInputIconsProps {
  /**
   * Display an icon based on the `leading` and `trailing` props.
   */
  icon?: string;

  avatar?: AvatarProps;
  /** Icon = left side */
  leading?: boolean;
  /**
   * Left side icon
   */
  leadingIcon?: string;
  /** Icon = right side. */
  trailing?: boolean;
  /**
   * Right side icon
   */
  trailingIcon?: string;
  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  loadingIcon?: string;
}

export const useInputIcons = (
  componentProps: MaybeRefOrGetter<UseInputIconsProps>,
) => {
  const defaultLoadingIcon = "loading loading-spinner loading-sm";
  const props = computed(() => toValue(componentProps));

  const isLeading = computed(
    () =>
      (props.value.icon && props.value.leading) ||
      (props.value.icon && !props.value.trailing) ||
      (props.value.loading && !props.value.trailing) ||
      !!props.value.leadingIcon,
  );

  const isTrailing = computed(
    () =>
      (props.value.icon && props.value.trailing) ||
      (props.value.loading && props.value.trailing) ||
      !!props.value.trailingIcon,
  );

  const leadingIconName = computed(() => {
    if (props.value.loading) {
      return props.value.loadingIcon || defaultLoadingIcon;
    }

    return props.value.leadingIcon || props.value.icon;
  });

  const trailingIconName = computed(() => {
    if (props.value.loading && !isLeading.value) {
      return props.value.loadingIcon || defaultLoadingIcon;
    }

    return props.value.trailingIcon || props.value.icon;
  });

  return {
    isLeading,
    isTrailing,
    leadingIconName,
    trailingIconName,
  };
};
