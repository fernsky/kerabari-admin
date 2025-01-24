import { Card } from "./card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessAnimalProduct } from "@/server/db/schema/business/business-animal-products";
import { BusinessAnimal } from "@/server/db/schema/business/business-animals";
import { BusinessCrop } from "@/server/db/schema/business/business-crops";
import { Origami, Milk } from "lucide-react";
import { CropDetailsSection } from "./crop-details-section";

interface BusinessDetailsProps {
  animals?: BusinessAnimal[] | null;
  animalProducts?: BusinessAnimalProduct[] | null;
  crops?: BusinessCrop[] | null;
}

export function BusinessDetailsSection({
  animals,
  animalProducts,
  crops,
}: BusinessDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Animal section */}
        {animals && animals.length > 0 && (
          <Card title="Livestock Information" icon={Origami}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Count</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>{animal.animalType}</TableCell>
                    <TableCell>{animal.animalName}</TableCell>
                    <TableCell>{animal.totalCount}</TableCell>
                    <TableCell>{animal.salesCount}</TableCell>
                    <TableCell>{animal.revenue?.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Animal products section */}
        {animalProducts && animalProducts.length > 0 && (
          <Card title="Animal Products" icon={Milk}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animalProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.animalProduct}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>
                      {product.productionAmount?.toString()} {product.unit}
                    </TableCell>
                    <TableCell>
                      {product.salesAmount?.toString()} {product.unit}
                    </TableCell>
                    <TableCell>
                      {product.monthlyProduction?.toString()} {product.unit}
                    </TableCell>
                    <TableCell>{product.revenue?.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Crops section */}
      {crops && crops.length > 0 && <CropDetailsSection crops={crops} />}
    </div>
  );
}
