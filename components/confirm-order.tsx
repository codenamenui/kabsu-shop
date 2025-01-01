import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { FullMerch } from "@/constants/type";
import { LoaderIcon } from "lucide-react";

const ConfirmOrderDialog = ({
  openConfirmation,
  setOpenConfirmation,
  merch,
  paymentOption,
  setPaymentOption,
  setPaymentReceipt,
  selectedVariant,
  getPrice,
  quantity,
  handleOrderSubmit,
  paymentReceipt,
  membership_status,
  errMsg,
  loading,
}: {
  openConfirmation: boolean;
  setOpenConfirmation: (e: boolean) => void;
  merch: FullMerch;
  paymentOption: string;
  setPaymentOption: (e: string) => void;
  setPaymentReceipt: (e: File | null) => void;
  selectedVariant: number;
  getPrice: (discount: boolean, quantity?: number) => string;
  quantity: number;
  handleOrderSubmit: () => void;
  paymentReceipt: File | null;
  membership_status: boolean;
  errMsg: string;
  loading: boolean;
}) => {
  return (
    <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
      <DialogContent className="max-w-lg">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Confirm Purchase</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={merch.merchandise_pictures[0].picture_url}
                  alt={merch.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold">{merch.name}</p>
                <p>
                  <span className="font-semibold">{merch.variant_name}:</span>{" "}
                  {merch.variants[selectedVariant].name}
                </p>
                <p>
                  <span className="font-semibold">Quantity:</span> {quantity}
                </p>
                <p>
                  <span className="font-semibold">Price: </span>
                  {getPrice(membership_status, quantity)}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Pick up at:</span>{" "}
                {merch.receiving_information}
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold">Payment Method</p>
              <div className="space-y-2">
                {merch.physical_payment && (
                  <label className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      value=""
                      checked={paymentOption === "irl"}
                      onChange={() => setPaymentOption("irl")}
                      className="h-4 w-4"
                    />
                    <span>In-Person Payment</span>
                  </label>
                )}

                {merch.online_payment && (
                  <label className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      value=""
                      checked={paymentOption === "online"}
                      onChange={() => setPaymentOption("online")}
                      className="h-4 w-4"
                    />
                    <span>GCash Payment</span>
                  </label>
                )}
              </div>
            </div>

            {paymentOption === "online" && (
              <div className="space-y-2">
                <Label htmlFor="gcash-receipt" className="font-semibold">
                  GCash Receipt
                </Label>
                <Input
                  id="gcash-receipt"
                  type="file"
                  onChange={(e) =>
                    setPaymentReceipt(e.target.files?.[0] || null)
                  }
                  accept="image/*"
                  required
                  className="cursor-pointer"
                />
              </div>
            )}

            {errMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {errMsg}
              </div>
            )}
          </CardContent>

          <CardFooter className="mt-2">
            <Button
              onClick={handleOrderSubmit}
              disabled={
                paymentOption === "none" ||
                (paymentOption === "online" && paymentReceipt === null) ||
                loading
              }
              className="w-full"
            >
              {loading ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Purchase
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
