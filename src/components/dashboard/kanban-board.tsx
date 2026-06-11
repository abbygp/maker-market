"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatCategory } from "@/lib/constants";
import type { ApplicationStatus, ApplicationWithVendor } from "@/types/database";

interface ApplicationCardProps {
  application: ApplicationWithVendor;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationCard({
  application,
  onStatusChange,
}: ApplicationCardProps) {
  const vendor = application.vendor;
  const image = vendor.portfolio_images[0];

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
      {image ? (
        <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={vendor.business_name || "Portfolio"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-400">
          No image
        </div>
      )}

      <Link
        href={`/makers/${vendor.id}`}
        className="font-medium text-stone-800 hover:text-amber-800"
      >
        {vendor.business_name || "Untitled Maker"}
      </Link>

      {vendor.category && (
        <Badge variant="secondary" className="mt-2">
          {formatCategory(vendor.category)}
        </Badge>
      )}

      {application.notes && (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-stone-500">
          {application.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1">
        {(["pending", "approved", "waitlisted", "declined"] as ApplicationStatus[]).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(application.id, status)}
              className={`rounded-md px-2 py-1 text-[10px] uppercase tracking-wide transition ${
                application.status === status
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  applications: ApplicationWithVendor[];
}

export function KanbanBoard({ applications: initial }: KanbanBoardProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initial);

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (error) {
      setApplications(initial);
      return;
    }

    router.refresh();
  }

  const columns = [
    { status: "pending" as const, label: "Pending" },
    { status: "approved" as const, label: "Approved" },
    { status: "waitlisted" as const, label: "Waitlisted" },
    { status: "declined" as const, label: "Declined" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => {
        const columnApps = applications.filter(
          (app) => app.status === column.status
        );

        return (
          <div
            key={column.status}
            className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-700">
                {column.label}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-stone-500 shadow-sm">
                {columnApps.length}
              </span>
            </div>
            <div className="space-y-3">
              {columnApps.length > 0 ? (
                columnApps.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-xs text-stone-400">
                  No applications
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
