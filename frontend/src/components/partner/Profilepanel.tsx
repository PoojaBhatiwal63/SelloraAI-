import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";

import type { IUser } from "@/App";

interface ProfilePanelProps {
  partner: IUser;
  onSave?: (data: IUser) => void;
  onCancel?: () => void;
  saving?: boolean;
}

const BIO_MAX_LENGTH = 500;

export default function ProfilePanel({
  partner,
  onSave,
  onCancel,
  saving = false,
}: ProfilePanelProps) {
  
  const [form, setForm] = useState<IUser>(
    partner
  );

  useEffect(() => {
    setForm(partner);
  }, [partner]);

  const updateUser = (
    key: "name" | "email",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePartnerProfile = (
    key: "slug" | "bio" | "website",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,

      partnerProfile: {
        ...prev.partnerProfile,

        [key]: value,
      },
    }));
  };

  const updateSocial = (
    key:
      | "youtube"
      | "instagram"
      | "linkedin"
      | "github",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,

      partnerProfile: {
        ...prev.partnerProfile,

        socialLinks: {
          ...prev.partnerProfile?.socialLinks,

          [key]: value,
        },
      },
    }));
  };

  const updatePayment = (
    key:
      | "method"
      | "upiId"
      | "accountHolderName"
      | "accountNumber"
      | "ifscCode",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,

      paymentDetails: {
        ...prev.paymentDetails,

        [key]:
          key === "method"
            ? (value as "upi" | "bank")
            : value,
      },
    }));
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">
      Complete Your Partner Profile
    </h1>

    <p className="mt-1 text-slate-500">
      Set up your profile and payment details
      to start selling digital products on
      SelloraAI.
    </p>
  </div>

  {partner.partnerProfile?.slug && (
    <Button
      variant="outline"
      onClick={() =>
        window.open(
          `/profile/${partner.partnerProfile?.slug}`,
          "_blank",
          "noopener,noreferrer"
        )
      }
      className="shrink-0"
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      View Public Profile
    </Button>
  )}
</div>
      <Card>
        <CardContent className="space-y-10 py-8">

          {/* Basic Information */}
          <section className="space-y-5">
            <h2 className="border-b pb-3 text-lg font-semibold">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Full Name{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </Label>

                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    updateUser(
                      "name",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  disabled
                />
              </div>

            </div>
          </section>

          {/* Partner Profile */}
          <section className="space-y-5">
            <h2 className="border-b pb-3 text-lg font-semibold">
              Partner Profile
            </h2>

             <div className="space-y-1.5">
              <Label htmlFor="profileSlug">
                Profile Slug <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center rounded-md border bg-white overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                <span className="pl-3 text-sm text-slate-400 whitespace-nowrap">
                  sellora.ai/profile/
                </span>
                <Input
                  id="profileSlug"
                  placeholder="your-profile-name"
                  value={
                  form.partnerProfile?.slug ?? ""
                }
                onChange={(e) =>
                  updatePartnerProfile(
                    "slug",
                    e.target.value
                  )
                }
                  className="border-0 focus-visible:ring-0 shadow-none"
                />
              </div>
              <p className="text-xs text-slate-400">
                This will be used as your public partner profile URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="bio">
                  Bio{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </Label>

                <span className="text-xs text-slate-400">
                  {
                    (
                      form.partnerProfile?.bio ??
                      ""
                    ).length
                  }
                  /{BIO_MAX_LENGTH}
                </span>
              </div>

              <Textarea
                id="bio"
                rows={4}
                maxLength={BIO_MAX_LENGTH}
                value={
                  form.partnerProfile?.bio ?? ""
                }
                onChange={(e) =>
                  updatePartnerProfile(
                    "bio",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">
                Website
              </Label>

              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="website"
                  className="pl-9"
                  value={
                    form.partnerProfile
                      ?.website ?? ""
                  }
                  onChange={(e) =>
                    updatePartnerProfile(
                      "website",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-5">
            <h2 className="border-b pb-3 text-lg font-semibold">
              Social Links
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <SocialInput
                id="youtube"
                label="YouTube"
                icon={<FaYoutube />}
                value={
                  form.partnerProfile
                    ?.socialLinks?.youtube ?? ""
                }
                onChange={(value) =>
                  updateSocial(
                    "youtube",
                    value
                  )
                }
              />

              <SocialInput
                id="instagram"
                label="Instagram"
                icon={<FaInstagram />}
                value={
                  form.partnerProfile
                    ?.socialLinks?.instagram ?? ""
                }
                onChange={(value) =>
                  updateSocial(
                    "instagram",
                    value
                  )
                }
              />

              <SocialInput
                id="linkedin"
                label="LinkedIn"
                icon={<FaLinkedin />}
                value={
                  form.partnerProfile
                    ?.socialLinks?.linkedin ?? ""
                }
                onChange={(value) =>
                  updateSocial(
                    "linkedin",
                    value
                  )
                }
              />

              <SocialInput
                id="github"
                label="GitHub"
                icon={<FaGithub />}
                value={
                  form.partnerProfile
                    ?.socialLinks?.github ?? ""
                }
                onChange={(value) =>
                  updateSocial(
                    "github",
                    value
                  )
                }
              />

            </div>
          </section>

          {/* Payment */}
          <section className="space-y-5">
            <h2 className="border-b pb-3 text-lg font-semibold">
              Payment Details
            </h2>

            <RadioGroup
              value={
                form.paymentDetails.method
              }
              onValueChange={(value) =>
                updatePayment(
                  "method",
                  value
                )
              }
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="upi"
                  id="upi"
                />

                <Label htmlFor="upi">
                  UPI
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="bank"
                  id="bank"
                />

                <Label htmlFor="bank">
                  Bank Account
                </Label>
              </div>
            </RadioGroup>

            {form.paymentDetails.method ===
            "upi" ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div className="space-y-1.5">
                  <Label htmlFor="upiId">
                    UPI ID{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    id="upiId"
                    value={
                      form.paymentDetails
                        .upiId ?? ""
                    }
                    onChange={(e) =>
                      updatePayment(
                        "upiId",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accountHolderName">
                    Account Holder Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    id="accountHolderName"
                    value={
                      form.paymentDetails
                        .accountHolderName ??
                      ""
                    }
                    onChange={(e) =>
                      updatePayment(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
  <div className="space-y-1.5">
                  <Label htmlFor="accountHolderName">
                    Account Holder Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    id="accountHolderName"
                    value={
                      form.paymentDetails
                        .accountHolderName ??
                      ""
                    }
                    onChange={(e) =>
                      updatePayment(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                  />
                </div>


                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber">
                    Account Number{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    id="accountNumber"
                    value={
                      form.paymentDetails
                        .accountNumber ??
                      ""
                    }
                    onChange={(e) =>
                      updatePayment(
                        "accountNumber",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ifscCode">
                    IFSC Code{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    id="ifscCode"
                    value={
                      form.paymentDetails
                        .ifscCode ?? ""
                    }
                    onChange={(e) =>
                      updatePayment(
                        "ifscCode",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>
            )}
          </section>

          {/* Status */}
          <div className="flex gap-3 rounded-lg bg-indigo-50 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">
                Status:
              </span>

              <Badge className="bg-indigo-100 text-indigo-700">
                {form.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              disabled={saving}
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() =>
                onSave?.(form)
              }
            >
              {saving
                ? "Saving..."
                : "Save & Continue"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

function SocialInput({
  id,
  label,
  icon,
  value,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <Input
          id={id}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="pl-9"
        />
      </div>
    </div>
  );
}