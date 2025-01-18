"use client";

import React, { useEffect } from "react";
import { BadgeCheck, ShoppingCart, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import OrderCard from "./order-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Order } from "@/constants/type";
import { createClient } from "@/supabase/clients/createClient";

const Orders = () => {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          "id, quantity, price, merchandises(name, merchandise_pictures(picture_url)), variants(name), shops(name, acronym, id), order_statuses(paid, received, received_at, cancelled, cancelled_at, cancel_reason)",
        )
        .eq("user_id", user?.id)
        .returns();

      setOrders(orders);
      setError(error);
    };
    getData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                My Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View and track your order history
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading orders: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {!orders || orders.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="mb-4 h-12 w-12 text-gray-400" />
              <CardTitle className="mb-2 text-xl">No orders yet</CardTitle>
              <CardDescription>
                When you place orders, they will appear here
              </CardDescription>
            </Card>
          ) : (
            <div className="flex flex-col space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
