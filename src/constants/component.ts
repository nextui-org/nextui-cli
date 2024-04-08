import {getComponents} from 'src/scripts/helpers';

export const nextUIComponents = (await getComponents()).components;

export const nextUIComponentsKeys = nextUIComponents.map((component) => component.name);
export const nextUIcomponentsPackages = nextUIComponents.map((component) => component.package);

export const nextUIComponentsKeysSet = new Set(nextUIComponentsKeys);

export const nextUIComponentsMap = nextUIComponents.reduce(
  (acc, component) => {
    acc[component.name] = component;

    return acc;
  },
  {} as Record<string, (typeof nextUIComponents)[number]>
);

export const orderNextUIComponentKeys = ['package', 'version', 'status', 'docs'] as const;

export const colorNextUIComponentKeys = ['package', 'version', 'status'];

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextUIComponentStatus = 'stable' | 'updated' | 'new' | (string & {});

export type NextUIComponent = (typeof nextUIComponents)[0];

export type NextUIComponents = (Omit<NextUIComponent, 'status'> & {
  status: NextUIComponentStatus;
})[];
