import { ShieldAlert, Mail } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import type { IAdmin } from "@/App";


// ==========================================
// PROPS
// ==========================================

interface DeactivatedNoticeProps {
  admin: IAdmin | null;
}


// ==========================================
// COMPONENT
// ==========================================

export default function DeactivatedNotice({
  admin,
}: DeactivatedNoticeProps) {

  return (

    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">

      <Card className="max-w-md w-full border-red-100 shadow-sm">

        <CardContent className="flex flex-col items-center text-center gap-4 py-10">

          {/* ==================================
              ICON
          ================================== */}

          <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">

            <ShieldAlert className="h-7 w-7 text-red-500" />

          </div>


          {/* ==================================
              MESSAGE
          ================================== */}

          <div className="space-y-1">

            <h2 className="text-lg font-semibold text-slate-900">
              Your profile has been deactivated by admin
            </h2>

            <p className="text-sm text-slate-500">
              You currently don&apos;t have access to the partner dashboard.
            </p>

          </div>


          {/* ==================================
              CONTACT ADMIN
          ================================== */}

          {admin?.email && (

            <div className="w-full border-t pt-5 mt-2">

              <p className="text-sm text-slate-500 mb-3">
                If you believe this was a mistake, please contact the administrator.
              </p>

              <Button

                variant="outline"
                className="w-full "
              >

                <a
                  href={`mailto:${admin.email}`}
                  className="flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Admin
                </a>

              </Button>


              <p className="text-xs text-slate-400 mt-2 break-all">
                {admin.email}
              </p>

            </div>

          )}

        </CardContent>

      </Card>

    </div>

  );
}