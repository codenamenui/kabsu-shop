"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Type definitions for form data and validation
interface CategoryFormData {
  name: string;
  pictureFile: File | null;
}

const AddCategoryPage: React.FC = () => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    pictureFile: null,
  });

  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload JPEG, PNG, GIF, or WebP.",
        );
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        pictureFile: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const { name, pictureFile } = formData;

    if (!name.trim()) {
      toast.error("Category name is required");
      return false;
    }

    if (!pictureFile) {
      toast.error("Category picture is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Upload picture to Supabase storage
      const fileExt = formData.pictureFile!.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to categories-picture bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("category-picture")
        .upload(filePath, formData.pictureFile!);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("category-picture").getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      // Insert category data
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: formData.name.trim(),
          picture_url: publicUrl,
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Category added successfully!");
      router.push("/admin"); // Redirect to categories list
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Add New Category</h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-4 max-w-lg rounded bg-white px-8 pb-8 pt-6 shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Category Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter category name"
            required
            maxLength={50} // Match database column length
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="pictureFile"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Category Picture
          </label>
          <input
            type="file"
            id="pictureFile"
            name="pictureFile"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            required
          />
          {picturePreview && (
            <div className="mt-4 flex justify-center">
              <img
                src={picturePreview}
                alt="Category Preview"
                className="max-h-[200px] max-w-[200px] object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Category"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="focus:shadow-outline rounded px-4 py-2 font-bold text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryPage;
