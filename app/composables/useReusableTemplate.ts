import {
  defineComponent,
  h,
  shallowRef,
  type ComponentObjectPropsOptions,
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

export interface ReusableTemplateOptions<Props extends Record<string, any>> {
  /**
   * Whether to inherit attributes when reusing the template.
   * @default true
   */
  inheritAttrs?: boolean;
  /**
   * Props definition for reuse component.
   */
  props?: ComponentObjectPropsOptions<Props>;
}

export function useReusableTemplate<
  Bindings extends Record<string, any>,
  MapSlotNameToSlotProps extends Record<
    string,
    Record<string, any> | undefined
  > = Record<"default", undefined>,
  Props extends Record<string, any> = Record<string, any>
>(options: ReusableTemplateOptions<Bindings> = {}) {
  const { inheritAttrs = true } = options;

  const renderFn = shallowRef<Slot | undefined>();

  const DefineTemplate = defineComponent({
    setup(_, { slots }) {
      return () => {
        renderFn.value = slots.default;
      };
    },
  }) as unknown as DefineTemplateComponent<Bindings, MapSlotNameToSlotProps>;

  const ReuseTemplate = defineComponent<Props>({
    inheritAttrs,
    props: options.props,
    setup(props, { attrs, slots }) {
      return () => {
        if (!renderFn.value) {
          throw new Error("Failed to get definition of template");
        }

        const node = renderFn.value({
          ...((options.props == null ? attrs : props) as Props),
          $slots: slots,
        });

        return inheritAttrs && node?.length === 1 ? node[0] : node;
      };
    },
  }) as unknown as ReuseTemplateComponent<Bindings, MapSlotNameToSlotProps>;

  return [DefineTemplate, ReuseTemplate] as const;
}
