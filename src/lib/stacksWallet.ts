import { Address, AddressVersion, validateStacksAddress } from "@stacks/transactions";

export type StacksAppNetwork = "mainnet" | "testnet";
const STACKS_ADDRESS_CACHE_KEY = "stacks2d.stacksWalletAddress";
const STACKS_PROVIDER_CACHE_KEY = "stacks2d.stacksWalletProvider";
const WALLET_REQUEST_TIMEOUT_MS = 15000;
export type StacksWalletProviderId =
  | "LeatherProvider"
  | "XverseProviders.BitcoinProvider"
  | "AsignaProvider"
  | "FordefiProviders.UtxoProvider";

export type StacksWalletStatus = {
  connected: boolean;
  stxAddress: string | null;
  publicKey: string | null;
  providerId: StacksWalletProviderId | null;
};

export type StacksWalletAccount = {
  address: string;
  publicKey: string;
  providerId: StacksWalletProviderId | null;
};

type AddressEntry = {
  address?: string;
  symbol?: string;
  publicKey?: string;
  purpose?: string;
  addressType?: string;
};

type WalletMethod = "stx_getAddresses" | "getAddresses" | "stx_getAccounts";

async function getDirectProvider(providerId: StacksWalletProviderId) {
  const { getProviderFromId } = await import("@stacks/connect-ui");
  return (getProviderFromId(providerId) as any) ?? null;
}

export async function getInstalledStacksProviderIds(): Promise<StacksWalletProviderId[]> {
  const [{ DEFAULT_PROVIDERS }, { getInstalledProviders }] = await Promise.all([
    import("@stacks/connect"),
    import("@stacks/connect-ui"),
  ]);
  const installed = getInstalledProviders(DEFAULT_PROVIDERS);
  return installed
    .map((provider) => normalizeProviderId(provider.id))
    .filter((providerId): providerId is StacksWalletProviderId => providerId !== null);
}

function normalizeProviderId(providerId: string | null | undefined): StacksWalletProviderId | null {
  if (
    providerId === "LeatherProvider" ||
    providerId === "XverseProviders.BitcoinProvider" ||
    providerId === "AsignaProvider" ||
    providerId === "FordefiProviders.UtxoProvider"
  ) {
    return providerId;
  }
  return null;
}

function cacheStacksProviderId(providerId: StacksWalletProviderId | null) {
  if (typeof window === "undefined") return;

  if (providerId) {
    window.localStorage.setItem(STACKS_PROVIDER_CACHE_KEY, providerId);
    return;
  }

  window.localStorage.removeItem(STACKS_PROVIDER_CACHE_KEY);
}

export function getCachedStacksProviderId() {
  if (typeof window === "undefined") return null;
  return normalizeProviderId(window.localStorage.getItem(STACKS_PROVIDER_CACHE_KEY));
}

export function formatStacksProvider(providerId: string | null | undefined) {
  switch (providerId) {
    case "LeatherProvider":
      return "Leather";
    case "XverseProviders.BitcoinProvider":
      return "Xverse";
    case "AsignaProvider":
      return "Asigna";
    case "FordefiProviders.UtxoProvider":
      return "Fordefi";
    default:
      return "Stacks wallet";
  }
}

function getMethodOrder(
  providerId: StacksWalletProviderId | null,
  options?: { directProvider?: boolean },
): WalletMethod[] {
  const directProvider = options?.directProvider ?? false;
  if (providerId === "LeatherProvider") {
    return directProvider ? ["stx_getAddresses"] : ["stx_getAddresses", "getAddresses"];
  }

  if (providerId === "XverseProviders.BitcoinProvider") {
    // For direct provider calls, prefer getAddresses first. requestRaw bypasses the
    // library override layer, so Xverse can receive the standards-shaped method
    // directly without falling into wallet_connect first. stx_getAccounts remains
    // as a fallback for wallets that still expose it.
    return directProvider ? ["getAddresses", "stx_getAccounts"] : ["stx_getAccounts", "getAddresses"];
  }

  return ["getAddresses", "stx_getAccounts", "stx_getAddresses"];
}

