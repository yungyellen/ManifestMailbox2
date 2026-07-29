import { createServiceClient } from "@/lib/supabase";
import { AutoSendToggle } from "./auto-send-toggle";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending: "Pre-launch",
  paused: "Paused",
  canceled: "Canceled",
};

export default async function SubscribersPage() {
  const db = createServiceClient();
  const { data: subs } = await db
    .from("subscribers")
    .select(
      "id, email, status, auto_send, day_count, created_at, manifestations(manifestation, is_current)"
    )
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  const sorted = (subs ?? []).sort((a: any, b: any) => {
    const rank = (s: string) => (s === "active" ? 0 : s === "pending" ? 1 : 2);
    return (
      rank(a.status) - rank(b.status) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const activeCount = sorted.filter((s: any) => s.status === "active").length;

  return (
    <>
      <div className="screen-head">
        <div>
          <div className="eyebrow">Everyone in the mailbox</div>
          <h1>Subscribers</h1>
        </div>
        <div className="date">
          {sorted.length} total · {activeCount} active
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subscriber</th>
              <th>Status</th>
              <th>Streak</th>
              <th>Auto-send</th>
              <th>Current manifestation</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s: any) => {
              const current = (s.manifestations ?? []).find(
                (m: any) => m.is_current
              );
              const joined = new Date(s.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <tr key={s.id}>
                  <td className="sub-email">
                    {s.email}
                    <span className="since">joined {joined}</span>
                  </td>
                  <td>
                    <span className={`pill ${s.status}`}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="num">
                    {s.status === "active" ? `Day ${s.day_count}` : "—"}
                  </td>
                  <td>
                    {s.status === "active" ? (
                      <AutoSendToggle id={s.id} on={s.auto_send} />
                    ) : (
                      <span className="toggle-cell" style={{ opacity: 0.45 }}>
                        —
                      </span>
                    )}
                  </td>
                  <td className="manifest-cell">
                    {current?.manifestation ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
