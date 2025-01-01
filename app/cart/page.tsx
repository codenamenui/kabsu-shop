"use client";

import CartOrderConfirmCard from "@/components/cart-order-confirm";
import CartOrderDisplay from "@/components/cart-orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CartOrder } from "@/constants/type";
import { createClient } from "@/supabase/clients/createClient";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CartShopDisplay from "@/components/cart-shop-display";
import { createWorker } from "tesseract.js";

interface TransactionDetails {
  mobileNumber: string | null;
  amount: string | null;
  referenceNumber: string | null;
  date: string | null;
}

function extractTransactionDetails(text: string): TransactionDetails {
  // Extract mobile number (starts with +63)
  // const mobileNumberMatch = text.match(/\+63\s*\d{3}\s*\d{7}/);
  const mobileNumberMatch = text.match(/\+63\s*\d{3}\s*\d{3}\s*\d{4}/);
  const mobileNumber = mobileNumberMatch ? mobileNumberMatch[0] : null;

  // Extract amount
  const amountMatch = text.match(/Amount\s*(\d{1,3}(?:,\d{3})*\.\d{2})/);
  const amount = amountMatch ? amountMatch[1] : null;

  // Extract reference number
  const refNoMatch = text.match(/Ref\s*No\.\s*(\d{4}\s*\d{3}\s*\d{6})/);
  const referenceNumber = refNoMatch ? refNoMatch[1] : null;

  // Extract date
  const dateMatch = text.match(/(\w{3}\s*\d{2},\s*\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  return {
    mobileNumber,
    amount,
    referenceNumber,
    date,
  };
}

const Cart = () => {
  const [cart, setCart] = useState<CartOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orderPayments, setOrderPayments] = useState<{
    [orderId: string]: {
      paymentOption: string;
      paymentReceipt?: File;
    };
  }>({});
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: cart, error } = await supabase
        .from("cart_orders")
        .select(
          `
          id,
          user_id,
          quantity,
          variant_id,
          merchandises(id, name, online_payment, physical_payment, receiving_information, variant_name, merchandise_pictures(picture_url), variants(id, name, picture_url, original_price, membership_price)),
          shops(id, acronym, logo_url)
        `,
        )
        .eq("user_id", user?.id)
        .returns<CartOrder[]>();
      setCart(
        cart?.sort((a, b) => a.shops.acronym.localeCompare(b.shops.acronym)) ??
          [],
      );
    };
    getData();
  }, []);

  const handleCheckboxChange = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }
      return [...prev, orderId];
    });
  };

  const paymentUpdate = (
    orderId: string,
    paymentOption: string,
    paymentReceipt?: File,
  ) => {
    setOrderPayments((prev) => ({
      ...prev,
      [orderId]: { paymentOption, paymentReceipt },
    }));
  };

  const submitOrder = async (
    order: CartOrder,
    paymentOption: string,
    paymentReceipt?: File,
  ) => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return false;
    }

    const { data: membership, error: mem_error } = await supabase
      .from("memberships")
      .select();

    const variant = order.merchandises.variants.find(
      (v) => v.id === order.variant_id,
    );
    let price =
      mem_error != null ? variant?.membership_price : variant?.original_price;

    price *= order.quantity;
    if (paymentOption === "irl" && !paymentReceipt) {
      const {
        data: { id: status_id },
        error: statusError,
      } = await supabase
        .from("order_statuses")
        .insert([{ paid: false }])
        .select()
        .single();

      if (statusError) {
        console.error(statusError);
        return false;
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            quantity: order.quantity,
            online_payment: paymentOption == "online",
            physical_payment: paymentOption == "irl",
            variant_id: order.variant_id,
            merch_id: order.merchandises.id,
            shop_id: order.shops.id,
            status_id: status_id,
            price: price,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        return false;
      }

      const { error: cart_error } = await supabase
        .from("cart_orders")
        .delete()
        .eq("id", order.id);

      setCart(
        (prevOrders) => prevOrders?.filter((o) => o.id !== order.id) || [],
      );
      setSelectedOrders(
        (prevOrders) =>
          prevOrders?.filter((o) => o !== order.id.toString()) || [],
      );

      return true;
    }
    const worker = await createWorker("eng", 1, {
      logger: (m) => console.log(m), // Add logger here
    });
    const {
      data: { text },
    } = await worker.recognize(paymentReceipt);
    const details = extractTransactionDetails(text);

    console.log("Mobile Number:", details.mobileNumber);
    console.log("Amount:", Number(details.amount?.replace(",", "")));
    console.log("Reference Number:", details.referenceNumber);
    console.log("Date:", details.date);

    if (
      !details.mobileNumber ||
      !details.amount ||
      !details.referenceNumber ||
      !details.date
    ) {
      console.log("HERRE");
      setErrMsg("Invalid receipt");
      return false;
    }

    const insert = async () => {
      if (paymentOption == "online") {
        if (paymentReceipt == null) {
          return false;
        }
      }

      const {
        data: { id: status_id },
        error: statusError,
      } = await supabase
        .from("order_statuses")
        .insert([{ paid: true }])
        .select()
        .single();

      if (statusError) {
        console.error(statusError);
        return false;
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            quantity: order.quantity,
            online_payment: paymentOption == "online",
            physical_payment: paymentOption == "irl",
            variant_id: order.variant_id,
            merch_id: order.merchandises.id,
            shop_id: order.shops.id,
            status_id: status_id,
            price: price,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        return false;
      }

      if (paymentOption == "online") {
        const url = `payment_${data.id}_${Date.now()}`;
        const { error: storageError } = await supabase.storage
          .from("payment-picture")
          .upload(url, paymentReceipt);

        if (storageError) {
          console.error(storageError);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("payment-picture").getPublicUrl(url);

        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert([{ picture_url: publicUrl, order_id: data.id }]);

        if (paymentError) {
          console.error(paymentError);
          return false;
        }
      }
      const { error: errorReceipt } = await supabase
        .from("receipts")
        .insert([
          {
            order_id: data.id,
            mobile_number: details.mobileNumber,
            amount: parseFloat(details.amount?.replace(",", "") || ""),
            reference_number: details.referenceNumber,
          },
        ])
        .select();

      console.log(errorReceipt);
      const { error: cart_error } = await supabase
        .from("cart_orders")
        .delete()
        .eq("id", order.id);

      setCart(
        (prevOrders) => prevOrders?.filter((o) => o.id !== order.id) || [],
      );
      setSelectedOrders(
        (prevOrders) =>
          prevOrders?.filter((o) => o !== order.id.toString()) || [],
      );
    };
    insert();
    setErrMsg("");
    return true;
  };

  const handleOrderSubmit = async () => {
    selectedOrders.forEach((orderId) => {
      const order = cart.find((o) => o.id.toString() === orderId);
      if (!order) return;
      console.log(order);

      const confirmation = submitOrder(
        order,
        orderPayments[orderId].paymentOption,
        orderPayments[orderId].paymentReceipt,
      );
      setOpenConfirmation(confirmation);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold text-emerald-800">My Shopping Cart</h1>

      <form className="w-full max-w-3xl space-y-4">
        {cart ? (
          <div className="flex flex-col gap-2">
            {Object.entries(
              cart.reduce(
                (acc, item) => {
                  const acronym = item.shops.acronym;
                  if (!acc[acronym]) {
                    acc[acronym] = [];
                  }
                  acc[acronym].push(item);
                  return acc;
                },
                {} as Record<string, CartOrder[]>,
              ),
            ).map(([acronym, items]) => (
              <div
                key={acronym}
                className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
              >
                <CartShopDisplay acronym={acronym} items={items} />

                <div className="space-y-2 p-2">
                  {items.map((item) => (
                    <CartOrderDisplay
                      key={item.id}
                      order={item}
                      selectedOrders={selectedOrders}
                      handleCheckboxChange={handleCheckboxChange}
                      setCart={setCart}
                    />
                  ))}
                </div>
              </div>
            ))}
            <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={selectedOrders.length === 0}
                  onClick={() => {
                    setOpenConfirmation(!openConfirmation);
                  }}
                >
                  Checkout ({selectedOrders.length} items)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Confirm Purchase</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {selectedOrders?.map((id) => {
                    const order = cart.find((o) => o.id.toString() === id);
                    return (
                      <CartOrderConfirmCard
                        key={id}
                        order={order}
                        paymentUpdate={paymentUpdate}
                      />
                    );
                  })}
                </div>
                <p className="text-red-800">{errMsg}</p>
                <Button
                  onClick={handleOrderSubmit}
                  disabled={selectedOrders.some((id) => {
                    const payment = orderPayments[id];
                    return (
                      !payment ||
                      payment.paymentOption === "none" ||
                      (payment.paymentOption === "online" &&
                        !payment.paymentReceipt)
                    );
                  })}
                  className="w-full"
                >
                  Confirm Purchase
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div>No cart orders found!</div>
        )}
      </form>
    </div>
  );
};

export default Cart;
