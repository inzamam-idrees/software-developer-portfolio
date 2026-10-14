import assert from "node:assert/strict";
import test from "node:test";
import {
  requestHasSameOrigin,
  sameOriginUrl,
} from "../../lib/admin/request-security.mjs";

function request(headers, url = "https://portfolio.example/admin/session") {
  return new Request(url, {
    method: "POST",
    headers,
  });
}

test("accepts an exact same-origin Origin header", () => {
  assert.equal(
    requestHasSameOrigin(request({ origin: "https://portfolio.example" })),
    true,
  );
});

test("accepts a browser same-origin form with Referer when Origin is omitted", () => {
  assert.equal(
    requestHasSameOrigin(
      request({
        referer: "https://portfolio.example/admin/login",
        "sec-fetch-site": "same-origin",
      }),
    ),
    true,
  );
});

test("accepts the transport Host when the runtime normalizes request.url", () => {
  assert.equal(
    requestHasSameOrigin(
      request(
        {
          host: "127.0.0.1:3017",
          origin: "http://127.0.0.1:3017",
        },
        "http://localhost:3017/admin/session",
      ),
    ),
    true,
  );
});

test("builds redirects from the verified browser origin instead of an internal host", () => {
  const incoming = request(
    {
      host: "127.0.0.1:3017",
      origin: "http://127.0.0.1:3017",
    },
    "http://localhost:3017/admin/session",
  );
  assert.equal(
    sameOriginUrl(incoming, "/admin/theme").href,
    "http://127.0.0.1:3017/admin/theme",
  );
});

test("rejects cross-site, missing, and malformed request provenance", () => {
  assert.equal(
    requestHasSameOrigin(
      request({
        origin: "https://attacker.example",
        referer: "https://portfolio.example/admin/login",
        "sec-fetch-site": "cross-site",
      }),
    ),
    false,
  );
  assert.equal(requestHasSameOrigin(request({})), false);
  assert.equal(
    requestHasSameOrigin(
      request({ referer: "not a url", "sec-fetch-site": "same-origin" }),
    ),
    false,
  );
});
