import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Upload, Wallet, AlertCircle } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/supabase/clients/createClient";
import { CartOrder } from "@/constants/type";

// Group orders by shop
const groupOrdersByShop = (cart: CartOrder[]) => {
  return cart.reduce(
    (acc, order) => {
      const shopId = order.shops.id;
      if (!acc[shopId]) {
        acc[shopId] = {
          shop: order.shops,
          orders: [],
          totalPrice: 0,
        };
      }
      acc[shopId].orders.push(order);

      // Calculate total price for this order
      const variant = order.merchandises.variants.find(
        (v) => v.id === order.variant_id,
      );
      if (variant) {
        acc[shopId].totalPrice += variant.original_price * order.quantity;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        shop: CartOrder["shops"];
        orders: CartOrder[];
        totalPrice: number;
      }
    >,
  );
};

const ShopOrderConfirmCard = ({
  shopOrders,
  paymentUpdate,
}: {
  shopOrders: {
    shop: CartOrder["shops"];
    orders: CartOrder[];
    totalPrice: number;
  };
  paymentUpdate: (
    shopId: string,
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
        .eq("shop_id", shopOrders.shop.id);

      setMembership(error != null);
    };
    getStatus();
  }, [shopOrders.shop.id]);

  const displayTotalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(shopOrders.totalPrice);

  // Check if all shop orders support online/physical payment
  const supportsPhysicalPayment = shopOrders.orders.every(
    (order) => order.merchandises.physical_payment,
  );
  const supportsOnlinePayment = shopOrders.orders.every(
    (order) => order.merchandises.online_payment,
  );

  return (
    <div className="space-y-6 border-b pb-6">
      {/* Shop Header */}
      <div className="mb-4 flex items-center gap-3">
        <img
          src={shopOrders.shop.logo_url}
          alt={shopOrders.shop.acronym}
          className="h-10 w-10 rounded-full"
        />
        <h2 className="text-lg font-bold">{shopOrders.shop.acronym}</h2>
      </div>

      {/* Orders for this Shop */}
      {shopOrders.orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative h-32 w-32">
                <Image
                  src={order.merchandises.merchandise_pictures[0].picture_url}
                  alt={order.merchandises.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold">{order.merchandises.name}</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    {order.merchandises.variant_name}:
                    {
                      order.merchandises.variants.find(
                        (v) => v.id === order.variant_id,
                      )?.name
                    }
                  </p>
                  <p>Quantity: {order.quantity}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Total Price */}
      <div className="text-right text-xl font-bold">
        Total: {displayTotalPrice}
      </div>

      {/* Payment Method */}
      <div>
        <p className="mb-3 font-medium">Payment Method</p>
        <div className="space-y-3">
          {supportsPhysicalPayment && (
            <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
              <input
                type="radio"
                name={`payment-${shopOrders.shop.id}`}
                value="irl"
                checked={paymentOption === "irl"}
                onChange={() => {
                  setPaymentOption("irl");
                  paymentUpdate(
                    shopOrders.shop.id.toString(),
                    "irl",
                    paymentReceipt,
                  );
                }}
                className="mr-3"
              />
              <Wallet className="mr-2 h-5 w-5" />
              <span>In-Person Payment</span>
            </label>
          )}

          {supportsOnlinePayment && (
            <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
              <input
                type="radio"
                name={`payment-${shopOrders.shop.id}`}
                value="online"
                checked={paymentOption === "online"}
                onChange={() => {
                  setPaymentOption("online");
                  paymentUpdate(
                    shopOrders.shop.id.toString(),
                    "online",
                    paymentReceipt,
                  );
                }}
                className="mr-3"
              />
              <CreditCard className="mr-2 h-5 w-5" />
              <span>GCash Payment</span>
            </label>
          )}
        </div>
      </div>

      {/* GCash Receipt Upload */}
      {paymentOption === "online" && (
        <div className="flex justify-center gap-5 space-y-2">
          <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                <label
                  htmlFor={`gcash-receipt-${shopOrders.shop.id}`}
                  className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                >
                  <span>
                    Upload GCash Receipt for All {shopOrders.shop.acronym}{" "}
                    Orders
                  </span>
                  <input
                    id={`gcash-receipt-${shopOrders.shop.id}`}
                    name={`gcash-receipt-${shopOrders.shop.id}`}
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPaymentReceipt(file);
                      paymentUpdate(
                        shopOrders.shop.id.toString(),
                        paymentOption,
                        file,
                      );
                    }}
                    required
                  />
                </label>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
          {paymentReceipt && (
            <div className="mt-4 flex justify-center">
              <img
                src={URL.createObjectURL(paymentReceipt)}
                alt="Payment Receipt"
                className="max-h-[200px] max-w-[200px] rounded-md object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CartOrderConfirmation = ({
  cart,
  selectedOrders,
  paymentUpdate,
  handleOrderSubmit,
  errMsg,
}: {
  cart: CartOrder[];
  selectedOrders: string[];
  paymentUpdate: (
    shopId: string,
    paymentOption: string,
    paymentReceipt?: File,
  ) => void;
  handleOrderSubmit: () => void;
  errMsg?: string;
}) => {
  // Filter and group selected orders
  const filteredCart = cart.filter((order) =>
    selectedOrders.includes(order.id.toString()),
  );
  const groupedOrders = groupOrdersByShop(filteredCart);

  return (
    <div className="space-y-6">
      {Object.values(groupedOrders).map((shopOrders) => (
        <ShopOrderConfirmCard
          key={shopOrders.shop.id}
          shopOrders={shopOrders}
          paymentUpdate={paymentUpdate}
        />
      ))}

      {errMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          {errMsg}
        </div>
      )}

      <Button
        onClick={handleOrderSubmit}
        // disabled={Object.values(groupedOrders).some((shopOrders) => {
        //   // Check if any shop lacks a payment option
        //   const shopId = shopOrders.shop.id.toString();
        //   const payment = orderPayments[shopId];
        //   return (
        //     !payment ||
        //     payment.paymentOption === "none" ||
        //     (payment.paymentOption === "online" && !payment.paymentReceipt)
        //   );
        // })}
        className="mt-6 w-full"
        size="lg"
        variant="default"
      >
        Confirm Purchase
      </Button>
    </div>
  );
};

export default CartOrderConfirmation;
