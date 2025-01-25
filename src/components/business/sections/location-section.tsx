import { MapPin, Globe } from "lucide-react";
import { Card } from "../../building/card";
import { DetailRow } from "../../shared/detail-row";
import type { BusinessSchema, LocationDetails } from "../types";

interface LocationSectionProps {
  business: BusinessSchema;
  locationDetails?: LocationDetails;
}

export function LocationSection({
  business,
  locationDetails,
}: LocationSectionProps) {
  return (
    <Card title="Location Information" icon={MapPin}>
      <DetailRow
        icon={MapPin}
        label="Ward Number"
        value={business?.wardNo?.toString()}
      />
      <DetailRow
        icon={MapPin}
        label="Area Code"
        value={business?.areaCode?.toString()}
      />
      <DetailRow
        icon={MapPin}
        label="Business Number"
        value={business?.businessNo}
      />
      <DetailRow icon={Globe} label="Locality" value={business?.locality} />
      {locationDetails && (
        <>
          <DetailRow
            icon={MapPin}
            label="Coordinates"
            value={`${locationDetails.coordinates[0]}, ${locationDetails.coordinates[1]}`}
          />
          {locationDetails.altitude && (
            <DetailRow
              icon={MapPin}
              label="Altitude"
              value={locationDetails.altitude.toString()}
            />
          )}
          {locationDetails.gpsAccuracy && (
            <DetailRow
              icon={MapPin}
              label="GPS Accuracy"
              value={`${locationDetails.gpsAccuracy}m`}
            />
          )}
        </>
      )}
    </Card>
  );
}
