import assert from "node:assert/strict";
import test from "node:test";
import { handleContact, validateContact, type ContactEnv } from "./contact.ts";

const env: ContactEnv = {
  RESEND_API_KEY: "re_test",
  TURNSTILE_SECRET_KEY: "turnstile_test",
  RESEND_FROM: "Momentum Apps <website@momentum-apps.com>",
};

function request(body: Record<string, string>, headers: Record<string, string> = {}): Request {
  return new Request("https://momentum-apps.com/api/contact", {
    method: "POST",
    headers: {
      origin: "https://momentum-apps.com",
      accept: "application/json",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "support",
  message: "The reading view skips a line on my phone.",
  "cf-turnstile-response": "token-ok",
  hp_field: "",
};

test("accepts a complete message", () => {
  const result = validateContact({
    name: "  Ada   Lovelace ",
    email: "ada@example.com",
    subject: "GENERAL",
    message: "  Hello there, I have a question about the apps. ",
    turnstileToken: "token",
    honeypot: "",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.name, "Ada Lovelace");
    assert.equal(result.value.subject, "general");
  }
});

test("rejects short messages, bad emails, and unknown topics", () => {
  const result = validateContact({
    name: "",
    email: "not-an-email",
    subject: "billing",
    message: "too short",
    turnstileToken: "",
    honeypot: " ",
  });
  assert.equal(result.ok, false);
  if (!result.ok && "errors" in result) {
    assert.ok(result.errors.name);
    assert.ok(result.errors.email);
    assert.ok(result.errors.subject);
    assert.ok(result.errors.message);
    assert.ok(result.errors.turnstile);
  }
});

test("honeypot pretends to succeed and does not call Resend", async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => {
    called = true;
    return new Response("{}", { status: 200 });
  };
  const response = await handleContact(request({ ...valid, hp_field: "https://spam.test" }), env, fetchImpl);
  assert.equal(response.status, 200);
  assert.equal(called, false);
  const body = await response.json();
  assert.equal(body.ok, true);
});

test("sends a verified message through Resend with reply_to", async () => {
  const seen: { url: string; body: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    seen.push({ url, body: String(init?.body ?? "") });
    if (url.includes("siteverify")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  };

  const response = await handleContact(request(valid), env, fetchImpl);
  assert.equal(response.status, 200);
  assert.equal(seen.length, 2);
  assert.match(seen[0].url, /siteverify/);
  assert.match(seen[0].body, /token-ok/);
  const email = JSON.parse(seen[1].body);
  assert.equal(email.to[0], "support@momentum-apps.com");
  assert.equal(email.reply_to, "ada@example.com");
  assert.match(email.subject, /Support from Ada Lovelace/);
  assert.match(email.text, /The reading view skips a line/);
});

test("does not send when Turnstile rejects the token", async () => {
  let resendCalled = false;
  const fetchImpl: typeof fetch = async (input) => {
    if (String(input).includes("resend")) resendCalled = true;
    return new Response(JSON.stringify({ success: false }), { status: 200 });
  };
  const response = await handleContact(request(valid), env, fetchImpl);
  assert.equal(response.status, 400);
  assert.equal(resendCalled, false);
  const body = await response.json();
  assert.equal(body.errors.turnstile.length > 0, true);
});

test("reports missing configuration instead of calling Resend", async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => {
    called = true;
    return new Response("{}", { status: 200 });
  };
  const response = await handleContact(request(valid), {}, fetchImpl);
  assert.equal(response.status, 500);
  assert.equal(called, false);
});

test("redirects a no-JavaScript form post to the thanks page", async () => {
  const fetchImpl: typeof fetch = async (input) => {
    if (String(input).includes("siteverify")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  };
  const form = new Request("https://momentum-apps.com/api/contact", {
    method: "POST",
    headers: {
      origin: "https://momentum-apps.com",
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(valid),
  });
  const response = await handleContact(form, env, fetchImpl);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/thanks.html");
});

test("rejects a foreign origin", async () => {
  const response = await handleContact(
    request(valid, { origin: "https://example.com" }),
    env,
    async () => new Response("{}", { status: 200 }),
  );
  assert.equal(response.status, 403);
});