function isAddressOnRequestedNetwork(address: string, network: StacksAppNetwork) {
  if (!validateStacksAddress(address)) return false;

  try {
    const parsed = Address.parse(address);
    const version =
      "version" in parsed
        ? parsed.version
        : "versionChar" in parsed
          ? parsed.versionChar === "T"
            ? AddressVersion.TestnetSingleSig
            : parsed.versionChar === "N"
              ? AddressVersion.TestnetMultiSig
              : parsed.versionChar === "P"
                ? AddressVersion.MainnetSingleSig
                : parsed.versionChar === "M"
                  ? AddressVersion.MainnetMultiSig
                  : null
          : null;
    if (version === null) return false;
    if (network === "testnet") {
      return (
        version === AddressVersion.TestnetSingleSig ||
        version === AddressVersion.TestnetMultiSig
      );
    }

    return (
      version === AddressVersion.MainnetSingleSig ||
      version === AddressVersion.MainnetMultiSig
    );
  } catch {
    return false;
  }
}

function getStxEntry(addresses: AddressEntry[] | undefined, network?: StacksAppNetwork) {
  if (!Array.isArray(addresses)) return null;

  return (
    addresses.find((entry) => {
      if (!entry || typeof entry.address !== "string" || typeof entry.publicKey !== "string") {
        return false;
      }
      if (network && !isAddressOnRequestedNetwork(entry.address, network)) {
        return false;
      }
      if (entry.symbol === "STX") return true;
      if (entry.purpose === "stacks" || entry.addressType === "stacks") return true;
      return validateStacksAddress(entry.address);
    }) ?? null
  );
}

function getRequestParams(
  method: WalletMethod,
  network: StacksAppNetwork,
  providerId?: StacksWalletProviderId | null,
) {
  if (method === "getAddresses") {
    if (providerId === "XverseProviders.BitcoinProvider" && network === "testnet") {
      // Xverse labels current testnet wallets as "Testnet4". Asking explicitly for
      // "testnet" triggers an unnecessary network-switch prompt even though the
      // returned ST address is already valid for our use case.
      return undefined;
    }
    return { network };
  }

  return undefined;
}

function isWalletAccessDenied(error: any) {
  return (
    error?.code === -32002 ||
    (typeof error?.message === "string" && error.message.includes("Access denied"))
  );
}

async function requestXverseWalletConnect(
  provider: any,
  network: StacksAppNetwork,
) {
  const { requestRaw } = await import("@stacks/connect");
  const walletConnectParams: Record<string, unknown> = {
    addresses: ["payment", "stacks"],
    message: "Connect TinyRealms for Stacks wallet access and x402 premium actions.",
  };
  if (network === "mainnet") {
    walletConnectParams.network = "Mainnet";
  }
  const response = (await requestWithTimeout(
    requestRaw(provider, "wallet_connect" as any, walletConnectParams as any),
  )) as { addresses?: AddressEntry[] };

  const stxEntry = getStxEntry(response.addresses, network);
  if (stxEntry?.address && stxEntry.publicKey) {
    return stxEntry;
  }

  throw new Error(
    network === "testnet"
      ? "Xverse did not return a usable testnet STX account."
      : "Xverse did not return a usable mainnet STX account.",
  );
}

function cacheStacksAddress(address: string | null) {
  if (typeof window === "undefined") return;

  if (address) {
    window.localStorage.setItem(STACKS_ADDRESS_CACHE_KEY, address);
    return;
  }

  window.localStorage.removeItem(STACKS_ADDRESS_CACHE_KEY);
}

export function getCachedStacksAddress() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STACKS_ADDRESS_CACHE_KEY);
}

async function hasInstalledStacksProvider() {
  const { getStacksProvider, isStacksWalletInstalled } = await import("@stacks/connect");

  try {
    if (typeof isStacksWalletInstalled === "function" && isStacksWalletInstalled()) {
      return true;
    }
  } catch {
    // Fall through to other checks.
  }

  try {
    if (typeof getStacksProvider === "function" && getStacksProvider()) {
      return true;
    }
  } catch {
    // Fall through to browser globals.
  }

  if (typeof window === "undefined") return false;
  if ((window as any).StacksProvider) return true;

  const legacyProviders = (window as any).webbtc_stx_providers ?? (window as any).wbip_providers;
  return Array.isArray(legacyProviders) && legacyProviders.length > 0;
}

async function requestWithTimeout<T>(promise: Promise<T>) {
  return (await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      window.setTimeout(() => {
        reject(
          new Error(
            "Wallet connection timed out. Approve the wallet prompt, or install a supported browser wallet extension and try again.",
          ),
        );
      }, WALLET_REQUEST_TIMEOUT_MS),
    ),
  ])) as T;
}

