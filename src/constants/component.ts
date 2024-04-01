import _nextUIComponents from './components.json';

// Don't change manually, use update:components script to update
export const nextUIComponents = _nextUIComponents;

export const orderNextUIComponentKeys = ['package', 'version', 'status', 'docs'] as const;

export const colorNextUIComponentKeys = ['package', 'version', 'status'];

export type NextUIComponentStatus = 'stable' | 'updated' | 'newPost';

type NextUIComponent = (typeof nextUIComponents)[0];

export type NextUIComponents = (Omit<NextUIComponent, 'status'> & {
  status: NextUIComponentStatus;
})[];
