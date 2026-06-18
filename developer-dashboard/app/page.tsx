import { redirect } from "next/navigation";

export default function Home() {
  // Default module par redirect karein
  redirect("/getting-started");
}
