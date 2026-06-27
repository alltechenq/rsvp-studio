import RSVPPage from "@/components/rsvp/RSVPPage";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RSVPPage token={token} />;
}
