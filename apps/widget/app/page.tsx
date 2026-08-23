import { WidgetView } from "@/components/widget-view";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const organizationID = typeof params.organizationID === "string" ? params.organizationID : null;

  return (
    <main className="w-full h-screen">
      <WidgetView organizationID={organizationID} />
    </main>
  );
}
