import { NextResponse } from "next";
import crypto from "crypto";
import { fetchMutation } from "convex/nextjs";
import { api } from "@repo/backend/convex/_generated/api";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(body);

    switch (event.event) {
      case "subscription.charged":
      case "subscription.authenticated":
        const subscription = event.payload.subscription.entity;
        
        // In Razorpay, we can pass notes during subscription creation
        const organizationID = subscription.notes?.organizationID;
        
        if (organizationID) {
          await fetchMutation(api.private.billing.updateSubscription, {
            organizationID: organizationID,
            razorpayCustomerId: subscription.customer_id,
            razorpaySubscriptionId: subscription.id,
            plan: "pro",
            status: "active",
            currentPeriodEnd: subscription.current_end * 1000,
          });
        }
        break;
      
      case "subscription.halted":
      case "subscription.cancelled":
        const updatedSubscription = event.payload.subscription.entity;
        await fetchMutation(api.private.billing.updateSubscriptionStatus, {
          razorpaySubscriptionId: updatedSubscription.id,
          status: updatedSubscription.status,
          currentPeriodEnd: updatedSubscription.current_end * 1000,
        });
        break;
        
      default:
        console.log(`Unhandled Razorpay event type ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
