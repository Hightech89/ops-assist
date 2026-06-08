import test from "node:test";
import assert from "node:assert/strict";

import { buildShiftSummary, sampleDowntimeLogs } from "./shift-summary.ts";

test("builds a pass-down summary from matching sample downtime logs", () => {
  const summary = buildShiftSummary({
    department: "Packaging",
    line: "Line A",
    machine: "Flow Wrapper",
    startDateTime: "2026-06-07T06:00",
    endDateTime: "2026-06-07T14:00",
  });

  assert.equal(summary.logs.length, 4);
  assert.equal(summary.totalStops, 4);
  assert.equal(summary.estimatedDowntimeMinutes, 41);
  assert.equal(summary.mostCommonStopReason, "Infeed backup");
  assert.equal(summary.longestDowntimeEvent, "18 minutes");
  assert.match(summary.repeatedPattern, /Infeed backup/);
});

test("returns no logs when the selected range has no matching sample data", () => {
  const summary = buildShiftSummary({
    department: "Processing",
    line: "Line B",
    machine: "Hydraulic Press",
    startDateTime: "2026-06-08T06:00",
    endDateTime: "2026-06-08T14:00",
  });

  assert.equal(summary.logs.length, 0);
  assert.equal(summary.totalStops, 0);
  assert.equal(summary.estimatedDowntimeMinutes, 0);
  assert.equal(summary.mostCommonStopReason, "No sample stops in range");
  assert.equal(summary.longestDowntimeEvent, "No downtime event");
});

test("sample logs contain fake generic data only", () => {
  assert.ok(sampleDowntimeLogs.length > 0);
  assert.ok(sampleDowntimeLogs.every((log) => !log.stopReason.includes("MQIS")));
  assert.ok(sampleDowntimeLogs.every((log) => !log.machine.includes("Company")));
});
