"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTextIcon, FilePlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

const items = [
  {
    title: "Parts",
    href: "/dashboard/parts",
    icon: FileTextIcon,
  },
  {
    title: "Chapters",
    href: "/dashboard/chapters",
    icon: FileTextIcon,
  },
  {
    title: "Sections",
    href: "/dashboard/sections",
    icon: FileTextIcon,
  },
  {
    title: "New Part",
    href: "/dashboard/parts/create",
    icon: FilePlusIcon,
  },
  {
    title: "New Chapter",
    href: "/dashboard/chapters/create",
    icon: FilePlusIcon,
  },
  {
    title: "New Section",
    href: "/dashboard/sections/create",
    icon: FilePlusIcon,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface Props {
  className?: string;
}

export function DashboardNav({ className }: Props) {
  const path = usePathname();

  return (
    <nav className={cn(className)}>
      {items.map((item) => (
        <Link href={item.href} key={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === item.href ? "bg-accent" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
