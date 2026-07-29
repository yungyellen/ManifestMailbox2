import { createServiceClient } from "@/lib/supabase";
import { QueueCard } from "./queue-card";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const db = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: drafts }, approvedToday, sentToday, activeSubs] =
    await Promise.all([
      db
        .from("emails")
        .select(
          "id, generated_subject, generated_body, generated_at, send_date, prompt_templates(version, model), subscribers(id, email, day_count), manifestations(manifestation, detail_1, detail_2, detail_3, feelings)"
        )
        .eq("status", "draft")
        .order("generated_at", { ascending: true }),
      db
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      db
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("status", "sent")
        .eq("send_date", today),
      db
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="screen-head">
        <div>
          <div className="eyebrow">Review &amp; approve</div>
          <h1>Today&rsquo;s Queue</h1>
        </div>
        <div className="date">{dateLabel} · drafts generate daily at 5:00 UTC</div>
      </div>

      <div className="stats">
        <div className={`stat ${(drafts?.length ?? 0) > 0 ? "hot" : ""}`}>
          <div className="n">{drafts?.length ?? 0}</div>
          <div className="l">Awaiting review</div>
        </div>
        <div className="stat">
          <div className="n">{approvedToday.count ?? 0}</div>
          <div className="l">Approved, sending this hour</div>
        </div>
        <div className="stat">
          <div className="n">{sentToday.count ?? 0}</div>
          <div className="l">Sent today</div>
        </div>
        <div className="stat">
          <div className="n">{activeSubs.count ?? 0}</div>
          <div className="l">Active subscribers</div>
        </div>
      </div>

      {(drafts ?? []).length === 0 ? (
        <div className="empty">
          Nothing waiting for review. New drafts appear here each morning.
        </div>
      ) : (
        (drafts ?? []).map((d: any) => <QueueCard key={d.id} draft={d} />)
      )}
    </>
  );
}
