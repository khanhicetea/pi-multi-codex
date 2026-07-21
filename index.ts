import type { Provider } from "@earendil-works/pi-ai";
import { builtinProviders } from "@earendil-works/pi-ai/providers/all";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PROVIDER_PREFIX = "openai-codex-";
const DEFAULT_SLOTS = 3;

function slotCount(): number {
  const value = process.env.PI_CODEX_NUM_PROVIDER?.trim() || String(DEFAULT_SLOTS);
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100) {
    throw new Error("PI_CODEX_NUM_PROVIDER must be an integer between 1 and 100");
  }
  return Number(value);
}

function createSlotProvider(
  source: Provider<"openai-codex-responses">,
  slot: number,
): Provider<"openai-codex-responses"> {
  const id = `${PROVIDER_PREFIX}${slot}`;

  return {
    ...source,
    id,
    name: `OpenAI Codex ${slot}`,
    getModels: () => source.getModels().map((model) => ({
      ...model,
      provider: id,
      name: `[Codex ${slot}] ${model.name}`,
    })),
  };
}

export default function multiCodex(pi: ExtensionAPI) {
  const source = builtinProviders().find(
    (provider): provider is Provider<"openai-codex-responses"> => provider.id === "openai-codex",
  );
  if (!source) throw new Error("The installed pi-ai version does not provide OpenAI Codex");

  for (let slot = 1; slot <= slotCount(); slot++) {
    pi.registerProvider(createSlotProvider(source, slot));
  }
}
