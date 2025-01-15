"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  MapPin,
  Store,
  Phone,
  Mail,
  Camera,
  Edit,
  Trash2,
  Home,
  Binary,
  Calendar,
  Globe,
  AlertTriangle,
  Clock,
  Construction,
  PersonStanding,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ShowPoint } from "@/components/shared/maps/show-point";

import { z } from "zod";
const gpsSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90), // latitude
  ]),
});

export default function BuildingDetails({
  params,
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: building,
    isLoading,
    error,
  } = api.building.getById.useQuery({ id: decodedId });

  if (error) {
    return (
      <ContentLayout title="Error">
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
  }: {
    icon: any;
    title: string;
    value: string | number;
  }) => (
    <div className="flex items-center space-x-4 rounded-lg border bg-card p-4">
      <div className="rounded-full bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );

  const DetailRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | number | null | undefined;
  }) => (
    <div className="group relative rounded-lg border bg-card/50 p-3 transition-all hover:bg-accent/50">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-medium">{value || "—"}</p>
        </div>
      </div>
    </div>
  );

  const Card = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">Building Information</p>
        </div>
      </div>
      <div className="grid gap-2 p-4">{children}</div>
    </div>
  );

  return (
    <ContentLayout
      title="Building Details"
      actions={
        <div className="flex gap-2">
          <Link href={`/resources/buildings/edit/${params.id}`}>
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6 lg:px-10 px-2">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Users}
              title="Total Families"
              value={building?.totalFamilies || 0}
            />
            <StatCard
              icon={Store}
              title="Total Businesses"
              value={building?.totalBusinesses || 0}
            />
            <StatCard
              icon={MapPin}
              title="Ward Number"
              value={building?.wardNumber || 0}
            />
          </div>

          {/* Image Section (if available) */}
          {building?.buildingImage && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="aspect-video relative">
                <Image
                  src={building.buildingImage}
                  alt="Building"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Survey Information" icon={Users}>
              <DetailRow
                icon={Calendar}
                label="Survey Date"
                value={building?.surveyDate?.toLocaleDateString()}
              />
              <DetailRow
                icon={Users}
                label="Enumerator"
                value={building?.enumeratorName}
              />
              <DetailRow
                icon={Binary}
                label="Enumerator ID"
                value={building?.enumeratorId}
              />
            </Card>

            <Card title="Location Details" icon={MapPin}>
              <DetailRow
                icon={MapPin}
                label="Ward Number"
                value={building?.wardNumber}
              />
              <DetailRow
                icon={Globe}
                label="Locality"
                value={building?.locality}
              />
              <DetailRow
                icon={Binary}
                label="Area Code"
                value={building?.areaCode}
              />
            </Card>

            <Card title="Building Details" icon={Building2}>
              <DetailRow
                icon={Home}
                label="Land Ownership"
                value={building?.landOwnership}
              />
              <DetailRow icon={Building2} label="Base" value={building?.base} />
              <DetailRow
                icon={Building2}
                label="Outer Wall"
                value={building?.outerWall}
              />
              <DetailRow icon={Building2} label="Roof" value={building?.roof} />
              <DetailRow
                icon={Building2}
                label="Floor"
                value={building?.floor}
              />
              <DetailRow
                icon={AlertTriangle}
                label="Map Status"
                value={building?.mapStatus}
              />
              <DetailRow
                icon={AlertTriangle}
                label="Natural Disasters"
                value={building?.naturalDisasters}
              />
            </Card>

            <Card title="Accessibility Information" icon={Clock}>
              <DetailRow
                icon={Clock}
                label="Time to Market"
                value={building?.timeToMarket}
              />
              <DetailRow
                icon={Clock}
                label="Time to Active Road"
                value={building?.timeToActiveRoad}
              />
              <DetailRow
                icon={Clock}
                label="Time to Public Bus"
                value={building?.timeToPublicBus}
              />
              <DetailRow
                icon={Clock}
                label="Time to Health Organization"
                value={building?.timeToHealthOrganization}
              />
              <DetailRow
                icon={Clock}
                label="Time to Financial Organization"
                value={building?.timeToFinancialOrganization}
              />
              <DetailRow
                icon={Construction}
                label="Road Status"
                value={building?.roadStatus}
              />
            </Card>
          </div>

          {/* Add location map if GPS coordinates are available */}
          {building?.gps && gpsSchema.safeParse(building.gps).success && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/50 p-4">
                <h3 className="font-semibold">Location</h3>
                <p className="text-xs text-muted-foreground">
                  Building GPS Coordinates
                </p>
              </div>
              <div className="aspect-[21/9]">
                <ShowPoint
                  coordinates={[
                    building.gps.coordinates[1],
                    building.gps.coordinates[0],
                  ]}
                />
              </div>
              <div className="grid gap-2 p-4">
                <DetailRow
                  icon={MapPin}
                  label="Accuracy"
                  value={`${building.gpsAccuracy?.toFixed(2) || "—"} meters`}
                />
                <DetailRow
                  icon={Building2}
                  label="Altitude"
                  value={`${building.altitude?.toFixed(2) || "—"} meters`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ContentLayout>
  );
}
