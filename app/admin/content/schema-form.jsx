"use client";

import { useState } from "react";
import {
  emptyValueFor,
  fieldKind,
  moveItem,
  normalizeFormValue,
  setAtPath,
  unwrapNullable,
} from "@/lib/admin/form-model.mjs";

// ── Labels and identifiers ──
const LONG_TEXT = /description|introduction|statement|summary|philosophy|intro|body|note/i;

function humanize(key) {
  const words = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const ITEM_LABEL_KEYS = ["title", "label", "name", "company", "qualification", "id"];

function itemLabel(item, index) {
  if (item && typeof item === "object") {
    const key = ITEM_LABEL_KEYS.find(
      (candidate) => typeof item[candidate] === "string" && item[candidate].trim(),
    );
    if (key) return `${index + 1}. ${item[key]}`;
  }
  return `Item ${index + 1}`;
}

function fieldId(path) {
  return `field-${path.length ? path.join("-") : "document"}`;
}

function issueKey(path) {
  return path.join(".");
}

function belongsToDocument(schema, issuePath) {
  const [first] = issuePath.split(".");
  const kind = fieldKind(schema);
  if (kind === "array") return /^\d+$/.test(first);
  if (kind === "object") return Object.hasOwn(unwrapNullable(schema).schema.properties, first);
  return false;
}

const STATUS_MESSAGES = Object.freeze({
  401: "Your session has expired. Sign in again in another tab, then save. Your edits are still here.",
  403: "This request was rejected. Reload the page and try again.",
  405: "Saving is disabled because content editing is not configured for this deployment.",
  409: "This document changed elsewhere since you opened it. Copy your edits, reload, and apply them again.",
  413: "This document is too large to save.",
  422: "Fix the highlighted fields before saving.",
  502: "The storage credentials were rejected. Ask the site owner to check GITHUB_CONTENT_TOKEN.",
});

// ── Field renderers ──
function ErrorText({ id, message }) {
  if (!message) return null;
  return (
    <p className="admin-field-error" id={`${id}-error`} role="alert">
      {message}
    </p>
  );
}

function controlProps(path, issues) {
  const id = fieldId(path);
  const message = issues[issueKey(path)];
  return {
    id,
    message,
    attributes: {
      id,
      "aria-invalid": message ? "true" : undefined,
      "aria-describedby": message ? `${id}-error` : undefined,
    },
  };
}

function ScalarField({ schema, path, value, label, onChange, issues }) {
  const { schema: inner, nullable } = unwrapNullable(schema);
  const kind = fieldKind(inner);
  const { id, message, attributes } = controlProps(path, issues);
  const display = value ?? "";

  let control;
  if (kind === "boolean") {
    control = (
      <input
        {...attributes}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(path, event.target.checked)}
      />
    );
  } else if (kind === "enum") {
    control = (
      <select {...attributes} value={display} onChange={(event) => onChange(path, event.target.value)}>
        {inner.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (kind === "integer" || kind === "number") {
    control = (
      <input
        {...attributes}
        type="number"
        step={kind === "integer" ? 1 : "any"}
        value={display}
        onChange={(event) =>
          onChange(path, event.target.value === "" ? "" : Number(event.target.value))
        }
      />
    );
  } else if (kind === "const") {
    control = <input {...attributes} type="text" value={String(inner.const)} readOnly />;
  } else {
    const long = LONG_TEXT.test(String(path.at(-1))) || String(display).length > 90;
    control = long ? (
      <textarea {...attributes} rows={4} value={display} onChange={(event) => onChange(path, event.target.value)} />
    ) : (
      <input {...attributes} type="text" value={display} onChange={(event) => onChange(path, event.target.value)} />
    );
  }

  return (
    <div className={`admin-field admin-field-${kind}`}>
      <label htmlFor={id}>{label}</label>
      <div className="admin-field-control">
        {control}
        {nullable && kind !== "boolean" && value !== null && value !== undefined && (
          <button type="button" className="admin-secondary" onClick={() => onChange(path, null)}>
            Clear {label}
          </button>
        )}
      </div>
      <ErrorText id={id} message={message} />
    </div>
  );
}

function JsonField({ schema, path, value, label, onChange, issues, onJsonValidity }) {
  const { id, message, attributes } = controlProps(path, issues);
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [parseError, setParseError] = useState("");
  return (
    <div className="admin-field admin-field-json">
      <label htmlFor={id}>{label} (JSON)</label>
      <textarea
        {...attributes}
        rows={Math.min(24, text.split("\n").length + 1)}
        value={text}
        spellCheck={false}
        onChange={(event) => {
          setText(event.target.value);
          try {
            onChange(path, JSON.parse(event.target.value));
            setParseError("");
            onJsonValidity(issueKey(path), true);
          } catch {
            setParseError("This is not valid JSON yet.");
            onJsonValidity(issueKey(path), false);
          }
        }}
      />
      <ErrorText id={id} message={parseError || message} />
    </div>
  );
}

function ArrayField({ schema, path, value, label, onChange, issues, disabled, onJsonValidity }) {
  const { schema: inner } = unwrapNullable(schema);
  const items = Array.isArray(value) ? value : [];
  const { id, message } = controlProps(path, issues);
  return (
    <fieldset className="admin-fieldset" aria-describedby={message ? `${id}-error` : undefined}>
      <legend>{label}</legend>
      <ErrorText id={id} message={message} />
      <ol className="admin-array">
        {items.map((item, index) => (
          <li key={index} className="admin-array-item">
            <Field
              schema={inner.items}
              path={[...path, index]}
              value={item}
              label={itemLabel(item, index)}
              onChange={onChange}
              onJsonValidity={onJsonValidity}
              issues={issues}
              disabled={disabled}
            />
            <div className="admin-array-actions">
              <button
                type="button"
                className="admin-secondary"
                disabled={index === 0}
                onClick={() => onChange(path, moveItem(items, index, index - 1))}
                aria-label={`Move item ${index + 1} up in ${label}`}
              >
                Move up
              </button>
              <button
                type="button"
                className="admin-secondary"
                disabled={index === items.length - 1}
                onClick={() => onChange(path, moveItem(items, index, index + 1))}
                aria-label={`Move item ${index + 1} down in ${label}`}
              >
                Move down
              </button>
              <button
                type="button"
                className="admin-secondary"
                onClick={() => onChange(path, items.filter((_, position) => position !== index))}
                aria-label={`Remove item ${index + 1} from ${label}`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="admin-secondary"
        onClick={() => onChange(path, [...items, emptyValueFor(inner.items)])}
        aria-label={`Add item to ${label}`}
      >
        Add item
      </button>
    </fieldset>
  );
}

function RecordField({ schema, path, value, label, onChange, issues, disabled, onJsonValidity }) {
  const { schema: inner } = unwrapNullable(schema);
  const entries = Object.entries(value ?? {});
  const [newKey, setNewKey] = useState("");
  const { id, message } = controlProps(path, issues);
  const keyId = `${id}-new-key`;
  return (
    <fieldset className="admin-fieldset">
      <legend>{label}</legend>
      <ErrorText id={id} message={message} />
      {entries.map(([key, entry]) => (
        <div className="admin-record-row" key={key}>
          <Field
            schema={inner.additionalProperties}
            path={[...path, key]}
            value={entry}
            label={key}
            onChange={onChange}
            onJsonValidity={onJsonValidity}
            issues={issues}
            disabled={disabled}
          />
          <button
            type="button"
            className="admin-secondary"
            onClick={() =>
              onChange(path, Object.fromEntries(entries.filter(([candidate]) => candidate !== key)))
            }
            aria-label={`Remove ${key} from ${label}`}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="admin-record-add">
        <label htmlFor={keyId}>New key</label>
        <input id={keyId} type="text" value={newKey} onChange={(event) => setNewKey(event.target.value)} />
        <button
          type="button"
          className="admin-secondary"
          disabled={!newKey.trim() || Object.hasOwn(value ?? {}, newKey.trim())}
          onClick={() => {
            onChange(path, { ...(value ?? {}), [newKey.trim()]: emptyValueFor(inner.additionalProperties) });
            setNewKey("");
          }}
          aria-label={`Add entry to ${label}`}
        >
          Add entry
        </button>
      </div>
    </fieldset>
  );
}

function ObjectField({ schema, path, value, label, onChange, issues, disabled, onJsonValidity }) {
  const { schema: inner } = unwrapNullable(schema);
  const { id, message } = controlProps(path, issues);
  const fields = Object.entries(inner.properties).map(([key, propertySchema]) => (
    <Field
      key={key}
      schema={propertySchema}
      path={[...path, key]}
      value={value?.[key]}
      label={humanize(key)}
      onChange={onChange}
      onJsonValidity={onJsonValidity}
      issues={issues}
      disabled={disabled}
    />
  ));
  if (path.length === 0) return <div className="admin-form-fields">{fields}</div>;
  return (
    <fieldset className="admin-fieldset">
      <legend>{label}</legend>
      <ErrorText id={id} message={message} />
      {fields}
    </fieldset>
  );
}

function Field(props) {
  const kind = fieldKind(props.schema);
  if (kind === "object") return <ObjectField {...props} />;
  if (kind === "array") return <ArrayField {...props} />;
  if (kind === "record") return <RecordField {...props} />;
  if (kind === "json") return <JsonField {...props} />;
  return <ScalarField {...props} />;
}

// ── Form ──
export default function SchemaForm({
  documentId,
  label,
  jsonSchema,
  initialData,
  revision: initialRevision,
  writable,
  liveAfterWrite,
}) {
  const [value, setValue] = useState(initialData);
  const [revision, setRevision] = useState(initialRevision);
  const [issues, setIssues] = useState({});
  const [otherIssues, setOtherIssues] = useState([]);
  const [status, setStatus] = useState({ message: "", commitUrl: null });
  const [busy, setBusy] = useState(false);
  const [invalidJson, setInvalidJson] = useState(() => new Set());

  function onJsonValidity(key, valid) {
    setInvalidJson((current) => {
      const next = new Set(current);
      if (valid) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onChange(path, next) {
    setValue((current) => setAtPath(current, path, next));
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || !writable) return;
    if (invalidJson.size > 0) {
      setStatus({ message: "Fix the invalid JSON before saving.", commitUrl: null });
      return;
    }
    setBusy(true);
    setStatus({ message: "Saving…", commitUrl: null });
    try {
      const response = await fetch(`/admin/content/${encodeURIComponent(documentId)}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: normalizeFormValue(jsonSchema, value),
          expectedRevision: revision,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok) {
        setRevision(body.revision);
        setIssues({});
        setOtherIssues([]);
        setStatus({
          message: body.liveAfterWrite
            ? "Saved. Live now."
            : "Committed. Live after Netlify deploys (about 1–2 minutes).",
          commitUrl: body.commitUrl ?? null,
        });
        return;
      }
      const fieldIssues = {};
      const unmatched = [];
      for (const issue of body.issues ?? []) {
        if (issue.path && belongsToDocument(jsonSchema, issue.path)) {
          fieldIssues[issue.path] ??= issue.message;
        } else {
          unmatched.push(issue);
        }
      }
      setIssues(fieldIssues);
      setOtherIssues(unmatched);
      setStatus({
        message: STATUS_MESSAGES[response.status] ?? body.message ?? "Saving failed. Try again.",
        commitUrl: null,
      });
    } catch {
      setStatus({ message: "Saving failed. Check your connection and try again.", commitUrl: null });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-schema-form" onSubmit={submit} noValidate aria-label={`Edit ${label}`}>
      {!writable && (
        <p className="admin-notice">
          Saving is disabled: this deployment has no writable content store. Configure
          PORTFOLIO_CONTENT_STORE to enable editing.
        </p>
      )}
      <fieldset disabled={!writable || busy} className="admin-form-body">
        <Field
          schema={jsonSchema}
          path={[]}
          value={value}
          label={label}
          onChange={onChange}
          onJsonValidity={onJsonValidity}
          issues={issues}
          disabled={!writable}
        />
      </fieldset>
      {otherIssues.length > 0 && (
        <div className="admin-error" role="alert">
          <p>These problems must be fixed before saving:</p>
          <ul>
            {otherIssues.map((issue) => (
              <li key={`${issue.path}:${issue.message}`}>
                {issue.path ? <code>{issue.path}</code> : "Document"}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="admin-form-actions">
        <button type="submit" disabled={!writable || busy}>
          Save changes
        </button>
        <p className="admin-save-status" data-save-status role="status" aria-live="polite">
          {status.message}
          {status.commitUrl && (
            <>
              {" "}
              <a href={status.commitUrl} target="_blank" rel="noreferrer">
                View commit
              </a>
            </>
          )}
        </p>
      </div>
      <p className="admin-hint">
        {liveAfterWrite
          ? "Changes are written to local files and appear on the site immediately."
          : "Changes are committed to GitHub and appear after the next deploy."}
      </p>
    </form>
  );
}
