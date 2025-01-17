import React from "react";
import Image from "next/image";
import { createServerClient } from "@/supabase/clients/createServer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package, XCircle, CheckCircle } from "lucide-react";
import { Order } from "@/constants/type";

const OrderCard = async ({ order }: { order: Order }) => {
  const supabase = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return (
      <Card className="w-full border-red-200 bg-red-50 p-4">
        <p className="text-red-600">Not logged in!</p>
      </Card>
    );
  }

  const { data: membership_status } = await supabase
    .from("memberships")
    .select()
    .eq("user_id", user?.id)
    .eq("shop_id", order.shops.id);

  const displayPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(order.price);

  const getOrderStatus = () => {
    if (order.order_statuses.cancelled) {
      return {
        label: "Cancelled",
        color: "text-red-500",
        icon: XCircle,
        details: order.order_statuses.cancel_reason,
      };
    }
    if (order.order_statuses.received) {
      return {
        label: "Received",
        color: "text-green-500",
        icon: CheckCircle,
        details: `Received on ${new Date(order.order_statuses.received_at).toLocaleDateString()}`,
      };
    }
    if (order.order_statuses.paid) {
      return {
        label: "Paid",
        color: "text-blue-500",
        icon: Package,
      };
    }
    return {
      label: "Pending",
      color: "text-yellow-500",
      icon: Clock,
    };
  };

  const status = getOrderStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full transition-colors hover:bg-gray-50">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Order #{order.id}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {order.shops.name}{" "}
            {order.shops.acronym && `(${order.shops.acronym})`}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Image
              src={order.merchandises.merchandise_pictures[0].picture_url}
              alt={order.merchandises.name}
              width={80}
              height={80}
              className="rounded-md object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium">{order.merchandises.name}</h3>
              <p className="text-sm text-muted-foreground">
                Variant: {order.variants.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Quantity: {order.quantity}
              </p>
              <p className="mt-1 font-medium">{displayPrice}</p>
            </div>
          </div>

          {status.details && (
            <p className="text-sm text-muted-foreground">{status.details}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
