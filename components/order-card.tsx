import { Order } from "@/constants/type";
import { createServerClient } from "@/supabase/clients/createServer";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";

const OrderCard = async ({ order }: { order: Order }) => {
  const supabase = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return <p>Not logged in!</p>;
  }

  const { data: membership_status, error: membershipError } = await supabase
    .from("memberships")
    .select()
    .eq("user_id", user?.id)
    .eq("shop_id", order.shops.id);

  const memStatus = membership_status != null;

  const displayPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(order.price);

  const getOrderStatus = () => {
    if (order.order_statuses.cancelled) {
      return {
        label: "Cancelled",
        color: "text-red-500",
        details: order.order_statuses.cancel_reason,
      };
    }
    if (order.order_statuses.received) {
      return {
        label: "Received",
        color: "text-green-500",
        details: `Received on ${new Date(order.order_statuses.received_at).toLocaleDateString()}`,
      };
    }
    if (order.order_statuses.paid) {
      return {
        label: "Paid",
        color: "text-blue-500",
      };
    }
    return {
      label: "Pending",
      color: "text-yellow-500",
    };
  };

  const status = getOrderStatus();
  return (
    <div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Order #{order.id}</CardTitle>
            <span className={`font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <CardDescription>
            {order.shops.name} ({order.shops.acronym})
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Image
                src={order.merchandises.merchandise_pictures[0].picture_url}
                alt={order.merchandises.name}
                width={20}
                height={20}
                className="h-20 w-20 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{order.variants.name}</h3>
                <p className="text-sm text-gray-500">
                  Quantity: {order.quantity}
                </p>
                <p className="mt-1 font-medium">{displayPrice}</p>
              </div>
            </div>

            {status.details && (
              <div className="text-sm text-gray-500">{status.details}</div>
            )}
          </div>
        </CardContent>

        <CardFooter className="text-sm text-gray-500">
          Order ID: {order.id}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderCard;
