/**
 * Dialogue splash – NPC conversation with branching responses.
 */
import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";

export interface DialogueNode {
  id: string;
  text: string;
  speaker?: string;
  responses?: { text: string; nextNodeId: string; effect?: string }[];
  nextNodeId?: string;
}

export interface DialogueSplashProps extends SplashScreenCallbacks {
  nodes: DialogueNode[];
  startNodeId?: string;
  npcName?: string;
  onChoice?: (nodeId: string, responseIndex: number) => void;
}

export function createDialogueSplash(props: DialogueSplashProps): SplashScreen {
  const { nodes, startNodeId, npcName, onClose, onChoice } = props;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let currentNodeId = startNodeId ?? nodes[0]?.id ?? "";

  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;bottom:0;left:0;right:0;padding:32px;display:flex;justify-content:center;pointer-events:auto;";

  const card = document.createElement("div");
  card.style.cssText =
    "background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);" +
    "padding:28px 32px;max-width:760px;width:100%;box-shadow:0 -4px 24px rgba(0,0,0,0.5);";
  el.appendChild(card);

  function render() {
    card.innerHTML = "";
    const node = nodeMap.get(currentNodeId);
    if (!node) { onClose(); return; }

    // Speaker name
    const speaker = node.speaker ?? npcName;
    if (speaker) {
      const sp = document.createElement("div");
      sp.style.cssText = "font-size:16px;font-weight:700;color:var(--accent);margin-bottom:10px;";
      sp.textContent = speaker;
      card.appendChild(sp);
    }

    // Text
    const p = document.createElement("p");
    p.style.cssText =
      `font-size:19px;line-height:1.65;color:var(--text-primary);margin-bottom:${node.responses ? "20px" : "10px"};`;
    p.textContent = node.text;
    card.appendChild(p);

    // Responses or continue
    if (node.responses && node.responses.length > 0) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-direction:column;gap:6px;";
      node.responses.forEach((resp, i) => {
        const btn = document.createElement("button");
        btn.style.cssText =
          "padding:13px 18px;background:var(--bg-hover);border:1px solid var(--border);" +
          "border-radius:var(--radius-sm);color:var(--text-primary);font-size:16px;line-height:1.45;text-align:left;cursor:pointer;";
        btn.textContent = resp.text;
        btn.addEventListener("click", () => {
          onChoice?.(currentNodeId, i);
          advance(resp.nextNodeId);
        });
        wrap.appendChild(btn);
      });
      card.appendChild(wrap);
    } else {
      const btn = document.createElement("button");
      btn.style.cssText =
        "padding:10px 18px;background:var(--accent);border-radius:var(--radius-sm);" +
        "color:white;font-size:15px;font-weight:600;cursor:pointer;border:none;";
      btn.textContent = node.nextNodeId ? "Continue" : "Close";
      btn.addEventListener("click", () => advance(node.nextNodeId));
      card.appendChild(btn);
    }
  }

  function advance(nextId?: string) {
    if (nextId && nodeMap.has(nextId)) {
      currentNodeId = nextId;
      render();
    } else {
      onClose();
    }
  }

  render();

  return {
    el,
    destroy() { el.remove(); },
  };
}
