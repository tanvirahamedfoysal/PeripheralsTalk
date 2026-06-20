import {
  Cpu,
  Keyboard,
  MousePointer2,
  Router
} from "lucide-react";

const peripheralItems = [
  {
    title: "Keyboards",
    icon: Keyboard
  },
  {
    title: "Pointing devices",
    icon: MousePointer2
  },
  {
    title: "Networking",
    icon: Router
  },
  {
    title: "Technology",
    icon: Cpu
  }
];

export function AuthSidePanel(): React.ReactElement {
  return (
    <aside className="relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2.5rem] bg-[var(--brand-teal)] p-10 text-[var(--brand-blush)] lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden="true"
        className="absolute -top-52 -right-44 size-[32rem] rounded-full bg-[var(--brand-aqua)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-52 -left-40 size-[34rem] rounded-full bg-[var(--brand-red)]/30 blur-3xl"
      />

      <div className="relative z-10">
        <p className="eyebrow text-[var(--brand-aqua)]">
          PeripheralsTalk / Knowledge archive
        </p>

        <h2 className="mt-8 max-w-2xl text-[clamp(4rem,6vw,7.5rem)] leading-[0.83] tracking-[-0.075em]">
          Every device deserves a deeper conversation.
        </h2>

        <p className="mt-8 max-w-lg text-base leading-8 text-white/70">
          Read structured peripheral specifications, share
          experience, rate devices and help the community build a
          reliable hardware archive.
        </p>
      </div>

      <div className="relative z-10 mt-16 grid grid-cols-2 gap-4">
        {peripheralItems.map((item, index) => (
          <div
            key={item.title}
            className="group rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <item.icon
                size={27}
                strokeWidth={1.4}
                aria-hidden="true"
              />

              <span className="font-mono text-[10px] tracking-[0.18em] text-white/45">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <p className="mt-8 text-sm font-semibold">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}