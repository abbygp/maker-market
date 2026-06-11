export type UserRole = "vendor" | "organizer";

export type CraftCategory =
  | "fiber_arts"
  | "ceramics"
  | "jewelry"
  | "illustration"
  | "candles"
  | "other";

export type MarketStatus = "draft" | "open" | "closed";

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "declined";

export interface Profile {
  id: string;
  updated_at: string;
  role: UserRole;
  business_name: string | null;
  instagram_handle: string | null;
  website_url: string | null;
  bio: string | null;
  portfolio_images: string[];
  category: CraftCategory | null;
}

export interface Market {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  date: string;
  location_name: string;
  address: string | null;
  booth_fee: number | null;
  application_deadline: string | null;
  categories_needed: string[];
  status: MarketStatus;
  created_at: string;
}

export interface Application {
  id: string;
  market_id: string;
  vendor_id: string;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
}

export interface ApplicationWithVendor extends Application {
  vendor: Profile;
}

export interface MarketWithOrganizer extends Market {
  organizer: Pick<Profile, "business_name"> | null;
}
