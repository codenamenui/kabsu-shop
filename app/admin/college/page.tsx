"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";

// Type definitions for form data and validation
interface CollegeFormData {
  name: string;
}

const AddCollegePage: React.FC = () => {
  const [formData, setFormData] = useState<CollegeFormData>({
    name: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const { name } = formData;

    if (!name.trim()) {
      toast.error("College name is required");
      return false;
    }

    // Optional: Add more specific validation (e.g., minimum length)
    if (name.trim().length < 3) {
      toast.error("College name must be at least 3 characters long");
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

      // Insert college data
      const { data, error } = await supabase
        .from("colleges")
        .insert({
          name: formData.name.trim(),
        })
        .select();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          toast.error("A college with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("College added successfully!");
      router.push("/admin"); // Redirect to colleges list
    } catch (error: any) {
      console.error("Error adding college:", error);
      toast.error(error.message || "Failed to add college");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Add New College</h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-4 max-w-lg rounded bg-white px-8 pb-8 pt-6 shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            College Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter full college name"
            required
            maxLength={100} // Match database column length
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add College"}
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

export default AddCollegePage;
