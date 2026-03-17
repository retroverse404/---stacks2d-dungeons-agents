import "./MelNpcSplash.css";
import { getConvexClient } from "../../lib/convexClient.ts";
import { api } from "../../../convex/_generated/api";
import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";

export interface MelNpcSplashProps extends SplashScreenCallbacks {
  npcName: string;
}

const MEL_SYSTEM_PROMPT =
  "You are Mel, a Stacks ecosystem curator. You surface signal from the noise: " +
  "projects worth watching, creators building something real, and content that matters. " +
  "You are opinionated, concise, and always grounded in the Stacks ecosystem. " +
  "When asked about something, give a brief, direct curatorial take. " +
  "Keep responses under 120 words.";

const MEL_CURATION_TOPICS = [
  { id: "projects", label: "Projects to watch", prompt: "Which Stacks projects are worth watching right now?" },
  { id: "creators", label: "Active builders", prompt: "Who are the most active builders in the Stacks ecosystem?" },
  { id: "signal", label: "This week's signal", prompt: "What is the strongest signal in the Stacks ecosystem this week?" },
  { id: "artifacts", label: "Premium artifacts", prompt: "Tell me about the wax cylinder archive and what makes an artifact worth collecting." },
];

export function createMelNpcSplash(props: MelNpcSplashProps): SplashScreen {
  const { npcName, onClose } = props;
  const requestClose = () => onClose();

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    }
  };
  window.addEventListener("keydown", handleKeydown);

  const el = document.createElement("div");
  el.className = "mel-overlay";
  el.addEventListener("click", (event) => {
    if (event.target === el) requestClose();
  });

  const card = document.createElement("div");
  card.className = "mel-card";
  card.addEventListener("click", (event) => event.stopPropagation());
  el.appendChild(card);

  // Header
  const header = document.createElement("div");
  header.className = "mel-header";
  card.appendChild(header);

  const headingWrap = document.createElement("div");
  header.appendChild(headingWrap);

  const eyebrow = document.createElement("div");
  eyebrow.className = "mel-eyebrow";
  eyebrow.textContent = "Curation desk";
  headingWrap.appendChild(eyebrow);

  const title = document.createElement("h2");
  title.className = "mel-title";
  title.textContent = npcName;
  headingWrap.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.className = "mel-subtitle";
  subtitle.textContent = "Signal from the noise — projects, creators, and artifacts worth your attention.";
  headingWrap.appendChild(subtitle);

  const closeBtn = document.createElement("button");
  closeBtn.className = "mel-close";
  closeBtn.textContent = "Close ×";
  closeBtn.addEventListener("click", () => requestClose());
  header.appendChild(closeBtn);

  // Topic buttons
  const topicBar = document.createElement("div");
  topicBar.className = "mel-topic-bar";
  card.appendChild(topicBar);

  // AI response area
  const responseArea = document.createElement("div");
  responseArea.className = "mel-response-area";
  card.appendChild(responseArea);

  const responseText = document.createElement("div");
  responseText.className = "mel-response-text";
  responseText.textContent = "Select a curation topic or ask Mel directly.";
  responseArea.appendChild(responseText);

  // Free-form ask
  const divider = document.createElement("hr");
  divider.className = "mel-divider";
  card.appendChild(divider);

  const askSection = document.createElement("div");
  askSection.className = "mel-ask-section";
  card.appendChild(askSection);

  const askLabel = document.createElement("div");
  askLabel.className = "mel-ask-label";
  askLabel.textContent = "Ask Mel directly";
  askSection.appendChild(askLabel);

  const askRow = document.createElement("div");
  askRow.className = "mel-ask-row";
  askSection.appendChild(askRow);

  const askInput = document.createElement("input");
  askInput.className = "mel-ask-input";
  askInput.type = "text";
  askInput.placeholder = "e.g. what artifacts are worth collecting?";
  askRow.appendChild(askInput);

  const askBtn = document.createElement("button");
  askBtn.className = "mel-ask-btn";
  askBtn.textContent = "Ask";
  askRow.appendChild(askBtn);

  const footer = document.createElement("div");
  footer.className = "mel-footer";
  footer.textContent = "Mel curates signal from the Stacks ecosystem. Premium curation surfaces are available at the phonograph and curation board.";
  card.appendChild(footer);

  // AI logic
  const convex = getConvexClient();
  let aiPending = false;

  const askMel = async (question: string) => {
    if (!question.trim() || aiPending) return;
    aiPending = true;
    askBtn.disabled = true;
    responseText.textContent = "Mel is scanning the signal…";
    responseText.classList.add("is-loading");
    try {
      const text = await convex.action((api as any)["story/storyAi"].generateDialogue, {
        agentId: "mel-curator",
        systemPrompt: MEL_SYSTEM_PROMPT,
        userMessage: question,
        conversationHistory: [],
      });
      responseText.textContent =
        typeof text === "string" && text.trim().length > 0
          ? text.trim()
          : "No signal available for that topic right now.";
    } catch (err: any) {
      responseText.textContent =
        typeof err?.message === "string" && err.message.trim().length > 0
          ? err.message.trim()
          : "The Mel AI path is unavailable right now.";
      console.warn("[MelNpcSplash] AI ask failed", err);
    } finally {
      responseText.classList.remove("is-loading");
      aiPending = false;
      askBtn.disabled = false;
    }
  };

  // Wire topic buttons
  for (const topic of MEL_CURATION_TOPICS) {
    const btn = document.createElement("button");
    btn.className = "mel-topic-btn";
    btn.textContent = topic.label;
    btn.addEventListener("click", () => void askMel(topic.prompt));
    topicBar.appendChild(btn);
  }

  // Wire free-form ask
  askBtn.addEventListener("click", () => void askMel(askInput.value));
  askInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      void askMel(askInput.value);
    }
  });

  return {
    el,
    destroy() {
      window.removeEventListener("keydown", handleKeydown);
      el.remove();
    },
  };
}
