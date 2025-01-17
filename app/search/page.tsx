"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { Merch, Shop, Category } from "@/constants/type";
import SearchSidebar from "@/components/searchpage/sidebar";
import ResultsDisplay from "@/components/searchpage/results";

const SearchPage = () => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState("date");
  const categoryParam = searchParams.get("category");
  const query = searchParams.get("query");
  const shopParam = searchParams.get("shop");
  const [merchandises, setMerchandises] = useState<Merch[]>([]);
  const [results, setResults] = useState<Merch[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedShops, setSelectedShops] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const filterMerchandises = (
    query: string,
    categories: number[],
    shops: number[],
  ) => {
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

    if (shops.length > 0) {
      // Filter the data to only include items that belong to selected shops
      filteredResults = filteredResults.filter((item) => {
        return shops.includes(item.shops?.id);
      });
    }

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
        ready,
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
      const { data } = await supabase.from("shops").select("id, acronym");
      setShops(data ?? []);
    };
    getShops();
  }, []);

  useEffect(() => {
    if (merchandises.length === 0) return; // Skip filtering if no data

    let categoryIds: number[] = [];
    let shopIds: number[] = [];
    if (categoryParam) {
      categoryIds = categoryParam.split(",").map(Number);
      setSelectedCategories(categoryIds); // Set selected categories from URL param
    }

    if (shopParam) {
      shopIds = shopParam.split(",").map(Number);
      setSelectedShops(shopIds); // Set selected shops from URL param
    }

    if (categoryParam && shopParam) {
      filterMerchandises(query ?? "", categoryIds, shopIds);
    } else if (categoryParam) {
      filterMerchandises(query ?? "", categoryIds, selectedShops);
    } else if (shopParam) {
      filterMerchandises(query ?? "", selectedCategories, shopIds);
    } else {
      filterMerchandises(query ?? "", selectedCategories, selectedShops);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchandises, query, categoryParam, shopParam, sort]);

  // Handle category change
  const handleCategoryChange = (categoryId: number): void => {
    const updatedSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedSelected);
    // Update the URL with the new search parameters
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", updatedSelected.join(",")); // Set the 'category' param to the selected IDs
    router.push(`/search?${queryParams.toString()}`); // Update the URL without reloading
  };

  // Handle shop change
  const handleShopChange = (shopId: number): void => {
    const updatedSelected = selectedShops.includes(shopId)
      ? selectedShops.filter((id) => id !== shopId)
      : [...selectedShops, shopId];

    setSelectedShops(updatedSelected);
    // Update the URL with the new search parameters
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("shop", updatedSelected.join(",")); // Set the 'shop' param to the selected IDs
    router.push(`/search?${queryParams.toString()}`); // Update the URL without reloading
  };

  const inShopPage = (): boolean => {
    const currentUrl = usePathname();
    return currentUrl.startsWith(`${process.env.NEXT_PUBLIC_BASE_URL}/shop`);
  };

  return (
    <div className="flex justify-center">
      <div className="flex px-28 text-sm">
        <SearchSidebar
          handleCategoryChange={handleCategoryChange}
          handleShopChange={handleShopChange}
          shops={shops}
          categories={categories}
          selectedCategories={selectedCategories}
          selectedShops={selectedShops}
        />

        <ResultsDisplay
          setSort={setSort}
          query={query ?? ""}
          results={results}
        />
      </div>
    </div>
  );
};

export default SearchPage;
