import { createServerClient } from "@/supabase/clients/createServer";
import React from "react";
import ShopCard from "./shop-card";
import { ManagedShop } from "@/constants/type";

const ManageShops = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: managedShops, error } = await supabase
    .from("officers")
    .select("shops(id, name, acronym, logo_url)")
    .eq("user_id", user?.id)
    .returns<{ shops: ManagedShop }[]>();

  return (
    <div className="space-y-3">
      {managedShops?.map((s) => {
        const shop = s.shops;
        return <ShopCard shop={shop} key={shop?.id} />;
      })}
    </div>
  );
};

export default ManageShops;
