import { View, type ViewProps } from "react-native";

/**
 * Primary content-card surface: soft shadow in light mode, hairline border in dark
 * mode (shadows barely read on dark backgrounds). Use for every card-shaped
 * container instead of restyling `bg-white dark:bg-neutral-900` inline.
 */
export function Card({
  className = "",
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-card border border-border bg-card shadow-sm shadow-black/5 dark:shadow-none ${className}`}
      {...props}
    />
  );
}
