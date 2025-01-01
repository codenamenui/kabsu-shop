"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Orders } from "@/constants/type";
import React from "react";
import { handleOrderAction } from "./actions";

const Received = ({
  order,
  setOrders,
}: {
  order: Orders;
  setOrders: React.Dispatch<React.SetStateAction<Orders[]>>;
}) => {
  const handleSubmit = (event: any) => {
    event.preventDefault(); // Prevents the default form submission behavior
    handleOrderAction(order, "receive", setOrders);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Button type="submit" variant="outline">
          Mark as Received
        </Button>
      </form>
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">No, Keep Order</Button>
            </DialogClose>
            <form
              onSubmit={() => handleOrderAction(order, "cancel", setOrders)}
            >
              <Button type="submit" variant="destructive">
                Yes, Cancel Order
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Received;
