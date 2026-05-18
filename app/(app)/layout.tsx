import { AppSidebar } from "@/components/app/sidebar";
import { StarField } from "@/components/landing/star-field";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StarField />
      <div className="relative flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </>
  );
}
