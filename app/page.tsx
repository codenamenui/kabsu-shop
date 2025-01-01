import Categories from "@/components/homepage/categories-bar";
import Welcome from "@/components/homepage/greetings-bar";
import Shops from "@/components/homepage/shops-bar";
import { createServerClient } from "@/supabase/clients/createServer";
import { getUser } from "@/supabase/getUser";
import React from "react";

export default async function Home() {
  const supabase = createServerClient();
  const user = await getUser(supabase);
  return (
    <div className="flex flex-col">
      <Welcome user={user} />
      <Categories />
      <Shops />
    </div>
  );
}
