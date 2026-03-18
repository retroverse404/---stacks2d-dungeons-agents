const MAX_AGENT_LINE_CHARS = 160;

function trimToWordBoundary(input: string, maxChars: number) {
  if (input.length <= maxChars) return input;
  const slice = input.slice(0, Math.max(0, maxChars - 1)).trimEnd();
  const boundary = slice.match(/^(.+)\s+\S+$/)?.[1]?.trimEnd();
  return `${(boundary && boundary.length >= 24 ? boundary : slice).trimEnd()}…`;
}

export function normalizeShortAgentLine(input: string, maxChars = MAX_AGENT_LINE_CHARS) {
  const collapsed = input.replace(/\s+/g, " ").trim();
  if (!collapsed) return "";

  const firstSentenceMatch = collapsed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  const firstSentence = firstSentenceMatch?.[0]?.trim() || collapsed;

  let line = trimToWordBoundary(firstSentence, maxChars);
  if (!/[.!?…]$/.test(line)) {
    line = trimToWordBoundary(line, maxChars);
    if (!/[.!?…]$/.test(line)) line = `${line}.`;
  }
  return line;
}

export { MAX_AGENT_LINE_CHARS };
