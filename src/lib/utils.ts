import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * CRITICAL FIX: tailwind-merge's default config has no idea this project
 * defines its own type-scale utilities (globals.css `@utility text-*` —
 * ThemeGuideline.md Section 2) — it only recognizes Tailwind's own built-in
 * font-size class names. Because both a custom scale class (e.g.
 * `text-meta`) and a text-COLOR class (e.g. `text-text-secondary`) start
 * with the `text-` prefix, plain `twMerge` folds them into the same
 * conflict group and silently drops whichever came first — verified with a
 * direct repro: `twMerge("text-meta text-text-secondary")` returns just
 * `"text-text-secondary"`, discarding the font size entirely. Since nearly
 * every text element in the app passes both a custom scale class and a
 * color class through `cn()`, this was silently stripping the intended
 * font-size/weight/line-height from most of the UI's text, everywhere,
 * this whole time — falling back to the browser's unstyled default instead
 * of ThemeGuideline's actual type scale. Fixed by registering the custom
 * scale classes as their own font-size class group so tailwind-merge knows
 * they don't conflict with color utilities.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-body-lg",
        "text-body",
        "text-meta",
        "text-micro",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
