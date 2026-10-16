"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../icons";

/**
 * Activation form with an inline confirmation step once hydrated. Without
 * JavaScript the button posts directly, exactly as before.
 */
export default function ActivateControl({ themeId, label, disabled }) {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef(null);
  const confirmRef = useRef(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [confirming]);

  function cancel() {
    restoreFocus.current = true;
    setConfirming(false);
  }

  const promptId = `activate-${themeId}-prompt`;

  return (
    <form
      className="admin-activate"
      action="/admin/theme/activate"
      method="post"
      data-confirming={confirming || undefined}
      onKeyDown={(event) => {
        if (confirming && event.key === "Escape") cancel();
      }}
    >
      <input type="hidden" name="themeId" value={themeId} />
      {confirming ? (
        <div className="admin-confirm" role="group" aria-labelledby={promptId}>
          <p id={promptId}>Publish {label} to every visitor?</p>
          <div className="admin-confirm-actions">
            <button ref={confirmRef} className="admin-button" data-variant="primary" type="submit">
              <Icon name="check" />
              Confirm
            </button>
            <button className="admin-button" data-variant="ghost" type="button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={triggerRef}
          className="admin-button"
          data-variant="primary"
          type="submit"
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();
            setConfirming(true);
          }}
        >
          Activate {label}
        </button>
      )}
    </form>
  );
}
