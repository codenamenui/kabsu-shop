import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Category, Shop } from "@/constants/type";

const SearchSidebar = ({
  handleCategoryChange,
  selectedCategories,
  categories,
  shops,
  selectedShops,
  handleShopChange,
}: {
  handleCategoryChange: (categoryId: number) => void;
  selectedCategories: number[];
  categories: Category[];
  shops?: Shop[];
  handleShopChange?: (shopId: number) => void;
  selectedShops: number[];
}) => {
  return (
    <aside className="border-r border-zinc-200 pr-32 pt-4">
      <div className="flex flex-col gap-3">
        <h4 className="text-base font-semibold">Filters</h4>
        <div>
          <p className="pb-2 font-semibold">Categories</p>
          <div className="flex flex-col gap-2 text-sm">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category.id}`}
                  onClick={() => handleCategoryChange(category.id)}
                  checked={selectedCategories.includes(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        {handleShopChange != null && (
          <div>
            <p className="pb-2 font-semibold">Shops</p>
            <div className="flex flex-col gap-2 text-sm">
              {shops?.map((shop) => (
                <div key={shop.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`shop-${shop.id}`}
                    onClick={() => handleShopChange(shop.id)}
                    checked={selectedShops.includes(shop.id)}
                  />
                  <label
                    htmlFor={`shop-${shop.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {shop.acronym}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SearchSidebar;
