// Removed server-side auth sync route as application has migrated to localStorage + BroadcastChannel.
export async function POST() {
  return new Response("Removed", { status: 404 });
}
