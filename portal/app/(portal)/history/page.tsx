import { createServiceClient } from "@/lib/supabase";
import { HistoryRow } from "./history-row";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const db = createServiceClient();
  const { data: emails } = await db
    .from("emails")
    .select(
      "id, send_date, status, generated_subject, generated_body, final_subject, final_body, sent_at, resend_message_id, prompt_templates(version), subscribers(email)"
    )
    .order("generated_at", { ascending: false })
    .limit(200);

  return (
    <>
      <div className="screen-head">
        <div>
          <div className="eyebrow">Every email, forever</div>
          <h1>History</h1>
        </div>
        <div className="date">{emails?.length ?? 0} emails · newest first</div>
      </div>

      {(emails ?? []).length === 0 ? (
        <div className="empty">No emails yet — history fills in as drafts are generated and sent.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>Subscriber</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Prompt</th>
              </tr>
            </thead>
            <tbody>
              {(emails ?? []).map((e: any) => (
                <HistoryRow key={e.id} email={e} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
