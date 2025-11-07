"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { stripeAPI } from "@/lib/api";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    // Verify the payment
    const verifyPayment = async () => {
      try {
        const details = await stripeAPI.verifySession(sessionId);
        setPaymentDetails(details);
        setSavedToDb(true); // Backend now saves during verification
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully
            {savedToDb && " and saved to database"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentDetails && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">
                  ₹{(paymentDetails.amount / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="font-semibold capitalize text-green-600">
                  {paymentDetails.status}
                </span>
              </div>
              {paymentDetails.metadata?.clientName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client:</span>
                  <span className="font-semibold">
                    {paymentDetails.metadata.clientName}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Transaction ID: {paymentDetails.paymentIntent}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/clients")}
              variant="outline"
              className="w-full"
            >
              View All Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
