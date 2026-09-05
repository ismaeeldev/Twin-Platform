import { Button } from "@/components/ui/button"
import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

const surfaceSwatches = [
  { name: "--bg-base", className: "bg-bg-base" },
  { name: "--bg-surface", className: "bg-bg-surface" },
  { name: "--bg-surface-2", className: "bg-bg-surface-2" },
  { name: "--bg-surface-3", className: "bg-bg-surface-3" },
  { name: "--border-subtle", className: "bg-border-subtle" },
  { name: "--border-strong", className: "bg-border-strong" },
]

const accentSwatches = [
  { name: "--accent-primary", className: "bg-accent-primary" },
  { name: "--accent-primary-hover", className: "bg-accent-primary-hover" },
  { name: "--accent-primary-active", className: "bg-accent-primary-active" },
  { name: "--accent-soft-bg", className: "bg-accent-soft-bg" },
]

const statusSwatches = [
  { name: "--status-approved", className: "bg-status-approved" },
  { name: "--status-rejected", className: "bg-status-rejected" },
  { name: "--status-escalated", className: "bg-status-escalated" },
  { name: "--status-pending", className: "bg-status-pending" },
]

const textSwatches = [
  { name: "--text-primary", className: "text-text-primary" },
  { name: "--text-secondary", className: "text-text-secondary" },
  { name: "--text-tertiary", className: "text-text-tertiary" },
]

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-md border border-border-subtle ${className}`} />
      <code className="text-micro text-text-tertiary">{name}</code>
    </div>
  )
}

export default function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex items-center justify-between">
          <h1 className="text-h1 text-text-primary">Theme Preview</h1>
          <ThemeToggle />
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-h2 text-text-primary">Surfaces &amp; Borders</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {surfaceSwatches.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-h2 text-text-primary">Accent — Electric Indigo</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {accentSwatches.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-h2 text-text-primary">Semantic Status Colors</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statusSwatches.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-h2 text-text-primary">Text Colors</h2>
          {textSwatches.map((s) => (
            <p key={s.name} className={`text-body ${s.className}`}>
              {s.name} — The quick brown fox jumps over the lazy dog.
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-h2 text-text-primary">Typography Scale</h2>
          <p className="text-display text-text-primary">Display / Hero</p>
          <p className="text-h1 text-text-primary">Heading 1</p>
          <p className="text-h2 text-text-primary">Heading 2</p>
          <p className="text-h3 text-text-primary">Heading 3</p>
          <p className="text-body-lg text-text-primary">Body Large — for intros and lead paragraphs.</p>
          <p className="text-body text-text-primary">Body — default UI copy at 1rem.</p>
          <p className="text-meta text-text-secondary">Small / Meta — timestamps, labels</p>
          <p className="text-micro text-text-tertiary">Micro / Badge Label</p>
          <p className="font-mono text-body text-text-primary">Geist Mono — task IDs, confidence scores, JSON</p>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-h2 text-text-primary">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="destructive-outline">Destructive Outline</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="default" size="sm">Small</Button>
            <Button variant="default" size="default">Default</Button>
            <Button variant="default" size="lg">Large</Button>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-h2 text-text-primary">Skeleton Shimmer</h2>
          <div className="flex flex-col gap-3">
            <SkeletonShimmer className="h-24 w-full" />
            <SkeletonShimmer className="h-4 w-2/3" />
            <SkeletonShimmer className="h-4 w-1/2" />
          </div>
        </section>
      </div>
    </main>
  )
}
