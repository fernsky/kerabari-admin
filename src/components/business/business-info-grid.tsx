import {
  Building2,
  Users,
  MapPin,
  Store,
  Binary,
  Calendar,
  Globe,
  Phone,
  GraduationCap,
  FileCheck,
  DollarSign,
} from "lucide-react";
import { Card } from "../building/card";
import { DetailRow } from "../shared/detail-row";
import { BusinessSchema } from "@/server/db/schema/business/business";
import { LocationDetailsSection } from "./location-details-section";

interface BusinessInfoGridProps {
  business: BusinessSchema;
  locationDetails?: {
    coordinates: [number, number];
    gpsAccuracy?: number;
    altitude?: number;
  };
}

export function BusinessInfoGrid({
  business,
  locationDetails,
}: BusinessInfoGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic and Location Info */}
      <div className="space-y-6">
        <Card title="Survey Information" icon={Users}>
          {/* <DetailRow
            icon={Calendar}
            label="Survey Date"
            value={business?.createdAt?.toLocaleDateString()}
          /> */}
          <DetailRow
            icon={Users}
            label="Enumerator"
            value={business?.enumeratorName}
          />
          <DetailRow
            icon={Binary}
            label="Enumerator ID"
            value={business?.enumeratorId}
          />
        </Card>

        <Card title="Business Information" icon={Store}>
          <DetailRow
            icon={Store}
            label="Business Name"
            value={business?.businessName}
          />
          <DetailRow
            icon={Store}
            label="Business Type"
            value={business?.businessType}
          />
          <DetailRow
            icon={Store}
            label="Business Nature"
            value={business?.businessNature}
          />
        </Card>
      </div>

      {/* Operator and Registration */}
      <div className="space-y-6">
        <Card title="Location Details" icon={MapPin}>
          <DetailRow icon={Globe} label="Locality" value={business?.locality} />
          <DetailRow
            icon={MapPin}
            label="Ward Number"
            value={business?.wardNo?.toString()}
          />

          {locationDetails && (
            <div className="mt-4 pt-4 border-t">
              <LocationDetailsSection {...locationDetails} />
            </div>
          )}
        </Card>

        <Card title="Financial Information" icon={DollarSign}>
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
    </div>
  );
}
