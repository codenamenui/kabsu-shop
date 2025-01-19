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
import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Keep all the existing interfaces and helper functions exactly the same
interface TransactionDetails {
  mobileNumber: string | null;
  amount: string | null;
  referenceNumber: string | null;
  date: string | null;
}

function extractTransactionDetails(text: string): TransactionDetails {
  // Keep the existing implementation exactly the same
  const mobileNumberMatch = text.match(/\+63\s*\d{3}\s*\d{3}\s*\d{4}/);
  const mobileNumber = mobileNumberMatch ? mobileNumberMatch[0] : null;

  const amountMatch = text.match(/Amount\s*(\d{1,3}(?:,\d{3})*\.\d{2})/);
  const amount = amountMatch ? amountMatch[1] : null;

  const refNoMatch = text.match(/Ref\s*No\.\s*(\d{4}\s*\d{3}\s*\d{6})/);
  const referenceNumber = refNoMatch ? refNoMatch[1] : null;

  const dateMatch = text.match(/(\w{3}\s*\d{2},\s*\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  return { mobileNumber, amount, referenceNumber, date };
}

const Cart = () => {
  // Keep all the existing state and hooks exactly the same
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
  const [isLoading, setIsLoading] = useState(true);

  // Keep all the existing useEffect and handlers exactly the same
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true); // Set loading state when fetching
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
      setIsLoading(false); // Clear loading state after data is fetched
    };
    getData();
  }, []);

  // Keep all other handlers and functions exactly the same
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
    // Keep all the existing implementation exactly the same
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
    if (paymentOption === "irl") {
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

      const { error: notificationError2 } = await supabase
        .from("shop_notifications")
        .insert([
          {
            order_id: data.id,
            shop_id: order.shops.id,
            message: "You have a new order!",
            seen: false,
          },
        ]);

      console.log(notificationError2);

      return true;
    }

    const worker = await createWorker("eng", 1, {
      logger: (m) => console.log(m),
    });
    const {
      data: { text },
    } = await worker.recognize(paymentReceipt);
    const details = extractTransactionDetails(text);

    if (
      !details.mobileNumber ||
      !details.amount ||
      !details.referenceNumber ||
      !details.date
    ) {
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
      const { error: notificationError1 } = await supabase
        .from("shop_notifications")
        .insert([
          {
            order_id: data.id,
            shop_id: order.shops.id,
            message: "You have a new order!",
            seen: false,
          },
        ]);
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              My Shopping Cart
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {cart.length} items in cart
          </div>
        </div>

        {isLoading ? (
          <Card className="flex h-full min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-gray-500">Loading your cart...</p>
            </div>
          </Card>
        ) : cart && cart.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {Object.entries(
                  cart.reduce(
                    (acc, item) => {
                      const acronym = item.shops.acronym;
                      if (!acc[acronym]) acc[acronym] = [];
                      acc[acronym].push(item);
                      return acc;
                    },
                    {} as Record<string, CartOrder[]>,
                  ),
                ).map(([acronym, items]) => (
                  <Card key={acronym} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="border-b border-gray-100 bg-white p-4">
                        <CartShopDisplay acronym={acronym} items={items} />
                      </div>
                      <div className="divide-y divide-gray-100">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:h-fit">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Order Summary</h2>
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Selected Items</span>
                      <span className="font-medium">
                        {selectedOrders.length}
                      </span>
                    </div>
                    <Dialog
                      open={openConfirmation}
                      onOpenChange={setOpenConfirmation}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          size="lg"
                          disabled={selectedOrders.length === 0}
                        >
                          Proceed to Checkout
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Confirm Your Purchase
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {selectedOrders?.map((id) => {
                            const order = cart.find(
                              (o) => o.id.toString() === id,
                            );
                            return (
                              <CartOrderConfirmCard
                                key={id}
                                order={order}
                                paymentUpdate={paymentUpdate}
                              />
                            );
                          })}
                        </div>
                        {errMsg && (
                          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            {errMsg}
                          </div>
                        )}
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
                          className="mt-6 w-full"
                          size="lg"
                          variant="default"
                        >
                          Confirm Purchase
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-500">
              Looks like you haven't added any items to your cart yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cart;