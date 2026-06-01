export const maxDuration = 30;

const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_TIMEOUT_MS = 28000;
const MAX_FIELD_LENGTH = 600;

type Priority = "Low" | "Medium" | "High";

type AnalyzeRequest = {
  department?: unknown;
  line?: unknown;
  machineType?: unknown;
  alarmText?: unknown;
  problemDescription?: unknown;
  operatingContext?: unknown;
  severity?: unknown;
};

type NormalizedForm = {
  department: string;
  line: string;
  machineType: string;
  alarmText: string;
  problemDescription: string;
  operatingContext: string;
  severity: Priority;
};

type AnalysisResult = {
  priority: Priority;
  detectedAnomaly: string;
  plainEnglishSummary: string;
  likelyCauses: string;
  recommendedChecks: string[];
  safetyReminders: string;
  escalationProtocol: string;
};

type ConciseGemmaResult = {
  summary?: unknown;
  detectedAnomaly?: unknown;
  plainEnglishSummary?: unknown;
  possibleCauses?: unknown;
  possible_causes?: unknown;
  likelyCauses?: unknown;
  operatorSafeChecks?: unknown;
  operator_safe_checks?: unknown;
  recommendedChecks?: unknown;
  escalationGuidance?: unknown;
  escalation_guidance?: unknown;
  escalationProtocol?: unknown;
  safetyNotes?: unknown;
  safety_notes?: unknown;
  safetyReminders?: unknown;
};

type MarkdownSectionKey =
  | "summary"
  | "possibleCauses"
  | "operatorSafeChecks"
  | "escalationGuidance"
  | "safetyNotes";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMMA_MODEL || DEFAULT_GEMMA_MODEL;

  logInfo("request_start", {
    model,
    hasApiKey: Boolean(apiKey),
  });

  if (!apiKey) {
    return Response.json(
      { error: "Gemini API key is not configured." },
      { status: 500 },
    );
  }

  let body: AnalyzeRequest;

  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch (error) {
    logError("invalid_request_json", error);
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  logInfo("request_payload", {
    keys: Object.keys(body),
  });

  const form = normalizeForm(body);

  if (!form.problemDescription) {
    return Response.json(
      { error: "Problem Description is required." },
      { status: 400 },
    );
  }

  try {
    const text = await generateGemmaAnalysis(apiKey, model, buildPrompt(form));
    const analysis = parseAnalysis(text, form);

    return Response.json({ analysis });
  } catch (error) {
    logError("analysis_route_failure", error);

    return Response.json(
      {
        error:
          "AI-assisted guidance is unavailable right now. Follow site procedures and escalate high-risk or unclear issues through the normal maintenance channel.",
      },
      { status: 502 },
    );
  }
}

function normalizeForm(body: AnalyzeRequest): NormalizedForm {
  return {
    department: getString(body.department, "Unspecified department"),
    line: getString(body.line, "Unspecified line"),
    machineType: getString(body.machineType, "Unspecified machine"),
    alarmText: getString(body.alarmText, "No alarm/error text provided"),
    problemDescription: getString(body.problemDescription),
    operatingContext: getString(
      body.operatingContext,
      "No additional symptoms or context provided",
    ),
    severity: normalizePriority(getString(body.severity)),
  };
}

function buildPrompt(form: NormalizedForm) {
  return `Return JSON only for an AI-assisted manufacturing troubleshooting helper.

Rules:
- This is not a guaranteed diagnosis.
- Recommend operator-safe checks only.
- Do not recommend repairs, bypassing guards, opening panels, or energized troubleshooting.
- Include escalation and safety guidance.

Input:
Area: ${form.department}
Line: ${form.line}
Machine: ${form.machineType}
Severity: ${form.severity}
Alarm: ${form.alarmText}
Issue: ${form.problemDescription}
Context: ${form.operatingContext}

JSON shape:
{
  "summary": "one sentence",
  "possibleCauses": ["max 3"],
  "operatorSafeChecks": ["max 3"],
  "escalationGuidance": ["max 2"],
  "safetyNotes": ["max 2"]
}`;
}

