"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type Severity = "Low" | "Medium" | "High";

type DiagnosticForm = {
  department: string;
  line: string;
  machineType: string;
  alarmText: string;
  problemDescription: string;
  operatingContext: string;
  severity: Severity;
};

type AnalysisResult = {
  priority: Severity;
  detectedAnomaly: string;
  plainEnglishSummary: string;
  likelyCauses: string;
  recommendedChecks: string[];
  safetyReminders: string;
  escalationProtocol: string;
};

const initialForm: DiagnosticForm = {
  department: "Fabrication",
  line: "Line A",
  machineType: "Hydraulic Press",
  alarmText: "",
  problemDescription: "",
  operatingContext: "",
  severity: "Medium",
};

const severityContent: Record<
  Severity,
  {
    badge: string;
    badgeClass: string;
  }
> = {
  Low: {
    badge: "Low Priority",
    badgeClass: "border-emerald-700 bg-emerald-50 text-emerald-800",
  },
  Medium: {
    badge: "Medium Priority",
    badgeClass: "border-[#9a4a00] bg-[#fff1d7] text-[#6f3300]",
  },
  High: {
    badge: "High Priority",
    badgeClass: "border-[#ba1a1a] bg-[#ffdad6] text-[#93000a]",
  },
};

const fieldClass =
  "min-h-12 w-full rounded-md border border-[#b8bfcc] bg-white px-4 py-3 text-base text-[#15181d] outline-none transition placeholder:text-[#6b7280] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20";

const navItems = ["Dashboard", "History", "Maintenance", "Support"];

