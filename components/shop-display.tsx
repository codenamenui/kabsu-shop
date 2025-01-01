import React from "react";
import { Card } from "./ui/card";
import Image from "next/image";
import { FullShopInfo } from "@/constants/type";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const ShopDisplay = ({ shop }: { shop?: FullShopInfo | null }) => {
  return (
    <div className="flex">
      <Card className="flex w-full items-center gap-3 p-3">
        <Image
          src={shop?.logo_url}
          width={80}
          height={80}
          alt={""}
          className="rounded-full"
        />
        <div className="text-xs">
          <p className="text-lg font-semibold">{shop?.name}</p>
          {/* <p className="text-zinc-600">{shop.acronym}</p> */}
          <p>{shop?.colleges.name}</p>
          <a href={shop?.socmed_url} target="_blank" rel="noopener">
            <span className="flex gap-1">
              <FaFacebook size={20} />
              <p>{shop?.socmed_url}</p>
            </span>
          </a>
          <span className="flex gap-1">
            <MdEmail size={20} />
            <p>{shop?.email}</p>
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ShopDisplay;
