import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthClient, createServiceClient } from "@/lib/supabase";
import { signOut } from "@/app/actions";
import { NavLinks } from "./nav-links";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceClient();
  const { count } = await db
    .from("emails")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft");

  const initials = (user.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="frame">
      <aside className="sidebar">
        <Link href="/queue" style={{ textDecoration: "none" }}>
          <div className="wordmark">
            <div className="mm">
              Manifest <b>Mailbox</b>
            </div>
            <div className="sub">Studio</div>
          </div>
        </Link>
        <NavLinks queueCount={count ?? 0} />
        <div className="foot">
          <div>
            <b>{initials}</b> · {user.email}
          </div>
          <form action={signOut}>
            <button className="signout">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="main">
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