export default function Home() {
  const [form, setForm] = useState<DiagnosticForm>(initialForm);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  function updateField<FieldName extends keyof DiagnosticForm>(
    field: FieldName,
    value: DiagnosticForm[FieldName],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problemDescription = form.problemDescription.trim();
    const operatingContext = form.operatingContext.trim();

    if (!problemDescription) {
      setValidationMessage("Describe the issue before running analysis.");
      return;
    }

    setValidationMessage("");
    setAnalysisError("");
    setIsAnalyzing(true);

    const nextForm = { ...form, problemDescription, operatingContext };

    try {
      const [response] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextForm),
        }),
        new Promise((resolve) => {
          window.setTimeout(resolve, 650);
        }),
      ]);

      const payload = (await response.json()) as {
        analysis?: AnalysisResult;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || "Unable to generate analysis.");
      }

      setForm(nextForm);
      setAnalysis(payload.analysis);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "AI-assisted troubleshooting is unavailable right now.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setAnalysis(null);
    setIsAnalyzing(false);
    setValidationMessage("");
    setAnalysisError("");
  }

  const priority = analysis?.priority ?? form.severity;
  const result = severityContent[priority];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fa] text-[#15181d]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col xl:flex-row">
        <aside className="flex w-full flex-col border-b border-[#d7dce5] bg-[#edf1f5] xl:min-h-screen xl:w-72 xl:shrink-0 xl:border-b-0 xl:border-r">
          <div className="border-b border-[#d7dce5] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md border border-[#c3cad6] bg-white">
                <div className="h-5 w-5 rounded-full border-4 border-[#f0a21a]" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-8 text-[#003f87]">
                  Ops Assist
                </p>
                <p className="text-sm font-medium text-[#4b5563]">
                  Troubleshooting Console V0.1
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto p-3 xl:flex-col xl:gap-3 xl:p-4">
            {navItems.map((item) => (
              <button
                type="button"
                key={item}
                className={`flex min-h-11 items-center gap-3 rounded-md px-4 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#0056b3] ${
                  item === "Dashboard"
                    ? "bg-white text-[#003f87] shadow-sm ring-1 ring-[#d7dce5]"
                    : "text-[#374151] hover:bg-white/70"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-[#aab3c2] text-xs">
                  {item.slice(0, 1)}
                </span>
                <span className="whitespace-nowrap">{item}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto grid gap-3 p-3 xl:p-4">
            <div className="rounded-md border border-[#d7dce5] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                Safety framing
              </p>
              <p className="mt-2 text-sm leading-6 text-[#374151]">
                Prototype environment. Do not enter confidential or
                proprietary information. AI output supports observation,
                documentation, and escalation.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[76px] flex-col gap-4 border-b border-[#d7dce5] bg-white px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7280]">
                Tablet-first prototype
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-8 text-[#15181d] md:text-[32px] md:leading-10">
                Manufacturing Troubleshooting Assist
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#c3cad6] bg-[#f8fafc] px-4 text-sm font-semibold text-[#374151]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#16803c]" />
                Server-side AI route
              </span>
              <span className="inline-flex min-h-9 items-center rounded-full border border-[#c3cad6] bg-[#f8fafc] px-4 text-sm font-semibold text-[#374151]">
                Prototype environment
              </span>
            </div>
          </header>

          <div className="min-w-0 flex-1 px-4 py-5 sm:px-5 lg:px-8 lg:py-8">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
              <form
                onSubmit={handleSubmit}
                className="min-w-0 overflow-hidden rounded-lg border border-[#d7dce5] bg-white shadow-sm"
              >
                <PanelHeader
                  eyebrow="Operator input"
                  title="Describe the issue"
                  helper="Use only non-confidential information."
                />

                <div className="grid gap-5 p-5 lg:p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Department / Area" htmlFor="department">
                      <select
                        id="department"
                        value={form.department}
                        onChange={(event) =>
                          updateField("department", event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option>Fabrication</option>
                        <option>Assembly</option>
                        <option>Packaging</option>
                        <option>Warehouse</option>
                      </select>
                    </Field>

                    <Field label="Line / Cell" htmlFor="line">
                      <select
                        id="line"
                        value={form.line}
                        onChange={(event) =>
                          updateField("line", event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option>Line A</option>
                        <option>Line B</option>
                        <option>Cell 3</option>
                        <option>Training Station</option>
                      </select>
                    </Field>

                    <Field label="Machine Type" htmlFor="machineType">
                      <select
                        id="machineType"
                        value={form.machineType}
                        onChange={(event) =>
                          updateField("machineType", event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option>Hydraulic Press</option>
                        <option>Conveyor System</option>
                        <option>Robotic Arm</option>
                        <option>Packaging Machine</option>
                      </select>
                    </Field>

                    <Field label="Severity" htmlFor="severity">
                      <select
                        id="severity"
                        value={form.severity}
                        onChange={(event) =>
                          updateField("severity", event.target.value as Severity)
                        }
                        className={fieldClass}
                      >
                        <option value="Low">Low - Observation</option>
                        <option value="Medium">Medium - Warning</option>
                        <option value="High">High - Stop and escalate</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Alarm / Error Text" htmlFor="alarmText">
                    <input
                      id="alarmText"
                      value={form.alarmText}
                      onChange={(event) =>
                        updateField("alarmText", event.target.value)
                      }
                      className={fieldClass}
                      placeholder="Example: motor overload, sensor fault, pressure warning"
                    />
                  </Field>

                  <Field label="Issue Description" htmlFor="problemDescription">
                    <textarea
                      id="problemDescription"
                      value={form.problemDescription}
                      onChange={(event) =>
                        updateField("problemDescription", event.target.value)
                      }
                      className={`${fieldClass} min-h-36 resize-y`}
                      placeholder="Describe observable symptoms: noise, alarms, movement, repeated stops, leaks, jams, quality defects..."
                      aria-describedby="problem-validation"
                    />
                    {validationMessage ? (
                      <p
                        id="problem-validation"
                        className="text-sm font-semibold text-[#ba1a1a]"
                      >
                        {validationMessage}
                      </p>
                    ) : null}
                  </Field>

                  <Field label="Symptoms / Context" htmlFor="operatingContext">
                    <textarea
                      id="operatingContext"
                      value={form.operatingContext}
                      onChange={(event) =>
                        updateField("operatingContext", event.target.value)
                      }
                      className={`${fieldClass} min-h-28 resize-y`}
                      placeholder="Add context: when it happens, recent resets, product flow, visible conditions, or what has already been checked safely."
                    />
                  </Field>

                  <div className="flex flex-col gap-3 border-t border-[#e2e7ef] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-12 rounded-md border border-[#c3cad6] bg-white px-5 text-sm font-bold text-[#374151] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#0056b3]"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="min-h-12 rounded-md bg-[#0056b3] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#003f87] focus:outline-none focus:ring-2 focus:ring-[#0056b3] disabled:cursor-not-allowed disabled:bg-[#697386]"
                    >
                      {isAnalyzing ? "Analyzing issue..." : "Analyze Issue"}
                    </button>
                  </div>
                </div>
              </form>

              <aside className="min-w-0 overflow-hidden rounded-lg border border-[#d7dce5] bg-white shadow-sm">
                <PanelHeader
                  eyebrow="AI-assisted output"
                  title="Troubleshooting guidance"
                  helper="Review against site procedures before acting."
                  badge={
                    analysis || analysisError || isAnalyzing ? (
                      <span
                        className={`inline-flex min-h-9 items-center rounded-md border px-3 text-sm font-bold ${result.badgeClass}`}
                      >
                        {isAnalyzing ? "Analyzing" : result.badge}
                      </span>
                    ) : (
                      <span className="inline-flex min-h-9 items-center rounded-md border border-[#c3cad6] bg-white px-3 text-sm font-bold text-[#4b5563]">
                        Ready
                      </span>
                    )
                  }
                />

                <div className="grid gap-5 p-5 lg:p-6">
                  {analysisError ? (
                    <section className="rounded-md border border-[#ba1a1a] bg-[#fff4f2] p-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#ba1a1a]">
                        Analysis unavailable
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#681212]">
                        {analysisError}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#681212]">
                        Continue with official procedures and escalate any
                        safety-critical issue through the normal channel.
                      </p>
                    </section>
                  ) : null}

                  {isAnalyzing ? (
                    <ReadyState
                      title="Reviewing issue details"
                      body="The response will show possible causes, operator-safe checks, escalation guidance, and safety notes."
                      tone="loading"
                    />
                  ) : analysis ? (
                    <>
                      <section className="rounded-md border border-[#d7dce5] bg-[#f8fafc] p-4" aria-live="polite">
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#4b5563]">
                          Summary
                        </h3>
                        <p className="mt-3 text-base font-semibold leading-6 text-[#15181d]">
                          {analysis.detectedAnomaly}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#4b5563]">
                          {analysis.plainEnglishSummary}
                        </p>
                      </section>

                      <AnalysisSection title="Possible Causes" tone="primary">
                        <p>{analysis.likelyCauses}</p>
                      </AnalysisSection>

                      <AnalysisSection title="Operator-Safe Checks" tone="secondary">
                        <ol className="space-y-3">
                          {analysis.recommendedChecks.map((check, index) => (
                            <li className="flex gap-3" key={`${check}-${index}`}>
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e9f2ff] text-xs font-bold text-[#003f87]">
                                {index + 1}
                              </span>
                              <span>{check}</span>
                            </li>
                          ))}
                        </ol>
                      </AnalysisSection>

                      <section className="rounded-md border border-[#ba1a1a] bg-[#fff4f2] p-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#ba1a1a]">
                          Safety Notes
                        </h3>
                        <p className="mt-3 text-base leading-7 text-[#681212]">
                          {analysis.safetyReminders}
                        </p>
                      </section>

                      <AnalysisSection title="Escalation Guidance" tone="neutral">
                        <p>{analysis.escalationProtocol}</p>
                      </AnalysisSection>
                    </>
                  ) : analysisError ? null : (
                    <ReadyState
                      title="Ready for next issue."
                      body="Enter issue details and run analysis to see AI guidance. No previous analysis is currently shown."
                      tone="ready"
                    />
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-bold uppercase tracking-[0.14em] text-[#374151]"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function PanelHeader({
  badge,
  eyebrow,
  helper,
  title,
}: {
  badge?: ReactNode;
  eyebrow: string;
  helper: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#d7dce5] bg-[#f8fafc] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7280]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-bold leading-7 text-[#15181d]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#4b5563]">{helper}</p>
      </div>
      {badge}
    </div>
  );
}

function ReadyState({
  body,
  title,
  tone,
}: {
  body: string;
  title: string;
  tone: "loading" | "ready";
}) {
  const toneClass =
    tone === "loading"
      ? "border-[#0056b3] bg-[#eef6ff]"
      : "border-[#d7dce5] bg-[#f8fafc]";

  return (
    <section className={`rounded-md border p-5 ${toneClass}`} aria-live="polite">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#4b5563]">
        Summary
      </h3>
      <p className="mt-3 text-base font-semibold leading-6 text-[#15181d]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#4b5563]">{body}</p>
    </section>
  );
}

function AnalysisSection({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: "primary" | "secondary" | "neutral";
}) {
  const titleClass =
    tone === "primary"
      ? "text-[#003f87]"
      : tone === "secondary"
        ? "text-[#7a4a00]"
        : "text-[#374151]";

  return (
    <section>
      <h3
        className={`mb-3 text-xs font-bold uppercase tracking-[0.14em] ${titleClass}`}
      >
        {title}
      </h3>
      <div className="rounded-md border border-[#d7dce5] bg-[#f8fafc] p-4 text-base leading-7 text-[#15181d]">
        {children}
      </div>
    </section>
  );
}
