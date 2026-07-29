"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthClient, createServiceClient, requireUser } from "@/lib/supabase";

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function approveEmail(formData: FormData) {
  await requireUser();
  const db = createServiceClient();
  const id = formData.get("id") as string;
  const finalSubject = (formData.get("final_subject") as string) || null;
  const finalBody = (formData.get("final_body") as string) || null;

  const { error } = await db
    .from("emails")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      final_subject: finalSubject,
      final_body: finalBody,
    })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw new Error(error.message);
  revalidatePath("/queue");
  revalidatePath("/history");
}

export async function rejectEmail(formData: FormData) {
  await requireUser();
  const db = createServiceClient();
  const id = formData.get("id") as string;
  const { error } = await db
    .from("emails")
    .update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw new Error(error.message);
  revalidatePath("/queue");
  revalidatePath("/history");
}

export async function regenerateEmail(formData: FormData) {
  await requireUser();
  const id = formData.get("id") as string;
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/regenerate-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET!,
      },
      body: JSON.stringify({ email_id: id }),
    }
  );
  if (!resp.ok) throw new Error(`Regenerate failed: ${await resp.text()}`);
  revalidatePath("/queue");
}

export async function toggleAutoSend(formData: FormData) {
  await requireUser();
  const db = createServiceClient();
  const id = formData.get("id") as string;
  const next = formData.get("next") === "true";
  const { error } = await db
    .from("subscribers")
    .update({ auto_send: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/subscribers");
}

export async function savePromptVersion(formData: FormData) {
  await requireUser();
  const db = createServiceClient();

  const systemPrompt = formData.get("system_prompt") as string;
  const userTemplate = formData.get("user_prompt_template") as string;
  const model = formData.get("model") as string;
  const notes = (formData.get("notes") as string) || null;
  if (!systemPrompt?.trim() || !userTemplate?.trim()) {
    throw new Error("System prompt and daily template are both required.");
  }

  const { data: latest } = await db
    .from("prompt_templates")
    .select("version")
    .eq("name", "daily-manifestation")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version ?? 0) + 1;

  const { error: insertError } = await db.from("prompt_templates").insert({
    name: "daily-manifestation",
    version: nextVersion,
    system_prompt: systemPrompt,
    user_prompt_template: userTemplate,
    model,
    notes,
    is_active: true,
  });
  if (insertError) throw new Error(insertError.message);

  const { error: deactivateError } = await db
    .from("prompt_templates")
    .update({ is_active: false })
    .eq("name", "daily-manifestation")
    .neq("version", nextVersion);
  if (deactivateError) throw new Error(deactivateError.message);

  revalidatePath("/prompts");
  redirect(`/prompts?saved=v${nextVersion}`);
}
