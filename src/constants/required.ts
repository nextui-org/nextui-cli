export const FRAMER_MOTION = 'framer-motion';
export const TAILWINDCSS = 'tailwindcss';
export const NEXT_UI = '@nextui-org/react';
export const THEME_UI = '@nextui-org/theme';
export const SYSTEM_UI = '@nextui-org/system';
export const ALL_COMPONENTS_REQUIRED = [NEXT_UI, FRAMER_MOTION] as const;

export const DOCS_INSTALLED = 'https://nextui.org/docs/guide/installation#global-installation';
export const DOCS_TAILWINDCSS_SETUP =
  'https://nextui.org/docs/guide/installation#tailwind-css-setup';
export const DOCS_APP_SETUP = 'https://nextui.org/docs/guide/installation#provider-setup';

// Record the required content of tailwind.config.js
export const tailwindRequired = {
  content: '@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  darkMode: 'darkMode: "class"',
  plugins: 'nextui()'
} as const;

export const appRequired = {
  import: 'NextUIProvider'
};
