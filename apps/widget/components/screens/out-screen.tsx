"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useAtom, useAtomValue } from "jotai";
import { organizationIDAtom, screenAtom, sessionIDAtom } from "@/store/widget-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export function OutScreen() {
  const organizationID = useAtomValue(organizationIDAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setSessionId] = useAtom(sessionIDAtom);
  
  const createSession = useMutation(api.contact_sessions.create);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!organizationID) return;

    try {
      const sessionId = await createSession({
        organizationID,
        name: data.name,
        email: data.email,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      setSessionId(sessionId);
      setScreen("selection");
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please let us know who we are talking to before we start.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Chatting"}
          </Button>
        </form>
      </div>
    </div>
  );
}
