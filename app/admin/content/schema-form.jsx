"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  canClear,
  emptyValueFor,
  fieldId,
  fieldKind,
  focusAfterMove,
  issueSummary,
  moveItem,
  normalizeFormValue,
  setAtPath,
  unwrapNullable,
} from "@/lib/admin/form-model.mjs";
import Icon from "../icons";

// ── Labels and identifiers ──
const LONG_TEXT = /description|introduction|statement|summary|philosophy|intro|body|note/i;
const COMPLEX_KINDS = new Set(["object", "record", "array", "json"]);

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

function isComplex(schema) {
  return COMPLEX_KINDS.has(fieldKind(schema));
}

function textRows(text) {
  const length = String(text ?? "").length;
  return Math.min(10, Math.max(3, Math.ceil(length / 80) + 1));
}

function shortRevision(revision) {
  return typeof revision === "string" ? revision.slice(0, 7) : "";
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

// ── Shared form state for nested fields ──
const FormContext = createContext(null);

function useForm() {
  return useContext(FormContext);
}

function hasIssueWithin(issues, key) {
  return Object.keys(issues).some((path) => path === key || path.startsWith(`${key}.`));
}

// ── Field renderers ──
// Field errors are announced once, by the form's error summary.
function ErrorText({ id, message }) {
  if (!message) return null;
  return (
    <p className="admin-field-error" id={`${id}-error`}>
      <Icon name="alert" />
      <span>{message}</span>
    </p>
  );
}

function ClearButton({ schema, path, value, label }) {
  const { onChange } = useForm();
  if (!canClear(schema, value)) return null;
  return (
    <button
      type="button"
      className="admin-button"
      data-variant="ghost"
      data-size="small"
      onClick={() => onChange(path, null)}
      aria-label={`Clear ${label}`}
    >
      <Icon name="close" />
      Clear
    </button>
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

function ScalarField({ schema, path, value, label, labelHidden }) {
  const { onChange, issues } = useForm();
  const { schema: inner } = unwrapNullable(schema);
  const kind = fieldKind(inner);
  const { id, message, attributes } = controlProps(path, issues);
  const display = value ?? "";
  let wide = false;

  let control;
  if (kind === "boolean") {
    control = (
      <input
        {...attributes}
        className="admin-check"
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(path, event.target.checked)}
      />
    );
  } else if (kind === "enum") {
    control = (
      <select
        {...attributes}
        className="admin-input admin-select"
        value={display}
        onChange={(event) => onChange(path, event.target.value)}
      >
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
        className="admin-input"
        type="number"
        inputMode={kind === "integer" ? "numeric" : "decimal"}
        step={kind === "integer" ? 1 : "any"}
        value={display}
        onChange={(event) =>
          onChange(path, event.target.value === "" ? "" : Number(event.target.value))
        }
      />
    );
  } else if (kind === "const") {
    control = <input {...attributes} className="admin-input" type="text" value={String(inner.const)} readOnly />;
  } else {
    wide = LONG_TEXT.test(String(path.at(-1))) || String(display).length > 90;
    control = wide ? (
      <textarea
        {...attributes}
        className="admin-input admin-textarea"
        rows={textRows(display)}
        value={display}
        onChange={(event) => onChange(path, event.target.value)}
      />
    ) : (
      <input
        {...attributes}
        className="admin-input"
        type="text"
        value={display}
        onChange={(event) => onChange(path, event.target.value)}
      />
    );
  }

  return (
    <div
      className={`admin-field admin-field-${kind}`}
      data-wide={wide || undefined}
      data-invalid={message ? "true" : undefined}
    >
      <label className={labelHidden ? "admin-sr-only" : "admin-label"} htmlFor={id}>
        {label}
      </label>
      <div className="admin-field-control">
        {control}
        <ClearButton schema={schema} path={path} value={value} label={label} />
      </div>
      <ErrorText id={id} message={message} />
    </div>
  );
}

function JsonField({ path, value, label }) {
  const { onChange, issues, onJsonValidity } = useForm();
  const { id, message, attributes } = controlProps(path, issues);
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [parseError, setParseError] = useState("");
  const shown = parseError || message;
  return (
    <div className="admin-field admin-field-json" data-wide="true" data-invalid={shown ? "true" : undefined}>
      <label className="admin-label" htmlFor={id}>
        {label} (JSON)
      </label>
      <p className="admin-field-hint">
        This document mixes several shapes, so it is edited as JSON. It is checked as you type.
      </p>
      <textarea
        {...attributes}
        className="admin-input admin-textarea admin-code"
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
      <ErrorText id={id} message={shown} />
    </div>
  );
}

function ItemTools({ index, count, label, moveControlId, onMove, onRemove }) {
  return (
    <div className="admin-item-tools">
      <button
        type="button"
        id={moveControlId(index, "up")}
        className="admin-icon-button"
        disabled={index === 0}
        onClick={() => onMove(index, "up")}
        aria-label={`Move item ${index + 1} up in ${label}`}
        title="Move up"
      >
        <Icon name="up" />
      </button>
      <button
        type="button"
        id={moveControlId(index, "down")}
        className="admin-icon-button"
        disabled={index === count - 1}
        onClick={() => onMove(index, "down")}
        aria-label={`Move item ${index + 1} down in ${label}`}
        title="Move down"
      >
        <Icon name="down" />
      </button>
      <button
        type="button"
        className="admin-icon-button"
        data-tone="danger"
        onClick={() => onRemove(index)}
        aria-label={`Remove item ${index + 1} from ${label}`}
        title="Remove"
      >
        <Icon name="remove" />
      </button>
    </div>
  );
}

function ArrayField({ schema, path, value, label, legendHidden }) {
  const { onChange, onRemove, issues, expanded, toggle, reveal } = useForm();
  const { schema: inner } = unwrapNullable(schema);
  const items = Array.isArray(value) ? value : [];
  const { id, message } = controlProps(path, issues);
  const moveControlId = (index, control) => `${id}-item-${index}-move-${control}`;
  const collapsible = isComplex(inner.items);

  function move(index, direction) {
    onChange(path, moveItem(items, index, direction === "up" ? index - 1 : index + 1));
    const target = focusAfterMove(index, direction, items.length);
    requestAnimationFrame(() =>
      document.getElementById(moveControlId(target.index, target.control))?.focus(),
    );
  }

  function add() {
    const index = items.length;
    onChange(path, [...items, emptyValueFor(inner.items)]);
    reveal([...path, index], { focusFirst: true });
  }

  return (
    <fieldset
      className="admin-fieldset"
      id={id}
      tabIndex={-1}
      aria-describedby={message ? `${id}-error` : undefined}
    >
      <legend className={legendHidden ? "admin-sr-only" : undefined}>
        {label}
        <span className="admin-count">{items.length}</span>
      </legend>
      <div className="admin-fieldset-tools">
        <ClearButton schema={schema} path={path} value={value} label={label} />
      </div>
      <ErrorText id={id} message={message} />
      {items.length === 0 ? (
        <p className="admin-empty">No items yet.</p>
      ) : (
        <ol className="admin-array" data-collapsible={collapsible || undefined}>
          {items.map((item, index) => {
            const itemPath = [...path, index];
            const key = issueKey(itemPath);
            const tools = (
              <ItemTools
                index={index}
                count={items.length}
                label={label}
                moveControlId={moveControlId}
                onMove={move}
                onRemove={(position) => onRemove(path, items, position, itemLabel(item, position))}
              />
            );
            if (!collapsible) {
              return (
                <li key={index} className="admin-array-row">
                  <span className="admin-array-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <Field schema={inner.items} path={itemPath} value={item} label={itemLabel(item, index)} labelHidden />
                  {tools}
                </li>
              );
            }
            const open = expanded.has(key);
            const bodyId = `${fieldId(itemPath)}-body`;
            const flagged = hasIssueWithin(issues, key);
            return (
              <li key={index} className="admin-array-item" data-open={open || undefined}>
                <div className="admin-item-head">
                  <button
                    type="button"
                    className="admin-item-toggle"
                    id={`${fieldId(itemPath)}-toggle`}
                    aria-expanded={open}
                    aria-controls={open ? bodyId : undefined}
                    onClick={() => toggle(key)}
                  >
                    <Icon name="chevron" className="admin-icon admin-chevron" />
                    <span className="admin-item-title">{itemLabel(item, index)}</span>
                    {flagged && (
                      <span className="admin-badge" data-tone="error">
                        <Icon name="alert" />
                        Needs a fix
                      </span>
                    )}
                  </button>
                  {tools}
                </div>
                {open && (
                  <div className="admin-item-body" id={bodyId}>
                    <Field schema={inner.items} path={itemPath} value={item} label={itemLabel(item, index)} legendHidden />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <button
        type="button"
        className="admin-button admin-add"
        data-variant="secondary"
        data-size="small"
        onClick={add}
        aria-label={`Add item to ${label}`}
      >
        <Icon name="add" />
        Add item
      </button>
    </fieldset>
  );
}

function RecordField({ schema, path, value, label, legendHidden }) {
  const { onChange, issues } = useForm();
  const { schema: inner } = unwrapNullable(schema);
  const entries = Object.entries(value ?? {});
  const [newKey, setNewKey] = useState("");
  const { id, message } = controlProps(path, issues);
  const keyId = `${id}-new-key`;
  const trimmed = newKey.trim();
  const duplicate = Boolean(trimmed) && Object.hasOwn(value ?? {}, trimmed);

  function addEntry() {
    if (!trimmed || duplicate) return;
    onChange(path, { ...(value ?? {}), [trimmed]: emptyValueFor(inner.additionalProperties) });
    setNewKey("");
  }

  return (
    <fieldset className="admin-fieldset" id={id} tabIndex={-1}>
      <legend className={legendHidden ? "admin-sr-only" : undefined}>
        {label}
        <span className="admin-count">{entries.length}</span>
      </legend>
      <div className="admin-fieldset-tools">
        <ClearButton schema={schema} path={path} value={value} label={label} />
      </div>
      <ErrorText id={id} message={message} />
      {entries.length === 0 && <p className="admin-empty">No entries yet.</p>}
      {entries.map(([key, entry]) => (
        <div className="admin-record-row" key={key}>
          <Field schema={inner.additionalProperties} path={[...path, key]} value={entry} label={key} />
          <button
            type="button"
            className="admin-icon-button"
            data-tone="danger"
            onClick={() =>
              onChange(path, Object.fromEntries(entries.filter(([candidate]) => candidate !== key)))
            }
            aria-label={`Remove ${key} from ${label}`}
            title="Remove"
          >
            <Icon name="remove" />
          </button>
        </div>
      ))}
      <div className="admin-record-add">
        <div className="admin-field">
          <label className="admin-label" htmlFor={keyId}>
            New key
          </label>
          <input
            className="admin-input"
            id={keyId}
            type="text"
            value={newKey}
            aria-describedby={duplicate ? `${keyId}-hint` : undefined}
            onChange={(event) => setNewKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addEntry();
              }
            }}
          />
          {duplicate && (
            <p className="admin-field-hint" id={`${keyId}-hint`}>
              That key already exists.
            </p>
          )}
        </div>
        <button
          type="button"
          className="admin-button"
          data-variant="secondary"
          data-size="small"
          disabled={!trimmed || duplicate}
          onClick={addEntry}
          aria-label={`Add entry to ${label}`}
        >
          <Icon name="add" />
          Add entry
        </button>
      </div>
    </fieldset>
  );
}

function ObjectField({ schema, path, value, label, legendHidden }) {
  const { issues } = useForm();
  const { schema: inner } = unwrapNullable(schema);
  const { id, message } = controlProps(path, issues);
  const entries = Object.entries(inner.properties);
  const renderField = ([key, propertySchema]) => (
    <Field
      key={key}
      schema={propertySchema}
      path={[...path, key]}
      value={value?.[key]}
      label={humanize(key)}
    />
  );

  if (path.length === 0) {
    const simple = entries.filter(([, propertySchema]) => !isComplex(propertySchema));
    const complex = entries.filter(([, propertySchema]) => isComplex(propertySchema));
    return (
      <div className="admin-form-fields">
        {simple.length > 0 && (
          <fieldset className="admin-fieldset" id="section-general" tabIndex={-1}>
            <legend>General</legend>
            <div className="admin-field-grid">{simple.map(renderField)}</div>
          </fieldset>
        )}
        {complex.map(renderField)}
      </div>
    );
  }

  return (
    <fieldset className="admin-fieldset" id={id} tabIndex={-1}>
      <legend className={legendHidden ? "admin-sr-only" : undefined}>{label}</legend>
      <div className="admin-fieldset-tools">
        <ClearButton schema={schema} path={path} value={value} label={label} />
      </div>
      <ErrorText id={id} message={message} />
      <div className="admin-field-grid">{entries.map(renderField)}</div>
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

// ── Outline ──
function outlineEntries(schema, value) {
  const kind = fieldKind(schema);
  if (kind === "array") {
    return (Array.isArray(value) ? value : []).map((item, index) => ({
      key: String(index),
      label: itemLabel(item, index),
      path: [index],
      target: `${fieldId([index])}-toggle`,
    }));
  }
  if (kind !== "object") return [];
  const properties = Object.entries(unwrapNullable(schema).schema.properties);
  const entries = [];
  if (properties.some(([, propertySchema]) => !isComplex(propertySchema))) {
    entries.push({ key: "", label: "General", path: [], target: "section-general" });
  }
  for (const [key, propertySchema] of properties) {
    if (isComplex(propertySchema)) {
      entries.push({ key, label: humanize(key), path: [key], target: fieldId([key]) });
    }
  }
  return entries;
}

function Outline({ entries, issues, onJump }) {
  if (entries.length < 3) return null;
  return (
    <nav className="admin-outline" aria-label="Document sections">
      <p className="admin-outline-title">On this page</p>
      <ol>
        {entries.map((entry) => {
          const flagged = entry.key
            ? hasIssueWithin(issues, entry.key)
            : Object.keys(issues).some((path) => !path.includes("."));
          return (
            <li key={entry.target}>
              <a
                href={`#${entry.target}`}
                onClick={(event) => {
                  event.preventDefault();
                  onJump(entry);
                }}
              >
                <span>{entry.label}</span>
                {flagged && (
                  <span className="admin-outline-flag">
                    <Icon name="alert" />
                    <span className="admin-sr-only">has errors</span>
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
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
  const [status, setStatus] = useState({ message: "", tone: "", commitUrl: null, conflict: false });
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [invalidJson, setInvalidJson] = useState(() => new Set());
  const [expanded, setExpanded] = useState(() => new Set());
  const [undo, setUndo] = useState(null);
  const formRef = useRef(null);
  const summaryRef = useRef(null);

  const summary = issueSummary(issues);
  const hasProblems = summary.length > 0 || otherIssues.length > 0;

  // ── Leave guard and keyboard save ──
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const save = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", save);
    return () => window.removeEventListener("keydown", save);
  }, []);

  // ── Disclosure ──
  function expandAncestors(current, path) {
    const next = new Set(current);
    for (let length = 1; length <= path.length; length += 1) {
      next.add(issueKey(path.slice(0, length)));
    }
    return next;
  }

  function toggle(key) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** Expand every collapsed item on the way to `path`, then bring it into view. */
  function reveal(path, { targetId, focusFirst = false } = {}) {
    setExpanded((current) => expandAncestors(current, path));
    requestAnimationFrame(() => {
      const id = targetId ?? fieldId(path);
      const target = document.getElementById(id);
      if (!target) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      const body = document.getElementById(`${fieldId(path)}-body`);
      const first = focusFirst ? body?.querySelector("input, textarea, select") : null;
      (first ?? target).focus({ preventScroll: true });
    });
  }

  // ── Edits ──
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
    setDirty(true);
  }

  function onRemove(path, items, index, itemName) {
    onChange(path, items.filter((_, position) => position !== index));
    setUndo({ path, items, itemName });
  }

  function undoRemove() {
    if (!undo) return;
    onChange(undo.path, undo.items);
    setUndo(null);
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || !writable) return;
    if (invalidJson.size > 0) {
      setStatus({ message: "Fix the invalid JSON before saving.", tone: "error", commitUrl: null });
      return;
    }
    setBusy(true);
    setUndo(null);
    setStatus({ message: "Saving…", tone: "busy", commitUrl: null });
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
        setDirty(false);
        setStatus({
          message: body.liveAfterWrite
            ? "Saved. Live now."
            : "Committed. Live after Netlify deploys (about 1–2 minutes).",
          tone: "success",
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
      setExpanded((current) =>
        Object.keys(fieldIssues).reduce(
          (next, path) => expandAncestors(next, path.split(".")),
          current,
        ),
      );
      setStatus({
        message: STATUS_MESSAGES[response.status] ?? body.message ?? "Saving failed. Try again.",
        tone: response.status === 409 ? "conflict" : "error",
        commitUrl: null,
        conflict: response.status === 409,
      });
      if (Object.keys(fieldIssues).length > 0 || unmatched.length > 0) {
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    } catch {
      setStatus({
        message: "Saving failed. Check your connection and try again.",
        tone: "error",
        commitUrl: null,
      });
    } finally {
      setBusy(false);
    }
  }

  const outline = outlineEntries(jsonSchema, value);
  const context = { onChange, onRemove, onJsonValidity, issues, expanded, toggle, reveal };

  return (
    <FormContext.Provider value={context}>
      <form
        ref={formRef}
        className="admin-schema-form"
        onSubmit={submit}
        noValidate
        aria-label={`Edit ${label}`}
        data-has-outline={outline.length >= 3 || undefined}
      >
        <Outline
          entries={outline}
          issues={issues}
          onJump={(entry) =>
            entry.path.length
              ? reveal(entry.path, { targetId: entry.target })
              : reveal([], { targetId: entry.target })
          }
        />

        <div className="admin-form-main">
          {!writable && (
            <p className="admin-callout" data-tone="warning">
              <Icon name="lock" />
              <span>
                Saving is disabled: this deployment has no writable content store.
                Configure <code>PORTFOLIO_CONTENT_STORE</code> to enable editing.
              </span>
            </p>
          )}

          {hasProblems && (
            <div className="admin-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
              <p className="admin-error-summary-title">
                <Icon name="alert" />
                These problems must be fixed before saving:
              </p>
              <ul>
                {summary.map((issue) => (
                  <li key={`field:${issue.path}`}>
                    <a
                      href={issue.href}
                      onClick={(event) => {
                        event.preventDefault();
                        reveal(issue.path.split("."));
                      }}
                    >
                      <code>{issue.path}</code>
                    </a>
                    : {issue.message}
                  </li>
                ))}
                {otherIssues.map((issue) => (
                  <li key={`${issue.path}:${issue.message}`}>
                    {issue.path ? <code>{issue.path}</code> : "Document"}: {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <fieldset disabled={!writable || busy} className="admin-form-body">
            <Field schema={jsonSchema} path={[]} value={value} label={label} />
          </fieldset>

          <div className="admin-savebar">
            <div className="admin-savebar-state">
              <p className="admin-dirty" data-dirty={dirty || undefined}>
                <span className="admin-dirty-dot" aria-hidden="true" />
                {dirty ? "Unsaved changes" : "No unsaved changes"}
              </p>
              <p
                className="admin-save-status"
                data-save-status
                data-tone={status.tone || undefined}
                role="status"
                aria-live="polite"
              >
                {status.message}
                {status.commitUrl && (
                  <>
                    {" "}
                    <a href={status.commitUrl} target="_blank" rel="noreferrer">
                      View commit
                    </a>
                  </>
                )}
                {status.conflict && (
                  <>
                    {" "}
                    <a href={`/admin/content/${encodeURIComponent(documentId)}`} target="_blank" rel="noreferrer">
                      Open the latest version in a new tab
                    </a>
                  </>
                )}
              </p>
              {undo && (
                <p className="admin-undo" role="status">
                  Removed &ldquo;{undo.itemName}&rdquo;.{" "}
                  <button type="button" className="admin-link-button" onClick={undoRemove}>
                    Undo
                  </button>
                </p>
              )}
            </div>
            <div className="admin-savebar-actions">
              {revision && (
                <span className="admin-revision" title={`Revision ${revision}`}>
                  rev {shortRevision(revision)}
                </span>
              )}
              <button
                className="admin-button"
                data-variant="primary"
                type="submit"
                disabled={!writable || busy}
                aria-keyshortcuts="Control+S Meta+S"
              >
                Save changes
              </button>
            </div>
          </div>
          <p className="admin-field-hint admin-save-hint">
            {liveAfterWrite
              ? "Changes are written to local files and appear on the site immediately."
              : "Changes are committed to GitHub and appear after the next deploy."}{" "}
            Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>S</kbd> to save.
          </p>
        </div>
      </form>
    </FormContext.Provider>
  );
}
