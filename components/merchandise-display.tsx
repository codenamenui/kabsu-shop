import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Merch } from "@/constants/type";
import { motion } from "framer-motion";

const MerchandiseDisplay = ({ merch }: { merch: Merch }) => {
  const originalPrice = Math.min(
    ...merch.variants.map((variant) => variant.original_price ?? 0),
  );
  const membershipPrice = Math.min(
    ...merch.variants.map((variant) => variant.membership_price ?? 0),
  );
  const displayOriginalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(originalPrice);
  const displayMembershipPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(membershipPrice);

  return (
    <Link href={`/merch/${merch.id}`} key={merch.id}>
      <motion.div
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
          zIndex: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 10,
        }}
        className="relative"
      >
        <Card className="h-full w-52">
          <CardContent className="p-5">
            {merch.merchandise_pictures &&
            merch.merchandise_pictures.length > 0 ? (
              <Image
                alt={merch.name}
                width={192}
                height={192}
                src={merch.merchandise_pictures[0].picture_url}
                className="h-48 w-48"
              />
            ) : (
              <p>No image available</p>
            )}
          </CardContent>
          <CardFooter>
            <div>
              <p className="font-bold">{merch.name}</p>
              <p>{merch.shops.acronym}</p>
              <p className="font-medium text-emerald-800">
                {displayOriginalPrice}
              </p>
              <p>
                Member:{" "}
                <span className="font-medium text-emerald-800">
                  {displayMembershipPrice}
                </span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default MerchandiseDisplay;
