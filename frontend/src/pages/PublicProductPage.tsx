import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ShoppingCart,
  Lock,
  Link2,
  ShieldCheck,
  Infinity as InfinityIcon,
  Star,
  User,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon, CategoryThumbnail, PRODUCT_TYPE_META } from "@/components/product/Productmeta";
import type { Product, ProductLinkItem } from "@/components/product/Types";
import type { IUser } from "@/App";
import logo from "../assets/logo.png";
import { toast } from "sonner";
import api from "@/utils/axios";
import { usePublicPartners, usePublicProducts } from "@/hooks/usePublicData";

// Loosely typed selector shape — adjust to your real RootState if you prefer.
interface RootStateShape {
  publicProducts: { products: Product[] };
  publicPartners: { partners: IUser[] };
}

export default function PublicProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
usePublicPartners()
usePublicProducts()
  const products = useSelector(
    (state: RootStateShape) =>
      state.publicProducts.products
  );

  const partners = useSelector(
    (state: RootStateShape) =>
      state.publicPartners.partners
  );

  // ==============================
  // ALL HOOKS
  // ==============================

  const [isBuyOpen, setIsBuyOpen] =
    useState(false);

  const [buyerName, setBuyerName] =
    useState("");

  const [buyerEmail, setBuyerEmail] =
    useState("");

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [copiedIndex, setCopiedIndex] =
    useState<number | null>(null);

  const [purchasedLinks, setPurchasedLinks] =
    useState<ProductLinkItem[] | null>(null);

  // ==============================
  // DATA
  // ==============================

  const product = products.find(
    (p) => p.slug === slug
  );

  const creator = product
    ? partners.find(
      (p) => p._id === product.partnerId
    )
    : undefined;

  const isProductAvailable =
    !!product &&
    !!creator &&
    creator.isActive === true;

  // ==============================
  // CONDITIONAL RETURN
  // ==============================

  if (!isProductAvailable) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">

          <div className="mx-auto h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Product Unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This product or its creator is currently unavailable.
            Please explore other products on SelloraAI.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Marketplace
          </Button>

        </div>
      </div>
    );
  }

  // From here product is guaranteed to exist
  const typeMeta =
    PRODUCT_TYPE_META[product.type];
  const handlePay = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    try {
      setIsProcessing(true);


      // ==============================
      // CREATE ORDER
      // ==============================

      const { data } = await api.post(
        "/api/order/create",
        {
          productId: product._id,

          partnerId:
            product.partnerId,

          amount:
            product.price,

          customerName:
            buyerName,

          customerEmail:
            buyerEmail,


          // partner email for notification
          partnerEmail:
            creator?.email,


          productTitle:
            product.title,


          links:
            product.links
        }
      );


      if (!data.success) {
        toast.error("Order creation failed");
        return;
      }



      // ==============================
      // RAZORPAY OPTIONS
      // ==============================


      const options = {

        key:
          data.key,


        amount:
          data.amount * 100,


        currency:
          "INR",


        name:
          "SelloraAI",


        description:
          product.title,


        order_id:
          data.razorpayOrderId,


        prefill: {
          name:
            buyerName,

          email:
            buyerEmail
        },


        theme: {
          color: "#4f46e5"
        },


        handler:
          async function (response: any) {


            try {


              // ==============================
              // VERIFY PAYMENT
              // ==============================


              const verifyResponse =
                await api.post(
                  "/api/order/verify",
                  {

                    razorpay_order_id:
                      response.razorpay_order_id,


                    razorpay_payment_id:
                      response.razorpay_payment_id,


                    razorpay_signature:
                      response.razorpay_signature

                  }
                );



              if (
                verifyResponse.data.success
              ) {

                toast.success(
                  "Payment successful"
                );

                await api.patch(
                  "/api/publicProduct/update-sale",
                  {
                    productId: product._id,

                    amount: product.price
                  }
                );

                await api.patch(
                  "/api/auth/update-sale",
                  {
                    partnerId: product.partnerId,

                    amount: product.price
                  }
                );



                // Unlock links

                setPurchasedLinks(
                  product.links ?? []
                );


                setIsBuyOpen(false);

              }


            }
            catch (error) {

              console.log(
                "Verify error",
                error
              );

              toast.error(
                "Payment verification failed"
              );

            }
            finally {

              setIsProcessing(false);

            }

          }

      };



      const razorpay =
        new window.Razorpay(options);



      razorpay.on(
        "payment.failed",
        function () {
          toast.error(
            "Payment failed"
          );

          setIsProcessing(false);
        }
      );


      razorpay.open();


    }
    catch (error: any) {

      console.log(
        "Payment error",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Payment failed"
      );


      setIsProcessing(false);

    }
  };


  const handleDownload = async (url: string) => {
    try {
      const response = await api.post(
        "/api/publicProduct/download",
        { url },
        {
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "product";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logo}
              alt="SelloraAI logo"
              className="h-6 w-6 rounded-sm object-contain shrink-0"
            />
            <span className="text-base sm:text-lg font-semibold tracking-tight truncate">
              SelloraAI
            </span>
          </div>
          <Button
            onClick={() => navigate("/")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
          >
            <span className="hidden sm:inline">Add Your Own Product</span>
            <span className="sm:hidden">List Product</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Hero / buy card */}
          <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
            {/* Full-width thumbnail banner, fills the box like a product photo */}
            <div className="relative h-44 sm:h-64 md:h-80 w-full">
              <CategoryThumbnail type={product.type} fill showIconBadge className="rounded-none" />
            </div>

            <div className="p-6 sm:p-8 md:p-12 text-center">
              <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-3 uppercase">
                <Sparkles className="h-3 w-3" />
                {typeMeta?.label ?? product.type}
              </span>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                {product.title}
              </h1>
              <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl mx-auto">
                {product.description}
              </p>

              <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mt-5 sm:mt-7">
                ₹{product.price}
              </p>

              <Button
                onClick={() => setIsBuyOpen(true)}
                size="lg"
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 gap-2 w-full sm:w-auto px-10 shadow-md shadow-indigo-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 border-b pb-3 mb-4">
              About this {typeMeta?.label ?? "Product"}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Included resources */}
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Link2 className="h-4 w-4 text-indigo-600" />
              Included Resources
            </h2>

            {purchasedLinks && (
              <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Your payment is successful. Download all purchased resources below.
                  Keep this page open until your downloads are complete.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {(product.links ?? []).map((link, index) => {
                const unlocked = purchasedLinks?.[index];

                return (
                  <div
                    key={`${link.title}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-md bg-white border flex items-center justify-center text-slate-400">
                        {unlocked ? (
                          <ExternalLink className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{link.title}</p>
                        {!unlocked && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Lock className="h-3 w-3" />
                            Purchase this product to access resources
                          </p>
                        )}
                        
                      </div>
                    </div>

                    {unlocked ? (
                      <Button
                        onClick={() => handleDownload(unlocked.url)}
                      >
                        Download
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="shrink-0 w-full sm:w-auto">
                        Download
                      </Button>
                    )}
                  </div>
                );
              })}

              {(!product.links || product.links.length === 0) && (
                <p className="text-sm text-slate-400">No resources listed for this product.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Creator card */}
          <div className="rounded-2xl border bg-white p-5 sm:p-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-semibold">
              {creator?.name ? creator.name.charAt(0).toUpperCase() : <User className="h-7 w-7" />}
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">{creator?.name ?? "Creator"}</h3>
            <p className="text-xs font-medium text-slate-400 tracking-wide uppercase mt-0.5">
              Creator
            </p>
            {creator?.partnerProfile?.bio && (
              <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm italic text-slate-500">
                &quot;{creator?.partnerProfile?.bio}&quot;
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              disabled={!creator}
              onClick={() => creator && navigate(`/profile/${creator?.partnerProfile?.slug}`)}
            >
              View Profile
            </Button>
          </div>

          {/* Trust features */}
          <div className="rounded-2xl border bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Star className="h-4 w-4 text-indigo-600" />
              High Quality Content
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <InfinityIcon className="h-4 w-4 text-indigo-600" />
              Lifetime Access
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* Buy Now modal */}
      <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
        <DialogContent className="overflow-hidden p-0 w-[92vw] sm:w-full rounded-xl">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 sm:px-6 py-5 sm:py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <CategoryIcon type={product.type} size="sm" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{product.title}</p>
                <p className="text-indigo-100 text-sm">₹{product.price}</p>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 pt-5">
            <DialogHeader>
              <DialogTitle>Complete your purchase</DialogTitle>
              <DialogDescription>
                Enter your details below to continue to payment.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-5 sm:px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="buyerName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buyerName"
                placeholder="Enter your name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyerEmail">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="you@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 rounded-md bg-indigo-50 px-3 py-2.5 text-xs text-indigo-700">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Secure payment powered by Razorpay. Your card and UPI details are handled by
                Razorpay and never stored on our servers.
              </span>
            </div>
          </div>

          <DialogFooter className="px-5 sm:px-6 pb-5 sm:pb-6 flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBuyOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              {isProcessing ? "Processing..." : `Pay ₹${product.price}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}