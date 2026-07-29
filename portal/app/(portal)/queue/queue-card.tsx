"use client";

import { useState, useTransition } from "react";
import { approveEmail, rejectEmail, regenerateEmail } from "@/app/actions";

export function QueueCard({ draft }: { draft: any }) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(draft.generated_subject);
  const [body, setBody] = useState(draft.generated_body);
  const [pending, startTransition] = useTransition();

  const sub = draft.subscribers;
  const m = draft.manifestations;
  const details = [m?.detail_1, m?.detail_2, m?.detail_3].filter(Boolean);
  const edited =
    subject !== draft.generated_subject || body !== draft.generated_body;

  function run(action: (fd: FormData) => Promise<void>, extra?: Record<string, string>) {
    const fd = new FormData();
    fd.set("id", draft.id);
    if (extra) Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
    startTransition(() => action(fd));
  }

  return (
    <article className="card" style={pending ? { opacity: 0.55 } : undefined}>
      <div className="card-top">
        <span className="who">{sub?.email}</span>
        <span className="chip day">Day {(sub?.day_count ?? 0) + 1}</span>
        <span className="meta">
          Generated{" "}
          {new Date(draft.generated_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          · Prompt v{draft.prompt_templates?.version ?? "?"} ·{" "}
          {draft.prompt_templates?.model ?? ""}
        </span>
      </div>
      <div className="card-body">
        <div className="pane">
          <div className="pane-label">Their manifestation</div>
          <p className="manifest-text">{m?.manifestation}</p>
          {details.length > 0 && (
            <div className="detail-list">
              {details.map((d: string, i: number) => (
                <div className="d" key={i}>
                  {d}
                </div>
              ))}
            </div>
          )}
          {m?.feelings && (
            <p className="feelings-line">Wants to feel: {m.feelings}</p>
          )}
        </div>
        <div className="pane">
          <div className="pane-label">
            {editing ? "Today's draft — editing" : "Today's draft"}
          </div>
          {editing ? (
            <>
              <input
                className="field-input"
                style={{ marginBottom: "0.7rem", fontWeight: 500 }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                aria-label="Subject"
              />
              <textarea
                className="edit-area"
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-label="Email body"
              />
              <div className="diff-note">
                Your edits are saved alongside the original draft — every change
                teaches the prompt what to do better.
              </div>
            </>
          ) : (
            <div className="email-preview">
              <div className="email-subject">
                <span className="from">
                  Manifest Mailbox &lt;today@manifestmailbox.com&gt;
                </span>
                {subject}
              </div>
              <div className="email-body">{body}</div>
            </div>
          )}
        </div>
      </div>
      <div className="actions">
        {editing ? (
          <>
            <button
              className="btn"
              disabled={pending}
              onClick={() =>
                run(approveEmail, {
                  final_subject: edited ? subject : "",
                  final_body: edited ? body : "",
                })
              }
            >
              Save &amp; approve
            </button>
            <button
              className="btn ghost"
              disabled={pending}
              onClick={() => {
                setSubject(draft.generated_subject);
                setBody(draft.generated_body);
                setEditing(false);
              }}
            >
              Discard edits
            </button>
            <span className="hint">Editing keeps the original for comparison</span>
          </>
        ) : (
          <>
            <button
              className="btn"
              disabled={pending}
              onClick={() => run(approveEmail)}
            >
              Approve
            </button>
            <button
              className="btn ghost"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              Edit &amp; approve
            </button>
            <button
              className="btn ghost"
              disabled={pending}
              onClick={() => run(regenerateEmail)}
            >
              Regenerate
            </button>
            <button
              className="btn danger"
              disabled={pending}
              onClick={() => run(rejectEmail)}
            >
              Reject
            </button>
            <span className="hint">Approved emails send within the hour</span>
          </>
        )}
      </div>
    </article>
  );
}
