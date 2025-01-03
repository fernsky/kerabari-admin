import { DashboardNav } from "./_components/dashboard-nav";
import { VerificiationWarning } from "./_components/verificiation-warning";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="container min-h-[calc(100vh-180px)] px-2 pt-6 md:px-4">
      <div className="flex">
        <DashboardNav className="flex w-[300px] flex-shrink-0 flex-col gap-2" />
        <main className="flex w-full space-y-4">
          <VerificiationWarning />
          {children}
        </main>
      </div>
    </div>
  );
}
