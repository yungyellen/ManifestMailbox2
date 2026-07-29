"use client";

import { useState } from "react";

export function HistoryRow({ email }: { email: any }) {
  const [open, setOpen] = useState(false);
  const subject = email.final_subject || email.generated_subject;
  const body = email.final_body || email.generated_body;
  const wasEdited = !!(email.final_subject || email.final_body);

  return (
    <>
      <tr onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        <td style={{ color: "var(--faint)", width: "1.5rem" }}>
          {open ? "▾" : "▸"}
        </td>
        <td className="num">
          {new Date(email.send_date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </td>
        <td>{email.subscribers?.email}</td>
        <td>{subject}</td>
        <td>
          <span className={`pill ${email.status}`}>{email.status}</span>
        </td>
        <td className="num">
          {email.prompt_templates?.version
            ? `v${email.prompt_templates.version}`
            : "—"}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} style={{ background: "var(--surface)", padding: "1.2rem 1.4rem" }}>
            <div className="email-preview" style={{ background: "var(--paper)", maxWidth: 760 }}>
              <div className="email-subject">
                <span className="from">
                  Manifest Mailbox &lt;today@manifestmailbox.com&gt;
                  {email.sent_at &&
                    ` · sent ${new Date(email.sent_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                  {wasEdited && " · edited before sending"}
                </span>
                {subject}
              </div>
              <div className="email-body">{body}</div>
            </div>
            {wasEdited && (
              <details style={{ marginTop: "0.9rem", fontSize: "0.84rem", color: "var(--muted)" }}>
                <summary style={{ cursor: "pointer" }}>
                  View original draft (before edits)
                </summary>
                <div className="email-preview" style={{ background: "var(--paper)", maxWidth: 760, marginTop: "0.6rem" }}>
                  <div className="email-subject">{email.generated_subject}</div>
                  <div className="email-body">{email.generated_body}</div>
                </div>
              </details>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
