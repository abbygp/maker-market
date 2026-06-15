"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserSettingsMenuProps {
  hasProfile: boolean;
  businessName?: string | null;
  canDeleteAccount: boolean;
}

export function UserSettingsMenu({
  hasProfile,
  businessName,
  canDeleteAccount,
}: UserSettingsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Settings"
            className="shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {businessName && (
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-stone-800">
                {businessName}
              </p>
              <p className="text-xs text-stone-500">Account</p>
            </div>
          )}
          {businessName && <DropdownMenuSeparator />}
          {hasProfile && (
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault();
              void handleSignOut();
            }}
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
          {canDeleteAccount && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                onSelect={(event) => {
                  event.preventDefault();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your MakerMarket account, profile, and any
              markets or applications linked to it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <form action="/auth/delete-account" method="post">
              <Button
                type="submit"
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete account
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
