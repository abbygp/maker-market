import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-[#faf8f5] text-stone-800">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
