import Image from "next/image";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark logo-image-wrap">
        <Image src="/logo.png" alt="" width={26} height={26} priority />
      </span>
      <span style={{ color: light ? "#fff" : undefined }}>PeripheralsTalk</span>
    </div>
  );
}
