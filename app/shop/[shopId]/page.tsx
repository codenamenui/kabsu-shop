"use client";

import React, { useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { Merch, Shop, Category, FullShopInfo } from "@/constants/type";
import SearchSidebar from "@/components/searchpage/sidebar";
import ResultsDisplay from "@/components/searchpage/results";
import ShopDisplay from "@/components/shop-display";

const SearchPage = () => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const shopId = params.shopId;
  const [sort, setSort] = useState("date");
  const categoryParam = searchParams.get("category");
  const query = searchParams.get("query");
  const [merchandises, setMerchandises] = useState<Merch[]>([]);
  const [results, setResults] = useState<Merch[]>([]);
  const [shop, setShop] = useState<FullShopInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedShops, setSelectedShops] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const filterMerchandises = (query: string, categories: number[]) => {
    let filteredResults: Merch[];
    if (merchandises == null) {
      filteredResults = [];
      return;
    }

    filteredResults = merchandises.filter((item) => {
      return item.name.toLowerCase().includes(query?.toLowerCase() ?? "");
    });

    if (categories.length > 0) {
      // Filter the data to only include items that have at least one matching category
      filteredResults = filteredResults.filter((item) => {
        return item.merchandise_categories?.some((category) =>
          categories.includes(category.cat_id),
        );
      });
    }

    filteredResults = filteredResults.filter((item) => {
      return item.shops.id.toString() == shopId.toString();
    });

    if (sort === "date") {
      filteredResults.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (sort === "ascending") {
      filteredResults.sort((a, b) => {
        const priceA = a.variants[0]?.original_price || 0; // Fallback to 0 if no variants
        const priceB = b.variants[0]?.original_price || 0; // Fallback to 0 if no variants
        return priceA - priceB; // Ascending order
      });
    } else if (sort === "descending") {
      filteredResults.sort((a, b) => {
        const priceA = a.variants[0]?.original_price || 0; // Fallback to 0 if no variants
        const priceB = b.variants[0]?.original_price || 0; // Fallback to 0 if no variants
        return priceB - priceA; // Ascending order
      });
    }
    setResults(filteredResults || []);
  };

  useEffect(() => {
    // Fetch Merchandises
    const fetchMerchandises = async () => {
      const { data: merchandises } = await supabase
        .from("merchandises")
        .select(
          `
        id, 
        name, 
        created_at,
        merchandise_pictures(picture_url), 
        variants(original_price, membership_price), 
        shops!inner(id, name, acronym),
        merchandise_categories(id, cat_id)
    `,
        )
        .returns<Merch[]>();

      setMerchandises(merchandises ?? []);
    };
    fetchMerchandises();

    // Fetch categories
    const getCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name");
      setCategories(data ?? []);
    };
    getCategories();

    // Fetch shops
    const getShops = async () => {
      const { data, error } = await supabase
        .from("shops")
        .select(
          "id, name, email, socmed_url, logo_url, colleges(id, name), acronym",
        )
        .eq("id", shopId)
        .returns<FullShopInfo>()
        .single();
      setShop(data);
    };
    getShops();
  }, []);

  useEffect(() => {
    if (merchandises.length === 0) return; // Skip filtering if no data

    let categoryIds: number[] = [];
    if (categoryParam) {
      categoryIds = categoryParam.split(",").map(Number);
      setSelectedCategories(categoryIds); // Set selected categories from URL param
    }

    if (categoryParam) {
      filterMerchandises(query ?? "", categoryIds);
    } else {
      filterMerchandises(query ?? "", selectedCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchandises, query, categoryParam, sort]);

  // Handle category change
  const handleCategoryChange = (categoryId: number): void => {
    const updatedSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedSelected);
    // Update the URL with the new search parameters
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", updatedSelected.join(",")); // Set the 'category' param to the selected IDs
    router.push(`/shop/${shopId}?${queryParams.toString()}`); // Update the URL without reloading
  };

  return (
    <div className="flex justify-center">
      <div className="flex px-28 text-sm">
        <SearchSidebar
          handleCategoryChange={handleCategoryChange}
          categories={categories}
          selectedCategories={selectedCategories}
          selectedShops={selectedShops}
        />

        <div className="flex flex-1 flex-col space-y-2 px-6 py-2">
          <ShopDisplay shop={shop} />
          <ResultsDisplay
            setSort={setSort}
            query={query ?? ""}
            results={results}
            inShop={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
