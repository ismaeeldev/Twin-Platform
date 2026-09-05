import { cva } from "class-variance-authority"

/**
 * Pure style variants, split out of button.tsx so Server Components can
 * import buttonVariants() (e.g. to style a <Link> as a button) without
 * pulling in button.tsx's "use client" boundary (which is required there
 * because that file also renders framer-motion's motion.button).
 *
 * ThemeGuideline.md Section 4.1 — Buttons.
 */
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover hover:shadow-[0_4px_24px_var(--accent-glow)] active:bg-accent-primary-active",
        secondary:
          "bg-bg-surface-2 text-text-primary border-border-subtle hover:border-border-strong hover:bg-bg-surface-3",
        ghost:
          "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary",
        destructive:
          "bg-status-rejected text-text-on-accent hover:brightness-110 active:brightness-95",
        "destructive-outline":
          "border-status-rejected text-status-rejected bg-transparent hover:bg-status-rejected-bg",
        link: "text-accent-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        // ThemeGuideline.md Section 7 — 44px minimum touch target below `md`
        // (mouse-precision breakpoint), shrinking to the tighter visual size
        // at `md`+ where a pointer doesn't need the extra hit area.
        sm: "h-11 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5 md:h-9",
        lg: "h-11 gap-1.5 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-sm": "size-11 rounded-[min(var(--radius-md),12px)] md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
