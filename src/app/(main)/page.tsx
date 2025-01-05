import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";

export default function MainPage() {
  redirect(Paths.Dashboard);
}
