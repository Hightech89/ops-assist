"use client";

import { useState, type FormEvent } from "react";

type Severity = "Low" | "Medium" | "High";

type DiagnosticForm = {
  department: string;
  line: string;
  machineType: string;
  alarmText: string;
  problemDescription: string;
  severity: Severity;
};

const initialForm: DiagnosticForm = {
  department: "Machining",
  line: "Line 1 (CNC)",
  machineType: "Hydraulic Press",
  alarmText: "",
  problemDescription: "",
  severity: "High",
};

const navItems = ["Dashboard", "History", "Maintenance", "Support"];
const topNavItems = ["Dashboard", "History", "Maintenance Logs"];

const severityContent: Record<
  Severity,
  {
    anomaly: string;
    badge: string;
    badgeClass: string;
    escalation: string;
  }
> = {
  Low: {
    anomaly: "Minor operating drift detected. Continue monitoring and document repeat symptoms.",
    badge: "Low Priority",
    badgeClass: "border-emerald-700 bg-emerald-50 text-emerald-800",
    escalation: "Log the condition and escalate if the same anomaly repeats during the shift.",
  },
  Medium: {
    anomaly: "Warning condition detected. Output, timing, or sensor behavior may be trending outside normal limits.",
    badge: "Medium Priority",
    badgeClass: "border-[#983c00] bg-[#ffdbcc] text-[#722b00]",
    escalation: "Notify the area technician if checks do not clear the condition within one restart cycle.",
  },
  High: {
    anomaly: "Detected hydraulic pressure fluctuation on Line 4 Main Pump.",
    badge: "High Priority",
    badgeClass: "border-[#ba1a1a] bg-[#ffdad6] text-[#93000a]",
    escalation: "If pressure remains below 40 PSI after checks, contact Maintenance Lead immediately.",
  },
};

const fieldClass =
  "min-h-12 w-full rounded border border-[#c2c6d4] bg-[#e6e8ea] px-4 py-3 text-base text-[#191c1e] outline-none transition placeholder:text-[#667085] focus:border-2 focus:border-[#0056b3]";

