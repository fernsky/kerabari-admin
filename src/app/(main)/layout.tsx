import { type ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="mb-20">{children}</div>
    </>
  );
};

export default MainLayout;
