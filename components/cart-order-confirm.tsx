"use client";

import { CartOrder } from "@/constants/type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/clients/createClient";

const CartOrderConfirmCard = ({
  order,
  paymentUpdate,
}: {
  order: CartOrder;
  paymentUpdate: (
    orderId: string,
    paymentOption: string,
    paymentReceipt?: File,
  ) => void;
}) => {
  const [membership, setMembership] = useState<boolean>(false);
  const [paymentOption, setPaymentOption] = useState<string>("none");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

  useEffect(() => {
    const getStatus = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("memberships")
        .select()
        .eq("user_id", user?.id)
        .eq("shop_id", order.shops.id);

      setMembership(error != null);
    };
    getStatus();
  }, [order.shops.id]);

  const merch = order.merchandises;
  const selectedVariant = merch.variants.findIndex(
    (variant) => variant.id === order.variant_id,
  );

  const getPrice = (discount: boolean, quantity?: number) => {
    const variant = merch.variants[selectedVariant];
    const price = discount ? variant.membership_price : variant.original_price;
    const displayPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(price * (quantity || order.quantity));
    return displayPrice;
  };

  return (
    <div>
      <DialogHeader>
        <div className="flex gap-4">
          <div>
            <Image
              src={merch.merchandise_pictures[0].picture_url}
              alt={merch.name}
              width={150}
              height={150}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold">{merch.name}</p>
            <p>
              <span className="font-semibold">{merch.variant_name}:</span>{" "}
              {merch.variants[selectedVariant].name}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span> {order.quantity}
            </p>
            <p>
              <span className="font-semibold">Price: </span>
              {getPrice(membership)}
            </p>
          </div>
        </div>
        <p>
          <span className="font-semibold">Pick up at:</span>{" "}
          {merch.receiving_information}
        </p>

        <div className="flex flex-col space-y-2">
          {merch.physical_payment && (
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`payment-${order.id}`}
                value="irl"
                checked={paymentOption === "irl"}
                onChange={() => {
                  setPaymentOption("irl");
                  paymentUpdate(order.id.toString(), "irl", paymentReceipt);
                }}
                className="mr-2"
              />
              <span>In-Person Payment</span>
            </label>
          )}

          {merch.online_payment && (
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`payment-${order.id}`}
                value="online"
                checked={paymentOption === "online"}
                onChange={() => {
                  setPaymentOption("online");
                  paymentUpdate(order.id.toString(), "online", paymentReceipt);
                }}
                className="mr-2"
              />
              <span>GCash Payment</span>
            </label>
          )}

          {paymentOption === "online" && (
            <div className="space-y-2">
              <Label
                htmlFor={`gcash-receipt-${order.id}`}
                className="font-semibold"
              >
                GCash Receipt
              </Label>
              <Input
                id={`gcash-receipt-${order.id}`}
                type="file"
                onChange={(e) => {
                  setPaymentReceipt(e.target.files?.[0] || null);
                  paymentUpdate(
                    order.id.toString(),
                    paymentOption,
                    e.target.files?.[0],
                  );
                }}
                accept="image/*"
                required
              />
            </div>
          )}
        </div>
      </DialogHeader>
    </div>
  );
};

export default CartOrderConfirmCard;
