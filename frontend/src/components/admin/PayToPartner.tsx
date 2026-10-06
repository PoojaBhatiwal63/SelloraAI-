import {
  IndianRupee,
  Wallet,
  CheckCircle2,
  History,
  Users,
  Loader2,
  CalendarDays,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { useEffect, useState } from "react";

import type { IUser } from "@/App";

import api from "@/utils/axios";

import { toast } from "sonner";


// ==========================================
// PAYMENT TYPE
// ==========================================

interface PartnerPayment {
  _id: string;

  partnerId: string;

  partnerName: string;

  partnerEmail: string;

  amount: number;


  status: "success" | "pending" | "failed";

  createdAt: string;

  updatedAt?: string;
}


// ==========================================
// PROPS
// ==========================================

interface PayToPartnerProps {
  partners: IUser[];

  onPaymentSuccess: (
    partner: IUser
  ) => Promise<void> | void;
}


// ==========================================
// COMPONENT
// ==========================================

export default function PayToPartner({
  partners,
  onPaymentSuccess,
}: PayToPartnerProps) {

  const [isPaying, setIsPaying] =
    useState(false);

  const [
    selectedPartner,
    setSelectedPartner,
  ] = useState<IUser | null>(null);


  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "partners" | "history"
  >("partners");


  const [
    payments,
    setPayments,
  ] = useState<PartnerPayment[]>([]);


  const [
    loadingPayments,
    setLoadingPayments,
  ] = useState(false);


  // ==========================================
  // ELIGIBLE PARTNERS
  // ==========================================

  const eligiblePartners =
    partners.filter(
      (partner) =>
        partner.totalRevenue >= 10000
    );


  // ==========================================
  // FETCH PAYMENT HISTORY
  // ==========================================

  const fetchPaymentHistory =
    async () => {

      try {

        setLoadingPayments(true);

        const { data } =
          await api.get(
            "/api/order/partner-payments"
          );
          console.log(data)


        if (data.success) {

          setPayments(
            data.payments || []
          );

        }

      }
      catch (error: any) {

        console.log(
          "Payment history error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch payment history"
        );

      }
      finally {

        setLoadingPayments(false);

      }

    };


  // ==========================================
  // FETCH HISTORY WHEN TAB OPENS
  // ==========================================

  useEffect(() => {

    if (activeTab === "history") {

      fetchPaymentHistory();

    }

  }, [activeTab]);


  // ==========================================
  // OPEN PAYMENT DETAILS
  // ==========================================

  const handlePay = (
    partner: IUser
  ) => {

    setSelectedPartner(partner);

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    date: string
  ) => {

    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  };


  return (

    <div
      className="
        w-full
        max-w-7xl
        mx-auto
        px-3
        sm:px-5
        lg:px-8
        py-5
        sm:py-8
        space-y-5
        sm:space-y-8
      "
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-slate-900
            "
          >
            Partner Payments
          </h1>

          <p
            className="
              text-sm
              text-slate-500
              mt-1
              max-w-2xl
            "
          >
            Manage partner payouts and view
            your complete payment history.
          </p>

        </div>


        {/* ==================================
            TAB SWITCHER
        ================================== */}

        <div
          className="
            w-full
            sm:w-auto
            flex
            items-center
            gap-1
            rounded-lg
            bg-slate-100
            p-1
          "
        >

          <Button
            size="sm"
            variant={
              activeTab === "partners"
                ? "default"
                : "ghost"
            }
            className="
              flex-1
              sm:flex-none
              gap-2
            "
            onClick={() =>
              setActiveTab("partners")
            }
          >

            <Users className="h-4 w-4" />

            <span>
              Partners
            </span>

          </Button>


          <Button
            size="sm"
            variant={
              activeTab === "history"
                ? "default"
                : "ghost"
            }
            className="
              flex-1
              sm:flex-none
              gap-2
            "
            onClick={() =>
              setActiveTab("history")
            }
          >

            <History className="h-4 w-4" />

            <span>
              History
            </span>

          </Button>

        </div>

      </div>


      {/* =====================================================
          PARTNERS TAB
      ===================================================== */}

      {activeTab === "partners" && (

        <Card
          className="
            shadow-sm
            overflow-hidden
          "
        >

          <CardHeader
            className="
              px-4
              sm:px-6
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-9
                  w-9
                  sm:h-10
                  sm:w-10
                  shrink-0
                  rounded-lg
                  bg-indigo-50
                  text-indigo-600
                  flex
                  items-center
                  justify-center
                "
              >

                <Wallet
                  className="
                    h-4
                    w-4
                    sm:h-5
                    sm:w-5
                  "
                />

              </div>


              <div>

                <CardTitle className="text-base">
                  Eligible For Payment
                </CardTitle>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  {eligiblePartners.length} partner
                  {eligiblePartners.length !== 1
                    ? "s"
                    : ""}{" "}
                  ready for payout.
                </p>

              </div>

            </div>

          </CardHeader>


          <CardContent className="p-0">

            {eligiblePartners.length === 0 ? (

              <div
                className="
                  py-12
                  sm:py-14
                  px-4
                  text-center
                "
              >

                <Wallet
                  className="
                    h-9
                    w-9
                    mx-auto
                    text-slate-300
                  "
                />

                <p
                  className="
                    font-medium
                    text-slate-700
                    mt-3
                  "
                >
                  No partner payments pending
                </p>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >
                  Partners need at least ₹10,000
                  in earnings.
                </p>

              </div>

            ) : (

              <div className="w-full overflow-x-auto">

                <table
                  className="
                    w-full
                    min-w-[650px]
                    text-sm
                  "
                >

                  <thead>

                    <tr
                      className="
                        border-y
                        bg-slate-50
                        text-slate-500
                      "
                    >

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Partner
                      </th>

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Total Sales
                      </th>

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Payable Amount
                      </th>

                      <th className="text-right font-medium px-4 sm:px-5 py-3">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y">

                    {eligiblePartners.map(
                      (partner) => (

                        <tr
                          key={partner._id}
                          className="
                            hover:bg-slate-50/60
                            transition-colors
                          "
                        >

                          <td className="px-4 sm:px-5 py-4">

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <Avatar
                                className="
                                  h-9
                                  w-9
                                  shrink-0
                                "
                              >

                                <AvatarFallback>
                                  {partner.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>

                              </Avatar>


                              <div className="min-w-0">

                                <p
                                  className="
                                    font-medium
                                    text-slate-900
                                    truncate
                                    max-w-[180px]
                                  "
                                >
                                  {partner.name}
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-400
                                    truncate
                                    max-w-[220px]
                                  "
                                >
                                  {partner.email}
                                </p>

                              </div>

                            </div>

                          </td>


                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                              whitespace-nowrap
                            "
                          >
                            {partner.totalSales}
                          </td>


                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                              whitespace-nowrap
                            "
                          >

                            <span
                              className="
                                font-semibold
                                text-slate-900
                              "
                            >
                              ₹
                              {partner.totalRevenue.toFixed(2)}
                            </span>

                          </td>


                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                              text-right
                            "
                          >

                            <Button
                              size="sm"
                              onClick={() =>
                                handlePay(partner)
                              }
                              className="
                                whitespace-nowrap
                              "
                            >

                              <IndianRupee
                                className="
                                  h-4
                                  w-4
                                  mr-1
                                "
                              />

                              Pay Partner

                            </Button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}

      {activeTab === "history" && (

        <Card
          className="
            shadow-sm
            overflow-hidden
          "
        >

          <CardHeader
            className="
              px-4
              sm:px-6
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-9
                  w-9
                  sm:h-10
                  sm:w-10
                  rounded-lg
                  bg-green-50
                  text-green-600
                  flex
                  items-center
                  justify-center
                "
              >

                <History
                  className="
                    h-4
                    w-4
                    sm:h-5
                    sm:w-5
                  "
                />

              </div>


              <div>

                <CardTitle className="text-base">
                  Payment History
                </CardTitle>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  View all completed partner
                  payouts.
                </p>

              </div>

            </div>

          </CardHeader>


          <CardContent className="p-0">

            {loadingPayments ? (

              <div
                className="
                  flex
                  items-center
                  justify-center
                  py-14
                "
              >

                <Loader2
                  className="
                    h-6
                    w-6
                    animate-spin
                    text-indigo-600
                  "
                />

              </div>

            ) : payments.length === 0 ? (

              <div
                className="
                  py-14
                  px-4
                  text-center
                "
              >

                <History
                  className="
                    h-9
                    w-9
                    mx-auto
                    text-slate-300
                  "
                />

                <p
                  className="
                    font-medium
                    text-slate-700
                    mt-3
                  "
                >
                  No payment history
                </p>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >
                  Completed partner payments
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="w-full overflow-x-auto">

                <table
                  className="
                    w-full
                    min-w-[700px]
                    text-sm
                  "
                >

                  <thead>

                    <tr
                      className="
                        border-y
                        bg-slate-50
                        text-slate-500
                      "
                    >

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Partner
                      </th>

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Amount
                      </th>

                      

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Date
                      </th>

                      <th className="text-left font-medium px-4 sm:px-5 py-3">
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y">

                    {payments.map(
                      (payment) => (

                        <tr
                          key={payment._id}
                          className="
                            hover:bg-slate-50/60
                            transition-colors
                          "
                        >

                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <Avatar
                                className="
                                  h-9
                                  w-9
                                "
                              >

                                <AvatarFallback>
                                  {payment.partnerName
                                    ?.charAt(0)}
                                </AvatarFallback>

                              </Avatar>


                              <div className="min-w-0">

                                <p
                                  className="
                                    font-medium
                                    text-slate-900
                                    truncate
                                    max-w-[180px]
                                  "
                                >
                                  {payment.partnerName}
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-400
                                    truncate
                                    max-w-[220px]
                                  "
                                >
                                  {payment.partnerEmail}
                                </p>

                              </div>

                            </div>

                          </td>


                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                              whitespace-nowrap
                            "
                          >

                            <span className="font-semibold">

                              ₹
                              {payment.amount.toFixed(2)}

                            </span>

                          </td>




                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                              whitespace-nowrap
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-slate-500
                              "
                            >

                              <CalendarDays
                                className="
                                  h-4
                                  w-4
                                "
                              />

                              {formatDate(
                                payment.createdAt
                              )}

                            </div>

                          </td>


                          <td
                            className="
                              px-4
                              sm:px-5
                              py-4
                            "
                          >

                            {payment.status ===
                            "success" ? (

                              <Badge
                                className="
                                  bg-green-50
                                  text-green-700
                                  hover:bg-green-50
                                "
                              >

                                <CheckCircle2
                                  className="
                                    h-3.5
                                    w-3.5
                                    mr-1
                                  "
                                />

                                Paid

                              </Badge>

                            ) : (

                              <Badge
                                variant="secondary"
                              >
                                {payment.status}
                              </Badge>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          PAYMENT DETAILS DIALOG
      ===================================================== */}

      <Dialog
        open={
          selectedPartner !== null
        }
        onOpenChange={(open) => {

          if (!open) {

            setSelectedPartner(null);

          }

        }}
      >

        <DialogContent
          className="
            w-[calc(100%-1.5rem)]
            sm:w-full
            sm:max-w-md
            max-h-[90vh]
            overflow-y-auto
            rounded-xl
            p-4
            sm:p-6
          "
        >

          {selectedPartner && (

            <>

              <DialogHeader>

                <DialogTitle>
                  Partner Payment
                </DialogTitle>

                <DialogDescription>
                  Review the payment details before
                  marking this payout as completed.
                </DialogDescription>

              </DialogHeader>


              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  border
                  bg-slate-50
                  p-3
                  sm:p-4
                "
              >

                <Avatar>

                  <AvatarFallback>
                    {selectedPartner.name
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>

                </Avatar>


                <div className="min-w-0">

                  <p className="font-semibold truncate">
                    {selectedPartner.name}
                  </p>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      text-slate-500
                      truncate
                    "
                  >
                    {selectedPartner.email}
                  </p>

                </div>

              </div>


              <div className="rounded-lg border p-4">

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  Payment Amount
                </p>

                <p
                  className="
                    text-2xl
                    font-bold
                    mt-1
                  "
                >
                  ₹
                  {selectedPartner.totalRevenue.toFixed(2)}
                </p>

              </div>


              <div className="space-y-3">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <span className="text-sm text-slate-500">
                    Payment Method
                  </span>

                  <Badge variant="secondary">
                    {selectedPartner.paymentDetails.method.toUpperCase()}
                  </Badge>

                </div>


                {selectedPartner.paymentDetails.method ===
                "upi" ? (

                  <div className="rounded-lg border p-4">

                    <p className="text-xs text-slate-400">
                      UPI ID
                    </p>

                    <p
                      className="
                        font-medium
                        mt-1
                        break-all
                      "
                    >
                      {selectedPartner.paymentDetails.upiId ||
                        "Not provided"}
                    </p>

                  </div>

                ) : (

                  <div
                    className="
                      rounded-lg
                      border
                      p-4
                      space-y-3
                    "
                  >

                    <div>

                      <p className="text-xs text-slate-400">
                        Account Holder
                      </p>

                      <p className="font-medium mt-1 break-words">
                        {selectedPartner.paymentDetails.accountHolderName ||
                          "Not provided"}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-slate-400">
                        Account Number
                      </p>

                      <p className="font-medium mt-1 break-all">
                        {selectedPartner.paymentDetails.accountNumber ||
                          "Not provided"}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-slate-400">
                        IFSC Code
                      </p>

                      <p className="font-medium mt-1 break-all">
                        {selectedPartner.paymentDetails.ifscCode ||
                          "Not provided"}
                      </p>

                    </div>

                  </div>

                )}

              </div>


              <DialogFooter
                className="
                  flex-col-reverse
                  sm:flex-row
                  gap-2
                "
              >

                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    setSelectedPartner(null)
                  }
                >
                  Cancel
                </Button>


                <Button
                  disabled={isPaying}
                  className="
                    w-full
                    sm:w-auto
                    bg-green-600
                    hover:bg-green-700
                  "
                  onClick={async () => {

                    try {

                      setIsPaying(true);

                      await onPaymentSuccess(
                        selectedPartner
                      );

                      setSelectedPartner(
                        null
                      );

                      // Refresh history
                      await fetchPaymentHistory();

                    }
                    finally {

                      setIsPaying(false);

                    }

                  }}
                >

                  {isPaying ? (

                    <>
                      <Loader2
                        className="
                          h-4
                          w-4
                          mr-2
                          animate-spin
                        "
                      />

                      Processing...

                    </>

                  ) : (

                    <>
                      <CheckCircle2
                        className="
                          h-4
                          w-4
                          mr-2
                        "
                      />

                      Payment Succeeded
                    </>

                  )}

                </Button>

              </DialogFooter>

            </>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );
}