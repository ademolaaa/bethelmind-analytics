import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Globe,
  GraduationCap,
  Home,
  MessageSquareText,
  Package,
  ShoppingCart,
  Stethoscope,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const cmsIconMap: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Globe,
  GraduationCap,
  Home,
  MessageSquareText,
  Package,
  ShoppingCart,
  Stethoscope,
  Store,
  Truck,
  Users,
};

export function resolveCmsIcon(iconName?: string): LucideIcon {
  if (!iconName) return BarChart3;
  return cmsIconMap[iconName] ?? BarChart3;
}

