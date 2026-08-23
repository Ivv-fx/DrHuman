"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useState } from "react";

export default function BillingPage() {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  
  // This query will return the subscription if it exists
  const subscription = useQuery(
    api.subscriptions.getSubscription,
    organization?.id ? { organizationID: organization.id } : "skip"
  );

  const createCheckoutSession = async () => {
    setLoading(true);
    // Real implementation would open the Razorpay checkout script modal here,
    // or call an API route to generate a Razorpay Subscription Order and pass it to the frontend.
    setTimeout(() => {
      alert("Razorpay Integration requires valid Razorpay API keys.");
      setLoading(false);
    }, 1000);
  };

  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mt-4">
        <Card className={`relative ${!isPro ? "border-primary/50 shadow-md" : ""}`}>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Up to 100 conversations/mo</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 1 Knowledge Base Document</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 opacity-50" /> Basic Analytics</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant={!isPro ? "default" : "outline"} className="w-full" disabled={!isPro}>
              {!isPro ? "Current Plan" : "Downgrade to Free"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={`relative ${isPro ? "border-primary/50 shadow-md" : ""}`}>
          {isPro && (
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Pro Plan <Zap className="h-4 w-4 text-yellow-500" /></CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">$49<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited conversations</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited Documents</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Advanced Analytics</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant={isPro ? "default" : "default"} className="w-full" onClick={createCheckoutSession} disabled={loading || isPro}>
              {loading ? "Loading..." : isPro ? "Manage Subscription" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
