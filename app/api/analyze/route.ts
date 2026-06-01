const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_TIMEOUT_MS = 90000;

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

type AnalysisResult = {
  priority: Priority;
  detectedAnomaly: string;
  plainEnglishSummary: string;
  likelyCauses: string;
  recommendedChecks: string[];
  safetyReminders: string;
  escalationProtocol: string;
};

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

  if (!apiKey) {
    return Response.json(
      { error: "Gemini API key is not configured." },
      { status: 500 },
    );
  }

  let body: AnalyzeRequest;

  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const problemDescription = getString(body.problemDescription).trim();

  if (!problemDescription) {
    return Response.json(
      { error: "Problem Description is required." },
      { status: 400 },
    );
  }

  const form = {
    department: getString(body.department) || "Unspecified department",
    line: getString(body.line) || "Unspecified line",
    machineType: getString(body.machineType) || "Unspecified machine",
    alarmText: getString(body.alarmText) || "No alarm/error text provided",
    problemDescription,
    operatingContext:
      getString(body.operatingContext) || "No additional symptoms or context provided",
    severity: normalizePriority(getString(body.severity)),
  };

  try {
    const model = process.env.GEMMA_MODEL || DEFAULT_GEMMA_MODEL;
    const text = await generateGemmaAnalysis(apiKey, model, buildPrompt(form));
    const analysis = parseAnalysis(text);

    return Response.json({ analysis });
  } catch {
    return Response.json(
      {
        error:
          "AI-assisted guidance is unavailable right now. Follow site procedures and escalate high-risk or unclear issues through the normal maintenance channel.",
      },
      { status: 502 },
    );
  }
}

function buildPrompt(form: {
  department: string;
  line: string;
  machineType: string;
  alarmText: string;
  problemDescription: string;
  operatingContext: string;
  severity: Priority;
}) {
  return `
You are Ops Assist, an AI-assisted troubleshooting helper for a manufacturing demo prototype.

Return a single JSON object only. The first character must be { and the last character must be }.
Do not include Markdown, commentary, code fences, bullets, planning, self-correction, or text outside the JSON object.

Safety and reliability rules:
- Treat every input as fake/demo data only.
- Clearly state that this is AI-assisted troubleshooting.
- Do not present the output as a guaranteed diagnosis.
- Always remind users to follow site procedures and local safety rules.
- Include lockout/tagout guidance when there are moving parts, electrical, pneumatic, hydraulic, heat, or pressure hazards.
- Recommend maintenance escalation for high-risk issues.
- Keep recommendations practical for a factory-floor operator.
- Recommendations must be operator-safe checks only: observation, documentation, verifying displayed alarms, checking visible conditions from a safe state, and escalation.
- Do not tell operators to perform maintenance-level repairs, bypass guards, adjust controls, reset safety systems, open panels, defeat interlocks, or troubleshoot energized equipment.

Operator input:
- Department: ${form.department}
- Line: ${form.line}
- Machine Type: ${form.machineType}
- Severity: ${form.severity}
- Alarm/Error Text: ${form.alarmText}
- Problem Description: ${form.problemDescription}
- Symptoms/Context: ${form.operatingContext}

JSON shape:
{
  "priority": "Low" | "Medium" | "High",
  "detectedAnomaly": "short plain-English anomaly",
  "plainEnglishSummary": "short summary that says this is AI-assisted troubleshooting and not a guaranteed diagnosis",
  "likelyCauses": "concise realistic possible causes, not a confirmed diagnosis",
  "recommendedChecks": ["operator-safe check 1", "operator-safe check 2", "operator-safe check 3"],
  "safetyReminders": "safety notes covering site procedures, PPE, and lockout/tagout guidance when hazards apply",
  "escalationProtocol": "escalation guidance for maintenance or leadership, especially for high-risk issues"
}
`;
}

async function generateGemmaAnalysis(apiKey: string, model: string, prompt: string) {
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
          maxOutputTokens: 900,
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API returned ${response.status}: ${errorText.slice(0, 240)}`,
      );
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n");

    if (!text) {
      throw new Error("Gemma returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizePriority(value: string): Priority {
  if (value === "Low" || value === "Medium" || value === "High") {
    return value;
  }

  return "Medium";
}

function parseAnalysis(text: string | undefined): AnalysisResult {
  if (!text) {
    throw new Error("Gemma returned an empty response.");
  }

  const parsed = parseGemmaJson(text);
  const priority = normalizePriority(parsed.priority ?? "");
  const detectedAnomaly = normalizeText(parsed.detectedAnomaly);
  const plainEnglishSummary = normalizeText(parsed.plainEnglishSummary);
  const likelyCauses = normalizeText(parsed.likelyCauses);
  const safetyReminders = normalizeText(parsed.safetyReminders);
  const escalationProtocol = normalizeText(parsed.escalationProtocol);
  const recommendedChecks = Array.isArray(parsed.recommendedChecks)
    ? parsed.recommendedChecks.filter((item): item is string => typeof item === "string")
    : [];

  if (
    !detectedAnomaly ||
    !plainEnglishSummary ||
    !likelyCauses ||
    !safetyReminders ||
    !escalationProtocol ||
    recommendedChecks.length === 0
  ) {
    throw new Error("Gemma response did not match the expected analysis shape.");
  }

  return {
    priority,
    detectedAnomaly,
    plainEnglishSummary,
    likelyCauses,
    recommendedChecks,
    safetyReminders,
    escalationProtocol,
  };
}

function normalizeText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(", ");
  }

  return "";
}

function parseGemmaJson(text: string): Partial<AnalysisResult> {
  try {
    return JSON.parse(text) as Partial<AnalysisResult>;
  } catch {
    const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];

    if (fencedJson) {
      return JSON.parse(fencedJson) as Partial<AnalysisResult>;
    }

    const candidates = extractJsonObjectCandidates(text);

    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      try {
        return JSON.parse(candidates[index]) as Partial<AnalysisResult>;
      } catch {
        // Keep looking for the final JSON object in verbose model output.
      }
    }

    throw new Error("Gemma response was not parseable JSON.");
  }
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
