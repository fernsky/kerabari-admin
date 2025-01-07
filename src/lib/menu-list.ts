import {
  LayoutGrid,
  LucideIcon,
  LandPlot,
  UsersRound,
  AreaChart,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "My Areas",
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: "/ward",
          label: "Wards",
          icon: AreaChart,
          submenus: [],
        },
        {
          href: "/area",
          label: "Areas",
          icon: LandPlot,
          submenus: [],
        },
        {
          href: "/enumerators",
          label: "Enumerators",
          icon: UsersRound,
          submenus: [],
        },
      ],
    },
  ];
}
