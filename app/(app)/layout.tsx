import { AppSidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="term-grid-bg min-h-screen">
      <div className="relative flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
