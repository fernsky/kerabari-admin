"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Edit,
  Users,
  BookOpen,
  Heart,
  GraduationCap,
  Briefcase,
  Home,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IndividualDetails({
  params,
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(params.id);
  const {
    data: individual,
    isLoading,
    error,
  } = api.individual.getById.useQuery({ id: decodedId });

  if (error) {
    return (
      <ContentLayout title="Error">
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const QuickStatsCard = () => (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Age</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{individual?.age || "N/A"}</div>
          <p className="text-xs text-muted-foreground">Years old</p>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gender</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {individual?.gender || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Gender Identity</p>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Education</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {individual?.educationalLevel || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Education Level</p>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Religion</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {individual?.religion || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Religious Background</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ContentLayout
      title="Individual Profile"
      actions={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/individuals">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
          </Link>
          <Link href={`/individuals/edit/${params.id}`}>
            <Button size="sm" className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6 p-4 md:p-6">
          {/* Header Card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {individual?.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      ID: {individual?.id}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-4 py-1">
                    Ward {individual?.wardNo}
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-1">
                    {individual?.familyRole || "Role N/A"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <QuickStatsCard />

          {/* Tabs Section */}
          <Tabs defaultValue="personal" className="space-y-4">
            <div className="overflow-auto">
              <TabsList className="w-full h-auto flex-wrap gap-2 bg-muted/60 p-1 md:p-2">
                <TabsTrigger value="personal" className="flex-1 md:flex-none">
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Personal</span>
                    <span className="sm:hidden">Info</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="cultural" className="flex-1 md:flex-none">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Cultural</span>
                    <span className="sm:hidden">Cult.</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex-1 md:flex-none">
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Health</span>
                    <span className="sm:hidden">Health</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex-1 md:flex-none">
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Education</span>
                    <span className="sm:hidden">Edu.</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="occupation" className="flex-1 md:flex-none">
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Occupation</span>
                    <span className="sm:hidden">Occ.</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personal" className="space-y-4">
              <DetailsCard
                title="Personal Information"
                icon={<User className="h-5 w-5 text-primary" />}
                items={[
                  {
                    label: "Name",
                    value: individual?.name,
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    label: "Age",
                    value: individual?.age?.toString(),
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    label: "Gender",
                    value: individual?.gender,
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    label: "Family Role",
                    value: individual?.familyRole,
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    label: "Marital Status",
                    value: individual?.maritalStatus,
                    icon: <Heart className="h-4 w-4" />,
                  },
                  {
                    label: "Marriage Age",
                    value: individual?.marriedAge?.toString(),
                    icon: <Heart className="h-4 w-4" />,
                  },
                ]}
              />
            </TabsContent>

            <TabsContent value="cultural" className="space-y-4">
              <DetailsCard
                title="Cultural Background"
                icon={<BookOpen className="h-5 w-5 text-primary" />}
                items={[
                  {
                    label: "Citizenship",
                    value: individual?.citizenOf,
                    icon: <Home className="h-4 w-4" />,
                  },
                  {
                    label: "Caste",
                    value: individual?.caste,
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    label: "Ancestral Language",
                    value: individual?.ancestorLanguage,
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                  {
                    label: "Mother Tongue",
                    value: individual?.primaryMotherTongue,
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                  {
                    label: "Religion",
                    value: individual?.religion,
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                ]}
              />
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <DetailsCard
                title="Health Status"
                icon={<Heart className="h-5 w-5 text-primary" />}
                items={[
                  {
                    label: "Chronic Disease",
                    value: individual?.hasChronicDisease,
                    icon: <Heart className="h-4 w-4" />,
                  },
                  {
                    label: "Primary Disease",
                    value: individual?.primaryChronicDisease,
                    icon: <Heart className="h-4 w-4" />,
                  },
                  {
                    label: "Sanitization",
                    value: individual?.isSanitized,
                    icon: <Home className="h-4 w-4" />,
                  },
                  {
                    label: "Disability Status",
                    value: individual?.isDisabled,
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    label: "Disability Type",
                    value: individual?.disabilityType,
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    label: "Disability Cause",
                    value: individual?.disabilityCause,
                    icon: <User className="h-4 w-4" />,
                  },
                ]}
              />
              {individual?.gaveLiveBirth === "Yes" && (
                <DetailsCard
                  title="Fertility Information"
                  icon={<Users className="h-5 w-5 text-primary" />}
                  items={[
                    {
                      label: "Living Children",
                      value: `Sons: ${individual.aliveSons || 0}, Daughters: ${
                        individual.aliveDaughters || 0
                      }`,
                      icon: <Users className="h-4 w-4" />,
                    },
                    {
                      label: "Recent Birth",
                      value: individual?.gaveRecentLiveBirth,
                      icon: <User className="h-4 w-4" />,
                    },
                    {
                      label: "Delivery Location",
                      value: individual?.recentDeliveryLocation,
                      icon: <Home className="h-4 w-4" />,
                    },
                    {
                      label: "Prenatal Checkups",
                      value: individual?.prenatalCheckups?.toString(),
                      icon: <Heart className="h-4 w-4" />,
                    },
                  ]}
                />
              )}
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <DetailsCard
                title="Education Status"
                icon={<GraduationCap className="h-5 w-5 text-primary" />}
                items={[
                  {
                    label: "Literacy Status",
                    value: individual?.literacyStatus,
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                  {
                    label: "Education Level",
                    value: individual?.educationalLevel,
                    icon: <GraduationCap className="h-4 w-4" />,
                  },
                  {
                    label: "School Status",
                    value: individual?.schoolPresenceStatus,
                    icon: <GraduationCap className="h-4 w-4" />,
                  },
                  {
                    label: "Primary Subject",
                    value: individual?.primarySubject,
                    icon: <BookOpen className="h-4 w-4" />,
                  },
                  {
                    label: "School Barrier",
                    value: individual?.schoolBarrier,
                    icon: <GraduationCap className="h-4 w-4" />,
                  },
                  {
                    label: "Internet Access",
                    value: individual?.hasInternetAccess,
                    icon: <Users className="h-4 w-4" />,
                  },
                ]}
              />
            </TabsContent>

            <TabsContent value="occupation" className="space-y-4">
              <DetailsCard
                title="Occupation Details"
                icon={<Briefcase className="h-5 w-5 text-primary" />}
                items={[
                  {
                    label: "Work Duration",
                    value: individual?.financialWorkDuration,
                    icon: <Briefcase className="h-4 w-4" />,
                  },
                  {
                    label: "Primary Occupation",
                    value: individual?.primaryOccupation,
                    icon: <Briefcase className="h-4 w-4" />,
                  },
                  {
                    label: "Work Barrier",
                    value: individual?.workBarrier,
                    icon: <Briefcase className="h-4 w-4" />,
                  },
                  {
                    label: "Work Availability",
                    value: individual?.workAvailability,
                    icon: <Briefcase className="h-4 w-4" />,
                  },
                  {
                    label: "Training Status",
                    value: individual?.hasTraining,
                    icon: <GraduationCap className="h-4 w-4" />,
                  },
                  {
                    label: "Primary Skill",
                    value: individual?.primarySkill,
                    icon: <GraduationCap className="h-4 w-4" />,
                  },
                ]}
              />
              {individual?.isPresent === "No" && (
                <DetailsCard
                  title="Migration Information"
                  icon={<Home className="h-5 w-5 text-primary" />}
                  items={[
                    {
                      label: "Current Location",
                      value: individual?.absenteeLocation,
                      icon: <Home className="h-4 w-4" />,
                    },
                    {
                      label: "Country",
                      value: individual?.absenteeCountry,
                      icon: <Home className="h-4 w-4" />,
                    },
                    {
                      label: "Reason",
                      value: individual?.absenceReason,
                      icon: <Briefcase className="h-4 w-4" />,
                    },
                    {
                      label: "Remittance",
                      value:
                        individual?.absenteeHasSentCash === "Yes"
                          ? `NPR ${individual?.absenteeCashAmount}`
                          : "No",
                      icon: <Briefcase className="h-4 w-4" />,
                    },
                  ]}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ContentLayout>
  );
}

// Update StatusItem component to handle responsive design better
const formatValue = (value: any): string => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return value;
};

const StatusItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | boolean | null;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
    <div className="rounded-lg bg-primary/10 p-2 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {formatValue(value) ? (
        <p className="font-medium truncate">{formatValue(value)}</p>
      ) : (
        <Badge variant="outline">Not Specified</Badge>
      )}
    </div>
  </div>
);

// Update DetailsCard for better responsive layout
const DetailsCard = ({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    value?: string | number | boolean | null;
    icon: React.ReactNode;
  }>;
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="border-b bg-muted/50">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="grid gap-4 p-4 sm:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <StatusItem
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </CardContent>
  </Card>
);

// Update LoadingState for better responsiveness
const LoadingState = () => (
  <div className="space-y-6 p-4 md:p-6">
    <Skeleton className="h-[120px] w-full" />
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[100px]" />
      ))}
    </div>
    <Skeleton className="h-[400px]" />
  </div>
);