async function requestAddresses(
  network: StacksAppNetwork,
  forceWalletSelect: boolean,
  providerId?: StacksWalletProviderId,
) {
  const {
    request,
    isProviderSelected,
    disconnect,
    clearSelectedProviderId,
    getSelectedProviderId,
    setSelectedProviderId,
  } = await import("@stacks/connect");
  if (forceWalletSelect) {
    disconnect();
    clearSelectedProviderId();
  }

  let selectedProviderId =
    providerId ??
    normalizeProviderId(getSelectedProviderId()) ??
    (forceWalletSelect ? null : getCachedStacksProviderId());
  const directProvider = selectedProviderId
    ? await getDirectProvider(selectedProviderId)
    : null;
  if (selectedProviderId) {
    if (!directProvider) {
      throw new Error(
        `${formatStacksProvider(selectedProviderId)} is not available in this browser profile. Unlock or enable that extension and try again.`,
      );
    }
  }
  // When a direct provider object is already resolved, never pass forceWalletSelect=true
  // to request(). connect.js ignores the provider and shows the <connect-modal> web
  // component when both are set, which either hangs (modal invisible) or adds a redundant
  // click step the user doesn't see. Go direct when we know who to call.
  let shouldForceWalletSelect = directProvider ? false : (forceWalletSelect || !isProviderSelected());
  const methods = getMethodOrder(selectedProviderId, {
    directProvider: Boolean(directProvider),
  });

  let lastError: unknown = null;
  for (const method of methods) {
    try {
      const response = (await requestWithTimeout(
        request(
          {
            provider: directProvider ?? undefined,
            forceWalletSelect: shouldForceWalletSelect,
            persistWalletSelect: true,
            enableLocalStorage: false,
            enableOverrides: false,
            approvedProviderIds: selectedProviderId ? [selectedProviderId] : undefined,
          },
          method,
          getRequestParams(method, network, selectedProviderId) as any,
        ),
      )) as { addresses?: AddressEntry[]; accounts?: AddressEntry[] };
      shouldForceWalletSelect = false;

      const entries =
        method === "stx_getAccounts" ? response.accounts : response.addresses;
      const stxEntry = getStxEntry(entries, network);
      if (stxEntry?.address && stxEntry.publicKey) {
        selectedProviderId =
          providerId ??
          normalizeProviderId(getSelectedProviderId()) ??
          selectedProviderId;
        if (selectedProviderId) {
          setSelectedProviderId(selectedProviderId);
        }
        cacheStacksProviderId(selectedProviderId ?? null);
        return { ...stxEntry, providerId: selectedProviderId ?? null };
      }
      const wrongNetworkEntry = getStxEntry(entries);
      if (wrongNetworkEntry?.address) {
        throw new Error(
          network === "testnet"
            ? "Wallet returned a mainnet Stacks address. Switch the wallet to Stacks testnet and try again."
            : "Wallet returned a testnet Stacks address. Switch the wallet to Stacks mainnet and try again.",
        );
      }
    } catch (error: any) {
      if (error?.code === 4001 || error?.code === -31001) {
        throw new Error("Wallet connection canceled.");
      }
      if (
        selectedProviderId === "XverseProviders.BitcoinProvider" &&
        directProvider &&
        (method === "getAddresses" || method === "stx_getAccounts")
      ) {
        // Fall back to wallet_connect for any error (not just -32002):
        // "Mismatched Network" returns a non-AccessDenied code but wallet_connect
        // re-registers the app on the wallet's current network and resolves it.
        try {
          const stxEntry = await requestXverseWalletConnect(directProvider, network);
          if (selectedProviderId) {
            setSelectedProviderId(selectedProviderId);
          }
          cacheStacksProviderId(selectedProviderId ?? null);
          return { ...stxEntry, providerId: selectedProviderId ?? null };
        } catch (xverseError: any) {
          if (xverseError?.code === 4001 || xverseError?.code === -31001) {
            throw new Error("Wallet connection canceled.");
          }
          // Do not re-throw access-denied from wallet_connect: let the loop continue
          // to the next method. Throwing here skips remaining methods (e.g. getAddresses)
          // even when they would succeed.
          lastError = xverseError;
          continue;
        }
      }
      if (isWalletAccessDenied(error)) {
        throw new Error("Wallet access denied.");
      }
      shouldForceWalletSelect = false;
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  throw new Error("Wallet did not return a usable STX account.");
}

export async function getStacksWalletStatus(): Promise<StacksWalletStatus> {
  const { isConnected, getSelectedProviderId } = await import("@stacks/connect");
  const providerId =
    normalizeProviderId(getSelectedProviderId()) ?? getCachedStacksProviderId();

  if (!isConnected()) {
    cacheStacksAddress(null);
    cacheStacksProviderId(null);
    return {
      connected: false,
      stxAddress: null,
      publicKey: null,
      providerId: null,
    };
  }

  try {
    const stxEntry = await requestAddresses("testnet", false, providerId ?? undefined);
    cacheStacksAddress(stxEntry?.address ?? null);
    cacheStacksProviderId(stxEntry?.providerId ?? providerId ?? null);

    return {
      connected: true,
      stxAddress: stxEntry?.address ?? null,
      publicKey: stxEntry?.publicKey ?? null,
      providerId: stxEntry?.providerId ?? providerId ?? null,
    };
  } catch {
    cacheStacksAddress(null);
    return {
      connected: true,
      stxAddress: null,
      publicKey: null,
      providerId,
    };
  }
}

export async function ensureStacksWalletConnected() {
  const { isConnected } = await import("@stacks/connect");

  if (!isConnected()) {
    if (!(await hasInstalledStacksProvider())) {
      throw new Error("No Stacks wallet detected. Install Leather or Xverse in this browser.");
    }

    const stxEntry = await requestAddresses("testnet", false, getCachedStacksProviderId() ?? undefined);
    cacheStacksAddress(stxEntry.address ?? null);
    cacheStacksProviderId(stxEntry.providerId ?? null);
  }

  return getStacksWalletStatus();
}

export async function connectStacksWallet(
  network: StacksAppNetwork,
  options?: { forceWalletSelect?: boolean; providerId?: StacksWalletProviderId },
): Promise<StacksWalletAccount> {
  if (!(await hasInstalledStacksProvider())) {
    throw new Error(
      "No supported Stacks browser wallet was detected. Install Leather or Xverse in this browser and switch it to testnet.",
    );
  }

  const forceWalletSelect = options?.forceWalletSelect ?? false;
  const stxEntry = await requestAddresses(network, forceWalletSelect, options?.providerId);
  cacheStacksAddress(stxEntry.address ?? null);
  cacheStacksProviderId(stxEntry.providerId ?? null);

  return {
    address: stxEntry.address as string,
    publicKey: stxEntry.publicKey as string,
    providerId: stxEntry.providerId ?? null,
  };
}

export async function disconnectStacksWallet() {
  const { disconnect, clearSelectedProviderId } = await import("@stacks/connect");
  disconnect();
  clearSelectedProviderId();
  cacheStacksAddress(null);
  cacheStacksProviderId(null);
}

export async function signStacksTransaction(
  transaction: string,
  providerId?: StacksWalletProviderId | null,
) {
  const { request, setSelectedProviderId } = await import("@stacks/connect");
  const normalizedProviderId = providerId ?? getCachedStacksProviderId();

  if (normalizedProviderId) {
    const directProvider = await getDirectProvider(normalizedProviderId);
    if (!directProvider) {
      throw new Error(
        `${formatStacksProvider(normalizedProviderId)} is not available in this browser profile. Unlock or enable that extension and try again.`,
      );
    }

    const result = await requestWithTimeout(
      request(
        {
          provider: directProvider,
          persistWalletSelect: true,
          enableLocalStorage: false,
          approvedProviderIds: [normalizedProviderId],
        },
        "stx_signTransaction",
        {
          transaction,
          broadcast: false,
        },
      ),
    );
    setSelectedProviderId(normalizedProviderId);
    cacheStacksProviderId(normalizedProviderId);
    return result as { transaction?: string };
  }

  return (await requestWithTimeout(
    request("stx_signTransaction", {
      transaction,
      broadcast: false,
    }),
  )) as { transaction?: string };
}

export function formatStacksAddress(address: string, visibleChars = 6) {
  if (address.length <= visibleChars * 2 + 1) return address;
  return `${address.slice(0, visibleChars)}...${address.slice(-visibleChars)}`;
}
