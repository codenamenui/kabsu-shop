import React from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users } from "lucide-react";
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
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">My Memberships</h1>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Error loading memberships: {error.message}
          </p>
        </div>
      )}

      {memberships && memberships.length === 0 && (
        <div className="rounded-md bg-gray-50 py-12 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            You don't have any active memberships yet.
          </p>
        </div>
      )}

      <div className="flex flex-col">
        {memberships?.map((membership) => {
          const shop = membership.shops;
          return <ShopCard shop={shop} key={shop?.id} />;
        })}
      </div>
    </div>
  );
};

export default Membership;
