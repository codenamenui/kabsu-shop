import React from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import { BadgeCheck, ShoppingCart } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import OrderCard from "./order-card";
import { Order } from "@/constants/type";

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
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">My Orders</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          View and track your order history
        </p>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-600">
              Error loading orders: {error.message}
            </p>
          </Card>
        )}

        {!orders || orders.length === 0 ? (
          <Card className="bg-gray-50 py-12">
            <div className="text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                You haven't placed any orders yet
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
