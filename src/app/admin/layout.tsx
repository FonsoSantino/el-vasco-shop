import { AdminSidebar } from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin | El Vasco Shop",
  description: "Secure management platform",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden mt-16 md:mt-0">
        {/* Subtle background glow for the admin panel */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
