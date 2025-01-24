import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface EditPageLayoutProps {
  children: React.ReactNode;
}

export function EditPageLayout({ children }: EditPageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent h-32" />
      <div className="relative">
        <div className="mx-auto max-w-5xl space-y-8 p-4 pt-8">
          <Card className="border-none shadow-none bg-transparent">
            <div className="grid gap-6">{children}</div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
