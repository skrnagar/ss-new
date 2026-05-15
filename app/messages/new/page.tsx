import { redirect } from "next/navigation";

/** Sidebar linked here; opens main inbox with the new-conversation picker. */
export default function MessagesNewPage() {
  redirect("/messages?compose=1");
}
