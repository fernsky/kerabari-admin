import {
  LayoutGrid,
  LucideIcon,
  LandPlot,
  UsersRound,
  AreaChart,
  FormInput,
  GitPullRequest,
  Building2,
  ScanBarcode,
  User2Icon,
} from "lucide-react";

export type Role = "admin" | "superadmin" | "enumerator";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
  roles?: Role[];
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  roles?: Role[];
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

const menuConfig: Menu[] = [
  {
    href: "/",
    label: "Home",
    icon: LayoutGrid,
    roles: ["admin", "superadmin", "enumerator"],
  },
  {
    href: "/qr-code",
    label: "QR Code",
    icon: ScanBarcode,
    roles: ["enumerator"],
  },
  {
    href: "/ward",
    label: "Wards",
    icon: AreaChart,
    roles: ["admin", "superadmin"],
    submenus: [],
  },
  {
    href: "/area",
    label: "Areas",
    icon: LandPlot,
    roles: ["admin", "superadmin"],
    submenus: [],
  },
  {
    href: "/buildings",
    label: "Buildings",
    icon: Building2,
    roles: ["admin", "superadmin"],
  },
  {
    href: "/families",
    label: "Families",
    icon: User2Icon,
  },
  {
    href: "/enumerators",
    label: "Enumerators",
    icon: UsersRound,
    roles: ["admin", "superadmin"],
    submenus: [],
  },
  {
    href: "/area/requested-areas",
    label: "Requested Areas",
    icon: GitPullRequest,
    roles: ["admin", "superadmin"],
    submenus: [],
  },
  {
    href: "/area/handle-actions",
    label: "Handle Actions",
    icon: FormInput,
    roles: ["admin", "superadmin"],
    submenus: [],
  },
];

export function getMenuList(pathname: string, userRole: Role): Group[] {
  const filteredMenus = menuConfig.filter(
    (menu) => !menu.roles || menu.roles.includes(userRole),
  );

  return [
    {
      groupLabel: "",
      menus: filteredMenus,
    },
  ];
}
