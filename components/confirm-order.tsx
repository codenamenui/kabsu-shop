import React from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
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
                <span className="font-semibold">Quantity:</span> {quantity}
              </p>
              <p>
                <span className="font-semibold">Price: </span>
                {getPrice(membership_status, quantity)}
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
                  value=""
                  checked={paymentOption === "irl"}
                  onChange={() => setPaymentOption("irl")}
                  className="mr-2"
                />
                <span>In-Person Payment</span>
              </label>
            )}

            {merch.online_payment && (
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value=""
                  checked={paymentOption === "online"}
                  onChange={() => setPaymentOption("online")}
                  className="mr-2"
                />
                <span>GCash Payment</span>
              </label>
            )}

            {paymentOption == "online" && (
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
                />
              </div>
            )}
          </div>
          <p className="text-red-800">{errMsg}</p>

          <Button
            onClick={handleOrderSubmit}
            disabled={
              paymentOption == "none" ||
              (paymentOption == "online" && paymentReceipt == null)
            }
            className="w-full"
          >
            {loading && <LoaderIcon className="animate-spin" />}
            Confirm Purchase
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
