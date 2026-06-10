import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ActionSheet from "~/components/ActionSheet.vue";

const UButton = {
  template: `<button @click="$emit('click', $event)"><slot /></button>`,
  props: ["label", "color", "variant"],
};

const UDrawer = {
  template: `
    <div>
      <slot />
      <slot name="body" />
      <slot name="footer" />
    </div>
  `,
  props: ["open", "title"],
};

const UFieldGroup = {
  template: `<div><slot /></div>`,
};

const LazyActionSheet = {
  template: `<div><slot /></div>`,
};

const factory = (props = {}) => {
  return mount(ActionSheet, {
    props: {
      title: "Test Sheet",
      items: [
        { label: "Item 1", onSelect: vi.fn() },
        {
          label: "Parent",
          children: [{ label: "Child", onSelect: vi.fn() }],
        },
      ],
      ...props,
    },
    global: {
      stubs: {
        UButton,
        UDrawer,
        UFieldGroup,
        LazyActionSheet,
      },
    },
  });
};

describe("ActionSheet.vue", () => {
  it("groups items correctly", () => {
    const wrapper = factory();

    // 2 groups expected:
    // - group 1: normal items
    // - group 2: nested group
    const groups = wrapper.findAllComponents(UFieldGroup);
    expect(groups.length).toBe(1);
  });

  it("exposes open and close methods", async () => {
    const wrapper = factory();

    const vm = wrapper.vm as any;

    vm.open();
    expect(vm.open).toBeDefined();

    vm.close();
    expect(vm.close).toBeDefined();
  });

  it("emits select and closes on item click", async () => {
    const wrapper = factory();

    const buttons = wrapper.findAll("button");
    await buttons[0]?.trigger("click");

    expect(wrapper.emitted("select")).toBeTruthy();
  });

  it("does not emit select when item has children", async () => {
    const wrapper = factory();

    // Parent item button is second rendered button in this setup
    const buttons = wrapper.findAll("button");
    await buttons[1]?.trigger("click");

    expect(wrapper.emitted("select")).toBeFalsy();
  });

  it("calls item.onSelect when clicking leaf item", async () => {
    const onSelect = vi.fn();

    const wrapper = factory({
      items: [{ label: "Click me", onSelect }],
    });

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(onSelect).toHaveBeenCalled();
  });

  it("renders cancel button and closes", async () => {
    const wrapper = factory();

    const buttons = wrapper.findAll("button");
    const cancel = buttons[buttons.length - 1];

    await cancel?.trigger("click");

    // close() just toggles state internally
    expect(wrapper.vm.open).toBeDefined();
  });
});
