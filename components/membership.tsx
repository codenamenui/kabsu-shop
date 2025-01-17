import React from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, ShoppingBag, Users } from "lucide-react";
import ShopCard from "./shop-card";

const Membership = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("shops(id, logo_url, acronym, name)")
    .eq("email", user?.email);

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">My Memberships</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage your shop memberships
        </p>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-600">
              Error loading memberships: {error.message}
            </p>
          </Card>
        )}

        {memberships && memberships.length === 0 ? (
          <Card className="bg-gray-50 py-12">
            <div className="text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                You don't have any active memberships yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {memberships?.map((membership) => {
              const shop = membership.shops;
              return <ShopCard shop={shop} manage={false} key={shop?.id} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;
