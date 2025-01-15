import {
  LayoutGrid,
  LucideIcon,
  LandPlot,
  UsersRound,
  AreaChart,
  FormInput,
  GitPullRequest,
  Diamond,
  Building,
  Building2,
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
          label: "Dashboard",
          icon: LayoutGrid,
        },
        {
          href: "/buildings",
          label: "Buildings",
          icon: Building2,
        },
        {
          href: "/area/requested-areas",
          label: "Requested Areas",
          icon: GitPullRequest,
          submenus: [],
        },
        {
          href: "/enumerators",
          label: "Enumerators",
          icon: UsersRound,
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
          href: "/forms",
          label: "Forms",
          icon: FormInput,
        },
      ],
    },
  ];
}
