import { type ReactNode } from "react";
import { Header } from "./_components/header";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="mb-20">{children}</div>
    </>
  );
};

export default MainLayout;
