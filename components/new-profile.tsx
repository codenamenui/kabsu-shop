import React from "react";
import { createServerClient } from "@/supabase/clients/createServer";
import { College, Profile, Program } from "@/constants/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Users,
  BadgeCheck,
} from "lucide-react";

const NewProfile = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: colleges } = await supabase
    .from("colleges")
    .select()
    .returns<College[]>();
  const { data: programs } = await supabase
    .from("programs")
    .select()
    .returns<Program[]>();
  const { data: profile } = (await supabase
    .from("profiles")
    .select()
    .eq("id", user?.id)
    .single()) as { data: Profile };

  const handleProfileSubmit = async (formData: FormData) => {
    "use server";

    const data = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      student_number: formData.get("student_number"),
      contact_number: formData.get("contact_number"),
      college_id: formData.get("college"),
      program_id: formData.get("program"),
      year: formData.get("year"),
      section: formData.get("section"),
      email: user?.email,
    };

    const supabase = createServerClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(authError);
      return;
    }

    if (profile) {
      await supabase.from("profiles").update(data).eq("id", currentUser?.id);
    } else {
      await supabase
        .from("profiles")
        .insert([{ id: currentUser?.id, ...data }]);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Student Profile</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your profile to access all features
        </p>

        <form action={handleProfileSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="First Name"
                name="first_name"
                defaultValue={profile?.first_name || ""}
                placeholder="Enter your first name"
              />
              <FormField
                label="Last Name"
                name="last_name"
                defaultValue={profile?.last_name || ""}
                placeholder="Enter your last name"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Student Number"
                name="student_number"
                defaultValue={profile?.student_number || ""}
                placeholder="Enter your student number"
                icon={<GraduationCap className="h-4 w-4 text-gray-500" />}
              />
              <FormField
                label="Contact Number"
                name="contact_number"
                defaultValue={profile?.contact_number || ""}
                placeholder="Enter your contact number"
                icon={<Phone className="h-4 w-4 text-gray-500" />}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Academic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>College</Label>
                <Select
                  name="college"
                  defaultValue={profile?.college_id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges?.map((college) => (
                      <SelectItem
                        key={college.id}
                        value={college.id.toString()}
                      >
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <Select
                  name="program"
                  defaultValue={profile?.program_id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((program) => (
                      <SelectItem
                        key={program.id}
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Year Level"
                name="year"
                defaultValue={profile?.year?.toString() || ""}
                placeholder="Enter your year level"
                icon={<Users className="h-4 w-4 text-gray-500" />}
              />
              <FormField
                label="Section"
                name="section"
                defaultValue={profile?.section?.toString() || ""}
                placeholder="Enter your section"
                icon={<Users className="h-4 w-4 text-gray-500" />}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

// Helper component for form fields
const FormField = ({
  label,
  name,
  defaultValue,
  placeholder,
  icon,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={icon ? "pl-10" : ""}
        required
      />
    </div>
  </div>
);

export default NewProfile;
