import { Cpu, Keyboard, MousePointer2, Router } from "lucide-react";

export function AuthSidePanel(): React.ReactElement {
  return (
    <aside className="relative hidden overflow-hidden rounded-[2rem] bg-[var(--brand-teal)] p-8 text-[var(--brand-blush)] lg:block">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 size-80 rounded-full bg-[var(--brand-aqua)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-28 size-80 rounded-full bg-[var(--brand-red)]/30 blur-3xl"
      />

      <div className="relative z-10 flex min-h-[42rem] flex-col justify-between">
        <div>
          <p className="eyebrow text-[var(--brand-aqua)]">
            PeripheralsTalk
          </p>

          <h2 className="mt-6 max-w-md text-6xl leading-[0.92] tracking-[-0.055em]">
            The archive for every device around your computer.
          </h2>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
            Explore specifications, compare hardware, discuss
            devices and help build a structured peripheral knowledge
            base.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: Keyboard,
              label: "Keyboards"
            },
            {
              icon: MousePointer2,
              label: "Mice"
            },
            {
              icon: Router,
              label: "Networking"
            },
            {
              icon: Cpu,
              label: "Hardware"
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"
            >
              <item.icon
                size={26}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p className="mt-5 text-sm font-semibold">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}