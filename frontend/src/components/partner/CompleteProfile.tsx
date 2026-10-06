import { UserRound} from "lucide-react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";


export default function CompleteProfile() {

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-sm">

                <CardHeader className="text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                        <UserRound className="h-7 w-7 text-indigo-600" />
                    </div>

                    <CardTitle className="text-xl">
                        Complete Your Profile First
                    </CardTitle>

                    <CardDescription className="mt-2">
                        Before creating a product, please complete your
                        partner profile and payment details.
                    </CardDescription>

                </CardHeader>

             
            </Card>
        </div>
    );
}