"use client";

import { createClient } from "@/supabase/clients/createClient";

// Type definitions for dashboard data
type ShopOverview = {
  id: number;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
};

type OrderStatus = {
  status: string;
  count: number;
  totalRevenue: number;
};

type TopSellingMerchandise = {
  id: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
};

type CollegeOrderSummary = {
  collegeId: number;
  collegeName: string;
  totalOrders: number;
  totalRevenue: number;
};

export async function fetchAdminDashboardData(shopId?: number) {
  const supabase = createClient();

  // Shop Overview
  const { data: shopOverviewData, error: shopOverviewError } = await supabase
    .from("shops")
    .select(
      `
      id,
      name,
      orders (
        id,
        price,
        order_statuses (
          paid,
          received,
          cancelled
        )
      )
    `,
    )
    .eq("id", shopId);

  // Order Status Summary
  const { data: orderStatusData, error: orderStatusError } = await supabase
    .from("orders")
    .select(
      `
      price,
      order_statuses (
        paid,
        received,
        cancelled
      )
    `,
    )
    .eq("shop_id", shopId);

  // Top Selling Merchandise
  const { data: topSellingData, error: topSellingError } = await supabase
    .from("orders")
    .select(
      `
      merchandises (
        id,
        name
      ),
      quantity,
      price
    `,
    )
    .eq("shop_id", shopId)
    .order("quantity", { ascending: false })
    .limit(5);

  // College Order Summary
  const { data: collegeOrderData, error: collegeOrderError } = await supabase
    .from("orders")
    .select(
      `
      price,
      quantity,
      profiles (
        colleges (
          id,
          name
        )
      )
    `,
    )
    .eq("shop_id", shopId);

  // Process and transform data
  const shopOverview: ShopOverview[] =
    shopOverviewData?.map((shop) => ({
      id: shop.id,
      name: shop.name,
      totalOrders: shop.orders.length,
      totalRevenue: shop.orders.reduce((sum, order) => sum + order.price, 0),
      pendingOrders: shop.orders.filter(
        (order) =>
          !order.order_statuses?.paid &&
          !order.order_statuses?.received &&
          !order.order_statuses?.cancelled,
      ).length,
    })) || [];

  const orderStatus: OrderStatus[] = [
    {
      status: "Pending",
      count:
        orderStatusData?.filter(
          (order) =>
            !order.order_statuses?.paid &&
            !order.order_statuses?.received &&
            !order.order_statuses?.cancelled,
        ).length || 0,
      totalRevenue:
        orderStatusData
          ?.filter(
            (order) =>
              !order.order_statuses?.paid &&
              !order.order_statuses?.received &&
              !order.order_statuses?.cancelled,
          )
          .reduce((sum, order) => sum + order.price, 0) || 0,
    },
    {
      status: "Paid",
      count:
        orderStatusData?.filter((order) => order.order_statuses?.paid).length ||
        0,
      totalRevenue:
        orderStatusData
          ?.filter((order) => order.order_statuses?.paid)
          .reduce((sum, order) => sum + order.price, 0) || 0,
    },
    {
      status: "Received",
      count:
        orderStatusData?.filter((order) => order.order_statuses?.received)
          .length || 0,
      totalRevenue:
        orderStatusData
          ?.filter((order) => order.order_statuses?.received)
          .reduce((sum, order) => sum + order.price, 0) || 0,
    },
    {
      status: "Cancelled",
      count:
        orderStatusData?.filter((order) => order.order_statuses?.cancelled)
          .length || 0,
      totalRevenue:
        orderStatusData
          ?.filter((order) => order.order_statuses?.cancelled)
          .reduce((sum, order) => sum + order.price, 0) || 0,
    },
  ];

  const topSellingMerchandise: TopSellingMerchandise[] =
    topSellingData?.map((order) => ({
      id: order.merchandises.id,
      name: order.merchandises.name,
      totalQuantity: order.quantity,
      totalRevenue: order.price * order.quantity,
    })) || [];

  const collegeOrderSummary: CollegeOrderSummary[] = Object.values(
    collegeOrderData?.reduce(
      (acc, order) => {
        const collegeId = order.profiles?.colleges?.id;
        const collegeName = order.profiles?.colleges?.name;

        if (collegeId && collegeName) {
          if (!acc[collegeId]) {
            acc[collegeId] = {
              collegeId,
              collegeName,
              totalOrders: 0,
              totalRevenue: 0,
            };
          }

          acc[collegeId].totalOrders += order.quantity;
          acc[collegeId].totalRevenue += order.price * order.quantity;
        }

        return acc;
      },
      {} as Record<number, CollegeOrderSummary>,
    ) || {},
  );

  return {
    shopOverview,
    orderStatus,
    topSellingMerchandise,
    collegeOrderSummary,
  };
}
