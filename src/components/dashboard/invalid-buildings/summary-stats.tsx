import {
  Building2,
  MapPin,
  Users,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryStatsProps {
  summary: {
    totalInvalid: number;
    invalidWard: number;
    invalidArea: number;
    invalidEnumerator: number;
    invalidToken: number;
  };
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      label: "Total Invalid",
      value: summary.totalInvalid,
      icon: AlertOctagon,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      label: "Invalid Ward",
      value: summary.invalidWard,
      icon: Building2,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      label: "Invalid Area",
      value: summary.invalidArea,
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Invalid Enumerator",
      value: summary.invalidEnumerator,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Invalid Token",
      value: summary.invalidToken,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col p-4 rounded-lg border bg-card transition-colors hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", stat.bgColor)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
          </div>
          <p className={cn("text-2xl font-bold mt-2", stat.color)}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
