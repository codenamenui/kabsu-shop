import { Order } from "@/constants/type";
import { createServerClient } from "@/supabase/clients/createServer";
import React from "react";
import OrderCard from "./order-card";

const Orders = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, quantity, price, merchandises(name, merchandise_pictures(picture_url)), variants(name), shops(name, acronym, id), order_statuses(paid, received, received_at, cancelled, cancelled_at, cancel_reason)",
    )
    .eq("user_id", user?.id)
    .returns<Order[]>();

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-2xl font-bold text-emerald-800">My Orders</div>
      {orders ? (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      ) : (
        <div>No Cart orders yet!</div>
      )}
    </div>
  );
};

export default Orders;
