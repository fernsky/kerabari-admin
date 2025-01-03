interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="container min-h-[calc(100vh-180px)] px-2 pt-6 md:px-4">
      <div className="flex">
       {children}
      </div>
    </div>
  );
}
