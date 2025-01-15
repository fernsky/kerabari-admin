import { Navbar } from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentLayout({
  title,
  children,
  className,
}: ContentLayoutProps) {
  return (
    <div className={className ? className : ""}>
      <Navbar title={title} />
      <div className="container pt-8 pb-8 px-4 sm:px-1">{children}</div>
    </div>
  );
}
