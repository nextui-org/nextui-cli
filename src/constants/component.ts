import {getComponents} from 'src/scripts/helpers';

export const nextUIComponents = (await getComponents()).components;

export const orderNextUIComponentKeys = ['package', 'version', 'status', 'docs'] as const;

export const colorNextUIComponentKeys = ['package', 'version', 'status'];

export type NextUIComponentStatus = 'stable' | 'updated' | 'newPost';

type NextUIComponent = (typeof nextUIComponents)[0];

export type NextUIComponents = (Omit<NextUIComponent, 'status'> & {
  status: NextUIComponentStatus;
})[];
