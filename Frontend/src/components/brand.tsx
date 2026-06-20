import { CircuitBoard } from "lucide-react";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <CircuitBoard size={21} />
      </span>
      <span style={{ color: light ? "#fff" : undefined }}>PeripheralsTalk</span>
    </div>
  );
}
