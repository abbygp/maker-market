"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApplyButtonProps {
  marketId: string;
  vendorId: string;
  hasApplied: boolean;
}

export function ApplyButton({
  marketId,
  vendorId,
  hasApplied,
}: ApplyButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(hasApplied);

  async function handleApply() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("applications").insert({
      market_id: marketId,
      vendor_id: vendorId,
      notes: notes || null,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setApplied(true);
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (applied) {
    return (
      <Button disabled variant="secondary">
        Application submitted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Apply Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to this market</DialogTitle>
          <DialogDescription>
            Your maker resume will be sent to the organizer. Add an optional note below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="notes">Note to organizer (optional)</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="I'd love a corner booth for my pottery display..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? "Submitting..." : "Submit application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
