"use client";

import { useTransition } from "react";
import { toggleAutoSend } from "@/app/actions";

export function AutoSendToggle({ id, on }: { id: string; on: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <span className="toggle-cell" style={pending ? { opacity: 0.5 } : undefined}>
      <button
        className={`toggle ${on ? "on" : ""}`}
        aria-label={on ? "Auto-send on — click to require review" : "Auto-send off — click to send automatically"}
        disabled={pending}
        onClick={() => {
          const fd = new FormData();
          fd.set("id", id);
          fd.set("next", String(!on));
          startTransition(() => toggleAutoSend(fd));
        }}
      />
      {on ? "Automatic" : "Review first"}
    </span>
  );
}
