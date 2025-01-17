import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { deleteMerch } from "@/app/manage-shop/[shopId]/actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Package,
  ShoppingBag,
  Users,
  BarChart,
  Settings,
  Plus,
  Store,
} from "lucide-react";
import { Merch, ShopManagementType } from "@/constants/type";
import ToggleReadyButton from "./toggle";

const ShopManagement = async ({ params }: { params: { shopId: string } }) => {
  const supabase = createServerComponentClient({ cookies });

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select(
      "id, name, email, socmed_url, logo_url, colleges(id, name), acronym",
    )
    .eq("id", params.shopId)
    .returns<ShopManagementType>()
    .single();

  if (shopError || !shop) {
    return <div>Shop not found</div>;
  }

  const { data: merchs, error: merchError } = await supabase
    .from("merchandises")
    .select(
      `
      id, 
      name, 
      created_at,
      merchandise_pictures(picture_url), 
      variants(original_price, membership_price), 
      shops!inner(id, name, acronym)
    `,
    )
    .eq("shop_id", params.shopId)
    .returns<Merch[]>();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Shop Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt={shop.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                <Store className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <p className="text-gray-500">{shop.colleges?.name}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex w-full justify-center">
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-6 lg:grid-cols-6">
            {[
              {
                icon: <Package className="h-5 w-5" />,
                label: "Add Merchandise",
                href: `/manage-shop/${params.shopId}/merch/new`,
                color: "bg-blue-500",
              },
              {
                icon: <BarChart className="h-5 w-5" />,
                label: "Dashboard",
                href: `/manage-shop/${params.shopId}/dashboard`,
                color: "bg-indigo-500",
              },
              {
                icon: <ShoppingBag className="h-5 w-5" />,
                label: "Orders",
                href: `/manage-shop/${params.shopId}/order`,
                color: "bg-purple-500",
              },
              {
                icon: <Users className="h-5 w-5" />,
                label: "Members",
                href: `/manage-shop/${params.shopId}/membership`,
                color: "bg-green-500",
              },
              {
                icon: <Users className="h-5 w-5" />,
                label: "Officers",
                href: `/manage-shop/${params.shopId}/officer`,
                color: "bg-blue-500",
              },
              {
                icon: <Settings className="h-5 w-5" />,
                label: "Settings",
                href: `/manage-shop/${params.shopId}/profile`,
                color: "bg-orange-500",
              },
            ].map((action) => (
              <Link key={action.label} href={action.href} className="block">
                <Card className="flex items-center justify-center transition-all hover:scale-105 hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6">
                    <div
                      className={`mb-3 rounded-full ${action.color} p-3 text-white`}
                    >
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Merchandise Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Merchandise</CardTitle>
            <Button asChild>
              <Link href={`/manage-shop/${params.shopId}/merch/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {merchs?.map((merch) => (
                <MerchCard
                  key={merch.id}
                  merch={merch}
                  shopId={params.shopId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MerchCard = ({ merch, shopId }: { merch: Merch; shopId: string }) => {
  const originalPrice = Math.min(
    ...merch.variants.map((v) => v.original_price ?? 0),
  );
  const membershipPrice = Math.min(
    ...merch.variants.map((v) => v.membership_price ?? 0),
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square">
        {merch.merchandise_pictures?.[0]?.picture_url ? (
          <Image
            src={merch.merchandise_pictures[0].picture_url}
            alt={merch.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 font-medium">{merch.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formatPrice(originalPrice)}
          </span>
          <span className="font-medium text-green-600">
            {formatPrice(membershipPrice)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t p-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/manage-shop/${shopId}/merch/${merch.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <ToggleReadyButton merchId={merch.id} />
        <form action={deleteMerch} className="flex-1">
          <Button
            type="submit"
            name="id"
            value={merch.id}
            variant="destructive"
            className="w-full"
          >
            Delete
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ShopManagement;
