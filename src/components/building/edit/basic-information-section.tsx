import { fieldStyles, SectionProps } from "./common-field-styles";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormCard } from "./form-card";
import { UseFormReturn } from "react-hook-form";

export function BasicInformationSection({
  form,
  icon,
  className,
}: SectionProps) {
  return (
    <FormCard
      title="Basic Information"
      description="General information about the building"
      icon={icon}
      className={className}
    >
      <div className={fieldStyles.gridContainer}>
        <FormField
          control={form.control}
          name="enumeratorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={fieldStyles.label}>
                Enumerator Name
              </FormLabel>
              <FormControl>
                <Input {...field} className={fieldStyles.input} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={fieldStyles.label}>Ward Number</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((ward) => (
                    <SelectItem key={ward} value={ward.toString()}>
                      Ward {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={fieldStyles.label}>Locality</FormLabel>
              <FormControl>
                <Input {...field} className={fieldStyles.input} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormCard>
  );
}
