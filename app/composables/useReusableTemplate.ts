import {
  defineComponent,
  h,
  shallowRef,
  type DefineComponent,
  type Slot,
  type Slots,
  type VNodeChild,
} from "vue";

type SlotsFromSlotMap<
  T extends Record<string, Record<string, any> | undefined>
> = {
  [K in keyof T]: Slot<T[K]>;
};

type DefineTemplateComponent<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends Record<string, Record<string, any> | undefined>
> = DefineComponent & {
  new (): {
    $slots: {
      default: (
        _: Bindings & {
          $slots: SlotsFromSlotMap<MapSlotNameToSlotProps>;
        }
      ) => any;
    };
  };
};

type ReuseTemplateComponent<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends Record<string, Record<string, any> | undefined>
> = DefineComponent<Bindings> & {
  new (): { $slots: SlotsFromSlotMap<MapSlotNameToSlotProps> };
};

export function useReusableTemplate<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends Record<
    string,
    Record<string, any> | undefined
  > = Record<"default", undefined>,
  Props extends Record<string, any> = Record<string, any>
>() {
  const renderFn = shallowRef<
    ((props: Props, slots: Slots) => VNodeChild) | null
  >(null);

  const DefineTemplate = defineComponent({
    name: "DefineTemplate",
    setup(_, { slots }) {
      renderFn.value = (props: Props, _slots: Slots) => {
        return slots.default?.(props) ?? null;
      };
      return () => null;
    },
  }) as unknown as DefineTemplateComponent<Bindings, MapSlotNameToSlotProps>;

  const ReuseTemplate = defineComponent<Props>({
    name: "ReuseTemplate",
    setup(props, { slots }) {
      return () =>
        renderFn.value
          ? renderFn.value(props as Props, slots)
          : h("div", "⚠️ No template defined");
    },
  }) as unknown as ReuseTemplateComponent<Bindings, MapSlotNameToSlotProps>;

  return [DefineTemplate, ReuseTemplate] as const;
}
