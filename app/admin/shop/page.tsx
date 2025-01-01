"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";

// Type definitions for form data and validation
interface ShopFormData {
  name: string;
  acronym: string;
  email: string;
  collegeId: string;
  socmedUrl: string;
  logoFile: File | null;
}

interface College {
  id: number;
  name: string;
}

const AddShopPage: React.FC = () => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: "",
    acronym: "",
    email: "",
    collegeId: "",
    socmedUrl: "",
    logoFile: null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch colleges on component mount
  React.useEffect(() => {
    const fetchColleges = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name")
        .order("name");

      if (error) {
        toast.error("Failed to load colleges");
        return;
      }

      setColleges(data || []);
    };

    fetchColleges();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPEG, PNG, or GIF.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logoFile: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const { name, acronym, email, collegeId, socmedUrl, logoFile } = formData;

    if (!name.trim()) {
      toast.error("Shop name is required");
      return false;
    }
    if (!acronym.trim()) {
      toast.error("Shop acronym is required");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!collegeId) {
      toast.error("Please select a college");
      return false;
    }
    if (!socmedUrl.trim()) {
      toast.error("Social media URL is required");
      return false;
    }
    if (!logoFile) {
      toast.error("Shop logo is required");
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

      // Upload logo to Supabase storage
      const fileExt = formData.logoFile!.name.split(".").pop();
      const fileName = `${formData.name}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to shop-picture bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("shop-picture")
        .upload(filePath, formData.logoFile!);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("shop-picture").getPublicUrl(filePath);

      // Insert shop data
      const { data, error } = await supabase
        .from("shops")
        .insert({
          name: formData.name,
          acronym: formData.acronym,
          email: formData.email,
          college_id: parseInt(formData.collegeId),
          socmed_url: formData.socmedUrl,
          logo_url: publicUrl,
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Shop added successfully!");
      router.push("/admin"); // Redirect to shops list
    } catch (error: any) {
      console.error("Error adding shop:", error);
      toast.error(error.message || "Failed to add shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Add New Shop</h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-4 max-w-lg rounded bg-white px-8 pb-8 pt-6 shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Shop Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter shop name"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="acronym"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Shop Acronym
          </label>
          <input
            type="text"
            id="acronym"
            name="acronym"
            value={formData.acronym}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter shop acronym"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Contact Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter contact email"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="collegeId"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            College
          </label>
          <select
            id="collegeId"
            name="collegeId"
            value={formData.collegeId}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            required
          >
            <option value="">Select a College</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="socmedUrl"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Social Media URL
          </label>
          <input
            type="input"
            id="socmedUrl"
            name="socmedUrl"
            value={formData.socmedUrl}
            onChange={handleInputChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            placeholder="Enter social media profile URL"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="logoFile"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Shop Logo
          </label>
          <input
            type="file"
            id="logoFile"
            name="logoFile"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            required
          />
          {logoPreview && (
            <div className="mt-4 flex justify-center">
              <img
                src={logoPreview}
                alt="Logo Preview"
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
            {isLoading ? "Adding..." : "Add Shop"}
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

export default AddShopPage;
