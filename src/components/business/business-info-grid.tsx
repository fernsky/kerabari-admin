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
  Phone,
  GraduationCap,
  FileCheck,
  DollarSign,
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

interface BusinessInfoGridProps {
  business: BusinessSchema;
}

export function BusinessInfoGrid({ business }: BusinessInfoGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Basic Information">
        <DetailRow
          icon={Building2}
          label="Business Name"
          value={business?.businessName}
        />
        <DetailRow
          icon={Building2}
          label="Business Type"
          value={business?.businessType}
        />
        <DetailRow
          icon={Building2}
          label="Business Nature"
          value={business?.businessNature}
        />
        <DetailRow icon={MapPin} label="Location" value={business?.locality} />
        <DetailRow
          icon={MapPin}
          label="Ward No"
          value={business?.wardNo?.toString()}
        />
      </Card>

      <Card title="Operator Details">
        <DetailRow icon={Users} label="Name" value={business?.operatorName} />
        <DetailRow icon={Phone} label="Phone" value={business?.operatorPhone} />
        <DetailRow
          icon={Users}
          label="Gender"
          value={business?.operatorGender}
        />
        <DetailRow
          icon={Calendar}
          label="Age"
          value={business?.operatorAge?.toString()}
        />
        <DetailRow
          icon={GraduationCap}
          label="Education"
          value={business?.operatorEducation}
        />
      </Card>

      <Card title="Registration Details">
        <DetailRow
          icon={FileCheck}
          label="Registration Status"
          value={business?.registrationStatus}
        />
        <DetailRow
          icon={FileCheck}
          label="PAN Status"
          value={business?.panStatus}
        />
        <DetailRow
          icon={Binary}
          label="PAN Number"
          value={business?.panNumber}
        />
        <DetailRow
          icon={FileCheck}
          label="Statutory Status"
          value={business?.statutoryStatus}
        />
      </Card>

      <Card title="Financial Details">
        <DetailRow
          icon={DollarSign}
          label="Investment Amount"
          value={business?.investmentAmount?.toString()}
        />
        <DetailRow
          icon={Users}
          label="Permanent Employees"
          value={business?.totalPermanentEmployees?.toString()}
        />
        <DetailRow
          icon={Users}
          label="Temporary Employees"
          value={business?.totalTemporaryEmployees?.toString()}
        />
        <DetailRow
          icon={Users}
          label="Total Partners"
          value={business?.totalPartners?.toString()}
        />
      </Card>
    </div>
  );
}
