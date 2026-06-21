import type { ComponentType } from "react";
import {
  Camera,
  Cable,
  Gamepad2,
  HardDrive,
  Keyboard,
  Mic2,
  Mouse,
  Network,
  Printer,
  Projector,
  Router,
  ScanLine,
  Speaker,
  Usb,
} from "lucide-react";

export interface PeripheralCategory {
  id: number;
  slug: string;
  name: string;
  summary: string;
  specs: string[];
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}
export const peripheralCategories: PeripheralCategory[] = [
  {
    id: 1,
    slug: "keyboard",
    name: "Keyboard",
    summary: "Layouts, switches and keycap materials.",
    specs: ["Layout", "Switch type", "Keycap material"],
    icon: Keyboard,
  },
  {
    id: 2,
    slug: "mouse",
    name: "Mouse",
    summary: "Sensors, DPI, weight and switches.",
    specs: ["DPI", "Sensor", "Weight", "Switch type"],
    icon: Mouse,
  },
  {
    id: 3,
    slug: "printer",
    name: "Printer",
    summary: "Ink systems, speed and duplex support.",
    specs: ["Ink type", "PPM", "Duplex printing"],
    icon: Printer,
  },
  {
    id: 4,
    slug: "scanner",
    name: "Scanner",
    summary: "Resolution and document feeding systems.",
    specs: ["Resolution", "Sheet-fed / Flatbed"],
    icon: ScanLine,
  },
  {
    id: 5,
    slug: "camera",
    name: "Camera",
    summary: "Sensors, resolution and frame rate.",
    specs: ["Sensor size", "Resolution", "FPS"],
    icon: Camera,
  },
  {
    id: 6,
    slug: "microphone",
    name: "Microphone",
    summary: "Pickup patterns and connections.",
    specs: ["Polar pattern", "Connection type"],
    icon: Mic2,
  },
  {
    id: 7,
    slug: "projector",
    name: "Projector",
    summary: "Brightness, throw and resolution.",
    specs: ["Lumens", "Throw ratio", "Resolution"],
    icon: Projector,
  },
  {
    id: 8,
    slug: "speaker",
    name: "Speaker",
    summary: "Channels, output and response.",
    specs: ["Channels", "Wattage", "Frequency response"],
    icon: Speaker,
  },
  {
    id: 9,
    slug: "external-hdd",
    name: "External HDD",
    summary: "Portable capacity and transfer performance.",
    specs: ["Capacity", "Read/write speed", "Interface"],
    icon: HardDrive,
  },
  {
    id: 10,
    slug: "modem",
    name: "Modem",
    summary: "Standards and downstream channels.",
    specs: ["DOCSIS standard", "Channels"],
    icon: Cable,
  },
  {
    id: 11,
    slug: "router",
    name: "Router",
    summary: "Wireless standards, bands and coverage.",
    specs: ["Wi-Fi standard", "Bands", "Coverage"],
    icon: Router,
  },
  {
    id: 12,
    slug: "switch",
    name: "Switch",
    summary: "Ports, PoE and management capabilities.",
    specs: ["Ports", "PoE support", "Managed / Unmanaged"],
    icon: Network,
  },
  {
    id: 13,
    slug: "usb",
    name: "USB",
    summary: "Version, capacity and form factor.",
    specs: ["Version", "Capacity", "Form factor"],
    icon: Usb,
  },
  {
    id: 14,
    slug: "game-controller",
    name: "Game Controller",
    summary: "Layouts, connectivity and trigger technology.",
    specs: ["Layout", "Connectivity", "Hall-effect triggers"],
    icon: Gamepad2,
  },
];
export const getCategory = (idOrSlug: string | number) =>
  peripheralCategories.find(
    (c) => c.id === Number(idOrSlug) || c.slug === String(idOrSlug),
  );
