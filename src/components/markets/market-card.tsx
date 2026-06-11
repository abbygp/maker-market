import Link from "next/link";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategory } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Market } from "@/types/database";

export function MarketCard({ market }: { market: Market }) {
  return (
    <Link href={`/markets/${market.id}`} className="group block">
      <Card className="h-full border-stone-200/80 transition hover:border-stone-300 hover:shadow-md">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl leading-snug group-hover:text-amber-900">
              {market.title}
            </CardTitle>
            {market.application_deadline && (
              <Badge variant="outline" className="shrink-0">
                Apply by {formatDate(market.application_deadline)}
              </Badge>
            )}
          </div>
          {market.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-stone-500">
              {market.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-stone-400" />
              {formatDate(market.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-stone-400" />
              {market.location_name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-stone-400" />
              {formatCurrency(market.booth_fee)}
            </span>
          </div>

          {market.categories_needed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {market.categories_needed.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {formatCategory(cat)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
