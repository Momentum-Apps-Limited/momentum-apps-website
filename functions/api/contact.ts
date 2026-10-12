export interface ContactEnv {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_FROM?: string;
}

export const SUBJECTS = {
  general: "General inquiry",
  support: "Support",
  feedback: "Feedback",
  partnership: "Partnership",
} as const;

export type SubjectKey = keyof typeof SUBJECTS;

const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DEFAULT_FROM = "Momentum Apps <website@momentum-apps.com>";
const SUPPORT = "support@momentum-apps.com";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
  honeypot: string;
}

export interface CleanContact {
  name: string;
  email: string;
  subject: SubjectKey;
  subjectLabel: string;
  message: string;
  turnstileToken: string;
}

export type FieldName = "name" | "email" | "subject" | "message" | "turnstile";
export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationResult =
  | { ok: true; value: CleanContact }
  | { ok: false; honeypot: true }
  | { ok: false; errors: FieldErrors };

function cleanName(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().replace(/\s+/g, " ");
}

export function validateContact(input: ContactInput): ValidationResult {
  if (input.honeypot.trim() !== "") {
    return { ok: false, honeypot: true };
  }

  const errors: FieldErrors = {};
  const name = cleanName(input.name);
  const email = input.email.trim();
  const subject = input.subject.trim().toLowerCase();
  const message = input.message.trim();
  const turnstileToken = input.turnstileToken.trim();

  if (name.length < 1 || name.length > 100) {
    errors.name = "Enter your name (1 to 100 characters).";
  }
  if (!EMAIL.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address.";
  }
  if (!(subject in SUBJECTS)) {
    errors.subject = "Choose a topic.";
  }
  if (message.length < 10 || message.length > 5000) {
    errors.message = "Enter a message between 10 and 5,000 characters.";
  }
  if (!turnstileToken) {
    errors.turnstile = "Complete the verification check.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      subject: subject as SubjectKey,
      subjectLabel: SUBJECTS[subject as SubjectKey],
      message,
      turnstileToken,
    },
  };
}

function originAllowed(origin: string | null): boolean {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (url.protocol !== "https:") return false;
    if (host === "momentum-apps.com" || host === "www.momentum-apps.com") return true;
    if (host.endsWith(".pages.dev")) return true;
    return false;
  } catch {
    return false;
  }
}

async function readInput(request: Request): Promise<ContactInput | null> {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = (await request.json()) as Record<string, unknown>;
      const stringValue = (key: string) => (typeof data[key] === "string" ? data[key] : "");
      return {
        name: stringValue("name"),
        email: stringValue("email"),
        subject: stringValue("subject"),
        message: stringValue("message"),
        turnstileToken: stringValue("cf-turnstile-response") || stringValue("turnstileToken"),
        honeypot: stringValue("hp_field") || stringValue("company"),
      };
    }

    const form = await request.formData();
    const stringValue = (key: string) => {
      const value = form.get(key);
      return typeof value === "string" ? value : "";
    };
    return {
      name: stringValue("name"),
      email: stringValue("email"),
      subject: stringValue("subject"),
      message: stringValue("message"),
      turnstileToken: stringValue("cf-turnstile-response"),
      honeypot: stringValue("hp_field"),
    };
  } catch {
    return null;
  }
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") || "";
  const contentType = request.headers.get("content-type") || "";
  return accept.includes("application/json") || contentType.includes("application/json");
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function redirect(request: Request, location: string): Response {
  const url = new URL(location, request.url);
  return new Response(null, {
    status: 303,
    headers: {
      location: `${url.pathname}${url.search}`,
      "cache-control": "no-store",
    },
  });
}

function fail(request: Request, status: number, body: Record<string, unknown>, htmlTarget: string): Response {
  if (wantsJson(request)) return json(status, body);
  return redirect(request, htmlTarget);
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (!originAllowed(request.headers.get("origin"))) {
    return fail(request, 403, { ok: false, error: "This form cannot be submitted from that site." }, "/form-error.html");
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > 50_000) {
    return fail(request, 413, { ok: false, error: "That message is too large." }, "/form-error.html");
  }

  const input = await readInput(request);
  if (!input) {
    return fail(request, 400, { ok: false, error: "We could not read that submission." }, "/form-error.html");
  }

  const result = validateContact(input);
  if (!result.ok && "honeypot" in result) {
    return wantsJson(request) ? json(200, { ok: true }) : redirect(request, "/thanks.html");
  }
  if (!result.ok) {
    return fail(
      request,
      400,
      { ok: false, error: "Check the form and try again.", errors: result.errors },
      "/form-error.html",
    );
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    return fail(
      request,
      500,
      { ok: false, error: "The contact form is not configured yet." },
      "/form-error.html",
    );
  }

  const verifyBody = new URLSearchParams();
  verifyBody.set("secret", env.TURNSTILE_SECRET_KEY);
  verifyBody.set("response", result.value.turnstileToken);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) verifyBody.set("remoteip", ip);

  let verified = false;
  try {
    const verifyResponse = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: verifyBody,
    });
    const verifyJson = (await verifyResponse.json()) as { success?: boolean };
    verified = verifyResponse.ok && verifyJson.success === true;
  } catch (error) {
    console.error("Turnstile verification request failed", error);
    verified = false;
  }

  if (!verified) {
    return fail(
      request,
      400,
      {
        ok: false,
        error: "Verification failed. Please try again.",
        errors: { turnstile: "Verification failed. Please try again." },
      },
      "/form-error.html",
    );
  }

  const { name, email, subjectLabel, message } = result.value;
  const resendResponse = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || DEFAULT_FROM,
      to: [SUPPORT],
      reply_to: email,
      subject: `[Website] ${subjectLabel} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${subjectLabel}\n\n${message}\n`,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    console.error("Resend request failed", resendResponse.status, detail.slice(0, 500));
    return fail(
      request,
      502,
      { ok: false, error: "We could not send your message just now." },
      "/form-error.html",
    );
  }

  return wantsJson(request) ? json(200, { ok: true }) : redirect(request, "/thanks.html");
}

export const onRequestPost = (context: { request: Request; env: ContactEnv }) =>
  handleContact(context.request, context.env);
