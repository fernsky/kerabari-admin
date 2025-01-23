import {
  Building2,
  Users,
  MapPin,
  Home,
  Binary,
  Calendar,
  Globe,
  AlertTriangle,
  Clock,
  Construction,
} from "lucide-react";
import { Card as CustomCard } from "./card";
import { DetailRow } from "../shared/detail-row";
import { MultipleDetailRow } from "../shared/multiple-detail-row";
import { BuildingSchema } from "@/server/db/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BusinessSchema } from "@/server/db/schema/business/business";

interface BuildingInfoGridProps {
  building: BuildingSchema;
}

export function BuildingInfoGrid({ building }: BuildingInfoGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CustomCard title="Survey Information" icon={Users}>
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
      </CustomCard>

      <CustomCard title="Location Details" icon={MapPin}>
        <DetailRow
          icon={MapPin}
          label="Ward Number"
          value={building?.tmpWardNumber}
        />
        <DetailRow icon={Globe} label="Locality" value={building?.locality} />
        <DetailRow
          icon={Binary}
          label="Area Code"
          value={building?.tmpAreaCode}
        />
      </CustomCard>

      <CustomCard title="Building Details" icon={Building2}>
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
        <DetailRow icon={Building2} label="Floor" value={building?.floor} />
        <DetailRow
          icon={AlertTriangle}
          label="Map Status"
          value={building?.mapStatus}
        />
        <MultipleDetailRow
          icon={AlertTriangle}
          label="Natural Disasters"
          values={building?.naturalDisasters}
        />
      </CustomCard>

      <CustomCard title="Accessibility Information" icon={Clock}>
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
      </CustomCard>
    </div>
  );
}

export function BusinessInfoGrid({ business }: { business: BusinessSchema }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Basic Information</h3>
        </CardHeader>
        <CardContent className="grid gap-4">
          <InfoItem label="Business Name" value={business.businessName} />
          <InfoItem label="Business Type" value={business.businessType} />
          <InfoItem label="Business Nature" value={business.businessNature} />
          <InfoItem label="Location" value={business.locality} />
          <InfoItem label="Ward No" value={business.wardNo?.toString()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Operator Details</h3>
        </CardHeader>
        <CardContent className="grid gap-4">
          <InfoItem label="Name" value={business.operatorName} />
          <InfoItem label="Phone" value={business.operatorPhone} />
          <InfoItem label="Gender" value={business.operatorGender} />
          <InfoItem label="Age" value={business.operatorAge?.toString()} />
          <InfoItem label="Education" value={business.operatorEducation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Registration Details</h3>
        </CardHeader>
        <CardContent className="grid gap-4">
          <InfoItem
            label="Registration Status"
            value={business.registrationStatus}
          />
          <InfoItem label="PAN Status" value={business.panStatus} />
          <InfoItem label="PAN Number" value={business.panNumber} />
          <InfoItem label="Statutory Status" value={business.statutoryStatus} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