export default function Home() {
  const [form, setForm] = useState<DiagnosticForm>(initialForm);
  const [submittedForm, setSubmittedForm] =
    useState<DiagnosticForm>(initialForm);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  function updateField<FieldName extends keyof DiagnosticForm>(
    field: FieldName,
    value: DiagnosticForm[FieldName],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedForm(form);
    setHasAnalyzed(true);
  }

  const result = severityContent[submittedForm.severity];

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#191c1e]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex border-b border-[#c2c6d4] bg-[#eceef0] lg:min-h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex flex-1 flex-col">
            <div className="border-b border-[#c2c6d4] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded border border-[#c2c6d4] bg-white">
                  <div className="h-5 w-5 rounded-full border-4 border-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-8 text-[#003f87]">
                    Ops Assist
                  </p>
                  <p className="mt-1 text-sm text-[#191c1e]">
                    HMI Console v1.0
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:gap-3 lg:px-2 lg:py-7">
              {navItems.map((item) => (
                <a
                  href="#"
                  key={item}
                  className={`flex min-h-12 items-center gap-4 rounded px-4 text-sm font-semibold tracking-[0.05em] transition ${
                    item === "Dashboard"
                      ? "border-l-4 border-[#0056b3] bg-[#d8dadc] text-[#191c1e]"
                      : "text-[#191c1e] hover:bg-[#e0e3e5]"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded border border-[#727784] text-xs text-[#424752]">
                    {item.slice(0, 1)}
                  </span>
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-3 lg:p-4">
            <button className="flex min-h-12 w-full items-center justify-center gap-3 rounded bg-[#0056b3] px-4 text-base font-semibold text-white shadow-[0_4px_12px_rgba(0,86,179,0.18)]">
              <span className="text-2xl leading-none">+</span>
              New Log
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[72px] flex-col gap-4 border-b border-[#c2c6d4] bg-[#f8f9fb] px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <nav className="flex gap-6 overflow-x-auto">
              {topNavItems.map((item) => (
                <a
                  href="#"
                  key={item}
                  className={`whitespace-nowrap pb-2 text-sm font-semibold tracking-[0.05em] ${
                    item === "Dashboard"
                      ? "border-b-2 border-[#003f87] text-[#003f87]"
                      : "text-[#191c1e] hover:text-[#003f87]"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#c2c6d4] bg-[#f2f4f6] px-4 text-sm font-semibold text-[#424752]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0056b3]" />
                AI System Online
              </span>
              <span className="hidden h-8 w-px bg-[#c2c6d4] md:block" />
              <button className="hidden h-10 w-10 place-items-center rounded-full border border-[#c2c6d4] bg-[#f2f4f6] text-lg font-bold text-[#424752] md:grid">
                ?
              </button>
              <button className="hidden h-10 w-10 place-items-center rounded-full border border-[#c2c6d4] bg-[#f2f4f6] text-lg font-bold text-[#424752] md:grid">
                S
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-8 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
              <section className="space-y-3">
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#191c1e] md:text-[32px] md:leading-10">
                  AI-Powered Manufacturing Troubleshooting
                </h1>
                <p className="max-w-3xl text-lg leading-7 text-[#424752]">
                  Describe machine issues to receive real-time AI-assisted
                  guidance and safety protocols.
                </p>
              </section>

              <div className="grid gap-6 lg:grid-cols-12">
                <form
                  onSubmit={handleSubmit}
                  className="overflow-hidden rounded-lg border border-[#c2c6d4] bg-white lg:col-span-7"
                >
                  <div className="flex items-center gap-3 border-b border-[#c2c6d4] bg-[#eceef0] px-6 py-5">
                    <span className="grid h-6 w-6 place-items-center rounded border-2 border-[#003f87] text-xs font-bold text-[#003f87]">
                      AI
                    </span>
                    <h2 className="text-2xl font-semibold leading-8 text-[#191c1e]">
                      Diagnostic Input Form
                    </h2>
                  </div>

                  <div className="flex flex-col gap-6 p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Department" htmlFor="department">
                        <select
                          id="department"
                          value={form.department}
                          onChange={(event) =>
                            updateField("department", event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option>Machining</option>
                          <option>Assembly</option>
                          <option>Packaging</option>
                        </select>
                      </Field>

                      <Field label="Production Line" htmlFor="line">
                        <select
                          id="line"
                          value={form.line}
                          onChange={(event) =>
                            updateField("line", event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option>Line 1 (CNC)</option>
                          <option>Line 2 (Milling)</option>
                          <option>Line 4 (Main Pump)</option>
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
                        </select>
                      </Field>

                      <Field label="Severity Level" htmlFor="severity">
                        <select
                          id="severity"
                          value={form.severity}
                          onChange={(event) =>
                            updateField(
                              "severity",
                              event.target.value as Severity,
                            )
                          }
                          className={fieldClass}
                        >
                          <option value="Low">Low (Observation)</option>
                          <option value="Medium">Medium (Warning)</option>
                          <option value="High">High (Critical)</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Alarm / Error Code" htmlFor="alarmText">
                      <input
                        id="alarmText"
                        value={form.alarmText}
                        onChange={(event) =>
                          updateField("alarmText", event.target.value)
                        }
                        className={fieldClass}
                        placeholder="e.g., ERR-402 Pressure Drop"
                      />
                    </Field>

                    <Field
                      label="Problem Description"
                      htmlFor="problemDescription"
                    >
                      <textarea
                        id="problemDescription"
                        value={form.problemDescription}
                        onChange={(event) =>
                          updateField("problemDescription", event.target.value)
                        }
                        className={`${fieldClass} min-h-40 resize-y`}
                        placeholder="Describe the physical symptoms, sounds, or operational anomalies observed..."
                        required
                      />
                    </Field>

                    <div className="flex border-t border-[#c2c6d4] pt-5 md:justify-end">
                      <button
                        type="submit"
                        className="flex min-h-12 w-full items-center justify-center gap-3 rounded bg-[#0056b3] px-8 py-3 text-sm font-bold tracking-[0.05em] text-white shadow-[0_8px_18px_rgba(0,86,179,0.18)] transition hover:bg-[#003f87] md:w-auto"
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-sm border border-white/80 text-[10px]">
                          AI
                        </span>
                        Analyze Issue
                      </button>
                    </div>
                  </div>
                </form>

                <aside className="overflow-hidden rounded-lg border border-[#003f87] bg-[#e0e3e5] shadow-[0_0_20px_rgba(0,86,179,0.05)] lg:col-span-5">
                  <div className="h-1 bg-gradient-to-r from-transparent via-[#0056b3] to-transparent" />
                  <div className="flex flex-col gap-4 border-b border-[#c2c6d4] bg-[#eceef0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded border-2 border-[#003f87] text-xs font-bold text-[#003f87]">
                        AI
                      </span>
                      <h2 className="text-2xl font-semibold leading-8 text-[#191c1e]">
                        AI Analysis Result
                      </h2>
                    </div>
                    <span
                      className={`inline-flex min-h-10 items-center rounded border px-3 text-sm font-bold ${result.badgeClass}`}
                    >
                      {result.badge}
                    </span>
                  </div>

                  <div className="flex flex-col gap-6 p-6">
                    <section className="rounded border border-[#c2c6d4] border-l-4 border-l-[#003f87] bg-[#f8f9fb] p-4">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#424752]">
                        Detected Anomaly
                      </h3>
                      <p className="text-base font-semibold leading-6 text-[#191c1e]">
                        {hasAnalyzed
                          ? result.anomaly
                          : "Detected hydraulic pressure fluctuation on Line 4 Main Pump."}
                      </p>
                    </section>

                    <AnalysisSection title="Likely Causes" tone="primary">
                      <p>
                        Seal degradation, fluid level low, or sensor calibration
                        drift. For{" "}
                        <strong>{submittedForm.machineType}</strong>, also
                        confirm recent setup changes and operator reset
                        sequence.
                      </p>
                    </AnalysisSection>

                    <AnalysisSection title="Recommended Checks" tone="tertiary">
                      <ol className="space-y-3">
                        <li>1. Inspect pump seals for visible leaks.</li>
                        <li>
                          2. Verify reservoir levels against specifications.
                        </li>
                        <li>3. Check sensor voltage output.</li>
                      </ol>
                    </AnalysisSection>

                    <section className="rounded border border-[#ba1a1a] bg-[#ffdad6]/45 p-4">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#ba1a1a]">
                        Critical Safety Reminders
                      </h3>
                      <p className="text-base leading-7 text-[#93000a]">
                        Ensure <strong>LOTO (Lockout/Tagout)</strong>{" "}
                        procedures are strictly followed. High-pressure hazard
                        present.
                      </p>
                    </section>

                    <section className="border-t border-[#c2c6d4] pt-5">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#424752]">
                        Escalation Protocol
                      </h3>
                      <div className="rounded border border-[#c2c6d4] bg-[#f8f9fb] p-4">
                        <p className="text-sm leading-6 text-[#191c1e]">
                          {result.escalation}
                        </p>
                      </div>
                    </section>
                  </div>
                </aside>
              </div>
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
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-xs font-semibold uppercase tracking-[0.14em] text-[#191c1e]"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function AnalysisSection({
  children,
  title,
  tone,
}: {
  children: React.ReactNode;
  title: string;
  tone: "primary" | "tertiary";
}) {
  const titleClass = tone === "primary" ? "text-[#003f87]" : "text-[#722b00]";

  return (
    <section>
      <h3
        className={`mb-3 text-xs font-semibold uppercase tracking-[0.14em] ${titleClass}`}
      >
        {title}
      </h3>
      <div className="rounded border border-[#c2c6d4] bg-[#eceef0] p-4 text-base leading-7 text-[#191c1e]">
        {children}
      </div>
    </section>
  );
}
