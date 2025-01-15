"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Loader2, MapPin, Puzzle, ClipboardList } from "lucide-react";

export function EnumeratorArea() {
  const { data: area, isLoading } = api.enumerator.getAssignedArea.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
            <div className="rounded-full bg-primary/10 p-4">
              <MapPin className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                No Area Assigned
              </h2>
              <p className="max-w-md text-muted-foreground">
                You currently don't have any area assigned for surveying.
                Request an area to begin collecting data for your designated
                territory.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/area/request">
                <Button size="lg" className="gap-2">
                  <Puzzle className="h-5 w-5" />
                  Request an Area
                </Button>
              </Link>
              <Button variant="outline" size="lg" asChild>
                <Link href="/help/area-assignment">
                  Learn about area assignments
                </Link>
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Contact your supervisor if you need immediate assistance
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-10">
      {/* Area Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ward Info Card */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="space-y-1 bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Ward Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ward Number
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {area.wardNumber}
                </p>
              </div>
              <Badge variant="secondary" className="px-4 py-1 text-lg">
                {area.wardNumber < 10 ? `0${area.wardNumber}` : area.wardNumber}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Area Code Card */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="space-y-1 bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Area Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Area Code
                </p>
                <p className="text-3xl font-bold tracking-tight">{area.code}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="px-3">
                  Zone {Math.floor(area.code / 100)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Unique Identifier
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Card */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm"></div>
      <div className="flex items-center gap-2 border-b bg-muted/50 p-4">
        <div className="rounded-md bg-primary/10 p-2">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Survey Area Map</h3>
          <p className="text-xs text-muted-foreground">
            Your assigned territory for data collection
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          Ward {area.wardNumber}
        </Badge>
      </div>

      <div className="h-[400px] w-full">
        <MapContainer
          className="h-full w-full"
          zoom={15}
          scrollWheelZoom={false}
          center={[26.72069444681497, 88.04840072844279]}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {area.geometry && (
            <GeoJSON
              data={area.geometry}
              style={{
                color: "#2563eb",
                weight: 2,
                opacity: 0.6,
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