async function generateGemmaAnalysis(
  apiKey: string,
  model: string,
  prompt: string,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const url = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 450,
          temperature: 0.1,
        },
      }),
    });

    logInfo("gemini_response", {
      model,
      status: response.status,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API returned ${response.status}: ${errorText.slice(0, 120)}`,
      );
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n");

    if (!text) {
      logInfo("parse_result", { success: false, reason: "empty_response" });
      return "";
    }

    logInfo("sanitized_model_preview", {
      preview: sanitizeModelPreview(text).slice(0, 500),
    });

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseAnalysis(text: string, form: NormalizedForm): AnalysisResult {
  const fallback = buildFallbackAnalysis(form);

  if (!text) {
    return fallback;
  }

  const parsed = parseGemmaResponse(text);

  if (!parsed) {
    logInfo("parse_result", { success: false, reason: "invalid_json" });
    return fallback;
  }

  logInfo("parsed_payload", { keys: Object.keys(parsed) });

  const summary =
    normalizeText(parsed.summary) ||
    normalizeText(parsed.detectedAnomaly) ||
    normalizeText(parsed.plainEnglishSummary);
  const possibleCauses = normalizeList(
    firstPresent(parsed.possibleCauses, parsed.possible_causes, parsed.likelyCauses),
    3,
  );
  const operatorSafeChecks = normalizeList(
    firstPresent(
      parsed.operatorSafeChecks,
      parsed.operator_safe_checks,
      parsed.recommendedChecks,
    ),
    3,
  );
  const escalationGuidance = normalizeList(
    firstPresent(
      parsed.escalationGuidance,
      parsed.escalation_guidance,
      parsed.escalationProtocol,
    ),
    2,
  );
  const safetyNotes = normalizeList(
    firstPresent(parsed.safetyNotes, parsed.safety_notes, parsed.safetyReminders),
    2,
  );

  if (
    !summary ||
    possibleCauses.length === 0 ||
    operatorSafeChecks.length === 0 ||
    escalationGuidance.length === 0 ||
    safetyNotes.length === 0
  ) {
    logInfo("parse_result", { success: false, reason: "missing_fields" });
    return fallback;
  }

  logInfo("parse_result", { success: true });

  return {
    priority: form.severity,
    detectedAnomaly: summary,
    plainEnglishSummary:
      "AI-assisted troubleshooting guidance. Not a guaranteed diagnosis; follow site procedures.",
    likelyCauses: possibleCauses.join(" "),
    recommendedChecks: operatorSafeChecks,
    safetyReminders: safetyNotes.join(" "),
    escalationProtocol: escalationGuidance.join(" "),
  };
}

function buildFallbackAnalysis(form: NormalizedForm): AnalysisResult {
  return {
    priority: form.severity,
    detectedAnomaly: "AI guidance returned in an unexpected format.",
    plainEnglishSummary:
      "AI-assisted troubleshooting is available, but the response format could not be fully parsed. This is not a guaranteed diagnosis.",
    likelyCauses:
      "Review the entered symptoms, alarm text, recent operating context, and visible machine state for likely causes.",
    recommendedChecks: [
      "Confirm the displayed alarm or symptom and document when it occurs.",
      "Check visible conditions from a safe position without opening guards or panels.",
      "Stop and escalate if the issue repeats or any safety risk is present.",
    ],
    safetyReminders:
      "Follow site procedures, PPE requirements, and lockout/tagout rules before any hands-on work.",
    escalationProtocol:
      "Escalate to maintenance or the appropriate lead if the condition is high-risk, unclear, or recurring.",
  };
}

function getString(value: unknown, fallback = "") {
  const raw = typeof value === "string" ? value : fallback;
  return raw.trim().slice(0, MAX_FIELD_LENGTH);
}

function normalizePriority(value: string): Priority {
  if (value === "Low" || value === "Medium" || value === "High") {
    return value;
  }

  return "Medium";
}

function normalizeText(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).join(" ").trim();
  }

  return "";
}

function normalizeList(value: unknown, maxItems: number) {
  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).slice(0, maxItems);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function firstPresent(...values: unknown[]) {
  return values.find((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return isNonEmptyString(value);
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseGemmaResponse(text: string): ConciseGemmaResult | null {
  return parseGemmaJson(text) || parseMarkdownGemmaText(text);
}

function parseGemmaJson(text: string): ConciseGemmaResult | null {
  const candidates = [
    text,
    text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1],
    ...extractJsonObjectCandidates(text).reverse(),
  ].filter(isNonEmptyString);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as ConciseGemmaResult;
    } catch {
      // Try the next possible JSON segment.
    }
  }

  return null;
}

function parseMarkdownGemmaText(text: string): ConciseGemmaResult | null {
  const sections = extractMarkdownSections(text);
  const summary = firstSectionItem(sections.summary);
  const possibleCauses = sections.possibleCauses.slice(0, 3);
  const operatorSafeChecks = sections.operatorSafeChecks.slice(0, 3);
  const escalationGuidance = sections.escalationGuidance.slice(0, 2);
  const safetyNotes = sections.safetyNotes.slice(0, 2);

  if (
    !summary &&
    possibleCauses.length === 0 &&
    operatorSafeChecks.length === 0 &&
    escalationGuidance.length === 0 &&
    safetyNotes.length === 0
  ) {
    return null;
  }

  return {
    summary,
    possibleCauses,
    operatorSafeChecks,
    escalationGuidance,
    safetyNotes,
  };
}

function extractMarkdownSections(text: string) {
  const sections: Record<MarkdownSectionKey, string[]> = {
    summary: [],
    possibleCauses: [],
    operatorSafeChecks: [],
    escalationGuidance: [],
    safetyNotes: [],
  };
  let currentSection: MarkdownSectionKey | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const parsedHeading = parseMarkdownHeading(rawLine);

    if (parsedHeading) {
      currentSection = parsedHeading.section;
      addMarkdownContent(sections, currentSection, parsedHeading.remainder);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    addMarkdownContent(sections, currentSection, rawLine);
  }

  return sections;
}

function parseMarkdownHeading(line: string) {
  const normalizedLine = normalizeMarkdownLine(line);

  if (!normalizedLine) {
    return null;
  }

  const colonIndex = normalizedLine.indexOf(":");
  const candidates =
    colonIndex >= 0
      ? [
          {
            heading: normalizedLine.slice(0, colonIndex),
            remainder: normalizedLine.slice(colonIndex + 1),
          },
        ]
      : [{ heading: normalizedLine, remainder: "" }];

  for (const candidate of candidates) {
    const section = sectionForHeading(candidate.heading);

    if (section) {
      return {
        section,
        remainder: candidate.remainder,
      };
    }
  }

  return null;
}

function sectionForHeading(value: string): MarkdownSectionKey | null {
  const heading = normalizeHeading(value);

  if (heading === "summary") {
    return "summary";
  }

  if (heading === "possible causes" || heading === "possible cause") {
    return "possibleCauses";
  }

  if (
    heading === "operator safe checks" ||
    heading === "operator safe check" ||
    heading === "safe checks" ||
    heading === "recommended checks"
  ) {
    return "operatorSafeChecks";
  }

  if (
    heading === "escalation guidance" ||
    heading === "maintenance escalation" ||
    heading === "maintenance escalation guidance" ||
    heading === "when to escalate" ||
    heading === "escalation"
  ) {
    return "escalationGuidance";
  }

  if (
    heading === "safety notes" ||
    heading === "safety note" ||
    heading === "safety reminders" ||
    heading === "safety reminder"
  ) {
    return "safetyNotes";
  }

  return null;
}

function addMarkdownContent(
  sections: Record<MarkdownSectionKey, string[]>,
  section: MarkdownSectionKey,
  rawValue: string,
) {
  const value = cleanMarkdownText(rawValue);

  if (!value || sectionForHeading(value) || isPlaceholderContent(value)) {
    return;
  }

  sections[section].push(
    ...splitMarkdownContent(value).filter((item) => !isPlaceholderContent(item)),
  );
}

function splitMarkdownContent(value: string) {
  const splitItems = value
    .split(/\s+(?=\d+[.)]\s+)/)
    .map((item) => cleanMarkdownText(item.replace(/^\d+[.)]\s*/, "")))
    .filter(isNonEmptyString);

  return splitItems.length > 1 ? splitItems : [value];
}

function firstSectionItem(items: string[]) {
  return items.find((item) => isNonEmptyString(item) && !isPlaceholderContent(item)) || "";
}

function normalizeMarkdownLine(line: string) {
  return line
    .replace(/^\s*(?:#{1,6}\s*)/, "")
    .replace(/^\s*(?:[*+-]|\d+[.)])\s+/, "")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeading(value: string) {
  return value
    .replace(/[`*_]/g, "")
    .replace(/[/:()[\]{}]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanMarkdownText(value: string) {
  return normalizeMarkdownLine(value)
    .replace(/^["']|["']$/g, "")
    .replace(/^["']|["'],?$/g, "")
    .trim();
}

function isPlaceholderContent(value: string) {
  const normalized = value
    .replace(/["'[\],]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return (
    normalized === "one sentence" ||
    normalized === "max 2" ||
    normalized === "max 3" ||
    normalized === "json shape" ||
    normalized.startsWith("json shape ")
  );
}

function extractJsonObjectCandidates(text: string) {
  const candidates: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (character === "\"") {
        inString = false;
      }

      continue;
    }

    if (character === "\"") {
      inString = true;
      continue;
    }

    if (character === "{") {
      if (depth === 0) {
        start = index;
      }

      depth += 1;
      continue;
    }

    if (character === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        candidates.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return candidates;
}

function logInfo(event: string, details: Record<string, unknown>) {
  console.info(`[ops-assist/analyze] ${event}`, details);
}

function logError(event: string, error: unknown) {
  const message =
    error instanceof Error ? sanitizeLogMessage(error.message) : "Unknown error";
  console.error(`[ops-assist/analyze] ${event}`, { message });
}

function sanitizeLogMessage(message: string) {
  return message.replace(/[?&]key=[^&\s]+/gi, "?key=[redacted]").slice(0, 240);
}

function sanitizeModelPreview(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line.replace(
        /^(\s*(?:[*+-]|\d+[.)])?\s*(?:Area|Line|Machine|Alarm|Issue|Context):\s*).+$/i,
        "$1[redacted]",
      ),
    )
    .join("\n")
    .replace(/[?&]key=[^&\s]+/gi, "?key=[redacted]");
}

/*
Manual parser sample for this project:
- Paste a Gemma markdown response with headings such as ## Possible Causes,
  **Operator-Safe Checks**, Safety notes:, or When to Escalate.
- parseMarkdownGemmaText should return summary, possibleCauses,
  operatorSafeChecks, escalationGuidance, and safetyNotes before fallback is used.
*/
