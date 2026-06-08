export type ShiftSummarySelection = {
  department: string;
  line: string;
  machine: string;
  startDateTime: string;
  endDateTime: string;
};

export type DowntimeLog = {
  id: string;
  department: string;
  line: string;
  machine: string;
  timestamp: string;
  stopReason: string;
  durationMinutes: number;
};

export type ShiftPassDownSummary = {
  totalStops: number;
  estimatedDowntimeMinutes: number;
  mostCommonStopReason: string;
  longestDowntimeEvent: string;
  repeatedPattern: string;
  operatorAwarenessNote: string;
  suggestedFollowUp: string;
  logs: DowntimeLog[];
};

export const shiftDepartments = ["Fabrication", "Packaging", "Processing"];
export const shiftLines = ["Line A", "Line B"];
export const shiftMachines = [
  "Flow Wrapper",
  "Case Packer",
  "Conveyor Transfer",
  "Hydraulic Press",
];

export const sampleDowntimeLogs: DowntimeLog[] = [
  {
    id: "log-001",
    department: "Packaging",
    line: "Line A",
    machine: "Flow Wrapper",
    timestamp: "2026-06-07T06:18",
    stopReason: "Infeed backup",
    durationMinutes: 7,
  },
  {
    id: "log-002",
    department: "Packaging",
    line: "Line A",
    machine: "Flow Wrapper",
    timestamp: "2026-06-07T07:46",
    stopReason: "Short restart stop",
    durationMinutes: 9,
  },
  {
    id: "log-003",
    department: "Packaging",
    line: "Line A",
    machine: "Flow Wrapper",
    timestamp: "2026-06-07T09:12",
    stopReason: "Infeed backup",
    durationMinutes: 18,
  },
  {
    id: "log-004",
    department: "Packaging",
    line: "Line A",
    machine: "Flow Wrapper",
    timestamp: "2026-06-07T12:34",
    stopReason: "Infeed backup",
    durationMinutes: 7,
  },
  {
    id: "log-005",
    department: "Packaging",
    line: "Line B",
    machine: "Case Packer",
    timestamp: "2026-06-07T08:05",
    stopReason: "Case feed delay",
    durationMinutes: 11,
  },
  {
    id: "log-006",
    department: "Packaging",
    line: "Line B",
    machine: "Case Packer",
    timestamp: "2026-06-07T10:22",
    stopReason: "Discharge jam",
    durationMinutes: 15,
  },
  {
    id: "log-007",
    department: "Fabrication",
    line: "Line A",
    machine: "Hydraulic Press",
    timestamp: "2026-06-07T06:52",
    stopReason: "Pressure warning",
    durationMinutes: 10,
  },
  {
    id: "log-008",
    department: "Fabrication",
    line: "Line A",
    machine: "Hydraulic Press",
    timestamp: "2026-06-07T11:40",
    stopReason: "Pressure warning",
    durationMinutes: 13,
  },
  {
    id: "log-009",
    department: "Processing",
    line: "Line B",
    machine: "Conveyor Transfer",
    timestamp: "2026-06-07T07:15",
    stopReason: "Transfer sensor blocked",
    durationMinutes: 8,
  },
  {
    id: "log-010",
    department: "Processing",
    line: "Line B",
    machine: "Conveyor Transfer",
    timestamp: "2026-06-07T13:02",
    stopReason: "Transfer sensor blocked",
    durationMinutes: 12,
  },
];

export function buildShiftSummary(
  selection: ShiftSummarySelection,
): ShiftPassDownSummary {
  const startTime = new Date(selection.startDateTime).getTime();
  const endTime = new Date(selection.endDateTime).getTime();
  const logs = sampleDowntimeLogs
    .filter((log) => {
      const logTime = new Date(log.timestamp).getTime();

      return (
        log.department === selection.department &&
        log.line === selection.line &&
        log.machine === selection.machine &&
        Number.isFinite(logTime) &&
        logTime >= startTime &&
        logTime <= endTime
      );
    })
    .sort((first, second) => first.timestamp.localeCompare(second.timestamp));

  if (!logs.length) {
    return {
      totalStops: 0,
      estimatedDowntimeMinutes: 0,
      mostCommonStopReason: "No sample stops in range",
      longestDowntimeEvent: "No downtime event",
      repeatedPattern:
        "No repeated pattern is visible in the selected sample range.",
      operatorAwarenessNote:
        "Continue normal observation and document any new recurring stops.",
      suggestedFollowUp:
        "Review a wider sample range or select another machine to compare patterns.",
      logs,
    };
  }

  const estimatedDowntimeMinutes = logs.reduce(
    (total, log) => total + log.durationMinutes,
    0,
  );
  const reasonCounts = logs.reduce<Record<string, number>>((counts, log) => {
    counts[log.stopReason] = (counts[log.stopReason] ?? 0) + 1;
    return counts;
  }, {});
  const mostCommonStopReason =
    Object.entries(reasonCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "No sample stops in range";
  const longestLog = logs.reduce((longest, log) =>
    log.durationMinutes > longest.durationMinutes ? log : longest,
  );

  return {
    totalStops: logs.length,
    estimatedDowntimeMinutes,
    mostCommonStopReason,
    longestDowntimeEvent: `${longestLog.durationMinutes} minutes`,
    repeatedPattern: buildRepeatedPattern(selection.machine, mostCommonStopReason),
    operatorAwarenessNote: buildAwarenessNote(mostCommonStopReason),
    suggestedFollowUp: buildSuggestedFollowUp(
      selection.machine,
      mostCommonStopReason,
    ),
    logs,
  };
}

function buildRepeatedPattern(machine: string, stopReason: string) {
  if (stopReason === "Infeed backup") {
    return "Infeed backup appeared repeatedly after short restarts.";
  }

  if (stopReason === "Pressure warning") {
    return "Pressure warnings repeated during the selected sample window.";
  }

  if (machine === "Conveyor Transfer") {
    return "Transfer stops repeated around product handoff points.";
  }

  return `${stopReason} was the most repeated sample stop for this selection.`;
}

function buildAwarenessNote(stopReason: string) {
  if (stopReason === "Infeed backup") {
    return "Watch for product buildup near the infeed before restarting.";
  }

  if (stopReason === "Transfer sensor blocked") {
    return "Watch for blocked sensors or product sitting between transfer points.";
  }

  return "Watch for the same stop reason returning after short restarts.";
}

function buildSuggestedFollowUp(machine: string, stopReason: string) {
  if (stopReason === "Infeed backup") {
    return "Ask maintenance to review infeed timing and guide alignment.";
  }

  if (stopReason === "Pressure warning") {
    return "Escalate recurring pressure warnings through the normal maintenance channel.";
  }

  return `Review repeated ${stopReason.toLowerCase()} events on the ${machine}.`;
}
