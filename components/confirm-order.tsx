import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FullMerch } from "@/constants/type";
import { CreditCard, LoaderIcon, Upload, Wallet } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
        <DialogTitle className="text-2xl">Confirm Purchase</DialogTitle>
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative h-32 w-32">
                <Image
                  src={merch.merchandise_pictures[0].picture_url}
                  alt={merch.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold">{merch.name}</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    {merch.variant_name}: {merch.variants[selectedVariant].name}
                  </p>
                  <p>Quantity: {quantity}</p>
                </div>
                <p className="text-xl font-bold">
                  {getPrice(membership_status, quantity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 font-medium">Pickup Location</p>
            <p className="text-sm text-gray-600">
              {merch.receiving_information}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3 font-medium">Payment Method</p>
          <div className="space-y-3">
            {merch.physical_payment && (
              <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                <input
                  type="radio"
                  name={`payment`}
                  value="irl"
                  checked={paymentOption === "irl"}
                  onChange={() => {
                    setPaymentOption("irl");
                  }}
                  className="mr-3"
                />
                <Wallet className="mr-2 h-5 w-5" />
                <span>In-Person Payment</span>
              </label>
            )}

            {merch.online_payment && (
              <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                <input
                  type="radio"
                  name={`payment`}
                  value="online"
                  checked={paymentOption === "online"}
                  onChange={() => {
                    setPaymentOption("online");
                  }}
                  className="mr-3"
                />
                <CreditCard className="mr-2 h-5 w-5" />
                <span>GCash Payment</span>
              </label>
            )}
          </div>
        </div>

        {paymentOption === "online" && (
          <div className="flex justify-center gap-5 space-y-2">
            <div className="m mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                  <label
                    htmlFor={`gcash-receipt`}
                    className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                  >
                    <span>Upload GCash Receipt</span>
                    <input
                      id={`gcash-receipt`}
                      name={`gcash-receipt`}
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(e) => {
                        setPaymentReceipt(e.target.files?.[0] || null);
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
                  src={URL.createObjectURL(paymentReceipt)} // Create URL for the file
                  alt="Payment Receipt"
                  className="max-h-[200px] max-w-[200px] rounded-md object-contain"
                />
              </div>
            )}
          </div>
        )}

        {errMsg && (
          <div className="rounded-lg p-3 text-sm text-red-800">{errMsg}</div>
        )}

        <div className="mt-2">
          <Button
            onClick={handleOrderSubmit}
            disabled={
              paymentOption === "none" ||
              (paymentOption === "online" && paymentReceipt === null)
            }
            className="w-full"
          >
            {loading ? (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Purchase
          </Button>
        </div>
        {/* <CardContent className="space-y-6">
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
                (paymentOption === "online" && paymentReceipt === null)
              }
              className="w-full"
            >
              {loading ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Purchase
            </Button>
          </CardFooter>
        </Card> */}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
