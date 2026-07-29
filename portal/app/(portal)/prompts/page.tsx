import { createServiceClient } from "@/lib/supabase";
import { savePromptVersion } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const db = createServiceClient();
  const { data: versions } = await db
    .from("prompt_templates")
    .select("id, version, model, is_active, notes, created_at, system_prompt, user_prompt_template")
    .eq("name", "daily-manifestation")
    .order("version", { ascending: false });

  const active = (versions ?? []).find((v: any) => v.is_active) ?? versions?.[0];

  // usage counts per version
  const counts: Record<string, number> = {};
  for (const v of versions ?? []) {
    const { count } = await db
      .from("emails")
      .select("id", { count: "exact", head: true })
      .eq("prompt_template_id", v.id);
    counts[v.id] = count ?? 0;
  }

  return (
    <>
      <div className="screen-head">
        <div>
          <div className="eyebrow">The voice of the mailbox</div>
          <h1>Prompts</h1>
        </div>
        <div className="date">
          daily-manifestation · v{active?.version} active
        </div>
      </div>

      {saved && (
        <div className="flash">
          Saved as {saved} — it's now active. Every email records the version
          that wrote it, so you can compare quality in History.
        </div>
      )}

      <div className="prompt-grid">
        <div className="version-list">
          <div className="vhead">Versions</div>
          {(versions ?? []).map((v: any) => (
            <div key={v.id} className={`version ${v.is_active ? "current" : ""}`}>
              <div className="vname">
                {v.is_active && <span className="vdot" />} Version {v.version}
                {v.is_active ? " · Active" : ""}
              </div>
              <div className="vmeta">
                {new Date(v.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {counts[v.id]} email{counts[v.id] === 1 ? "" : "s"} written
                {v.notes ? ` · ${v.notes.slice(0, 60)}` : ""}
              </div>
            </div>
          ))}
        </div>

        <form className="editor" action={savePromptVersion}>
          <div className="editor-head">
            Editing → saves as Version {(active?.version ?? 0) + 1}
            <label style={{ marginLeft: "auto", fontWeight: 400, fontSize: "0.84rem" }}>
              Model{" "}
              <select
                name="model"
                defaultValue={active?.model ?? "claude-sonnet-5"}
                style={{
                  font: "inherit",
                  padding: "0.35rem 0.6rem",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <option value="claude-sonnet-5">claude-sonnet-5</option>
                <option value="claude-opus-5">claude-opus-5</option>
                <option value="claude-haiku-4-5-20251001">claude-haiku-4.5</option>
              </select>
            </label>
          </div>
          <div className="editor-section">
            <div className="pane-label">
              System prompt — who the writer is, the rules that never change
            </div>
            <textarea
              className="field-input"
              name="system_prompt"
              rows={12}
              defaultValue={active?.system_prompt ?? ""}
              required
            />
          </div>
          <div className="editor-section">
            <div className="pane-label">
              Daily template — what changes per subscriber, per day.
              Placeholders: {"{{day_number}} {{sender_category}} {{manifestation}} {{details}} {{feelings}}"}
            </div>
            <textarea
              className="field-input"
              name="user_prompt_template"
              rows={10}
              defaultValue={active?.user_prompt_template ?? ""}
              required
            />
          </div>
          <div className="editor-section">
            <div className="pane-label">Notes for this version (optional)</div>
            <input
              className="field-input"
              name="notes"
              placeholder="What changed and why — e.g. 'shorter subjects, warmer sign-offs'"
            />
          </div>
          <div className="editor-foot">
            <button className="btn">Save as Version {(active?.version ?? 0) + 1}</button>
            <span className="note">
              Saving never overwrites — the previous version stays in the list
              and every email records the version that wrote it.
            </span>
          </div>
        </form>
      </div>
    </>
  );
}
