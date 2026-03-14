import express from "express";
import { STACKS_NETWORKS, STXtoMicroSTX, paymentMiddleware } from "x402-stacks";

const app = express();
const port = Number(process.env.PORT || 4020);
const networkName = (process.env.NETWORK || "testnet").toLowerCase();
const serverAddress = process.env.SERVER_ADDRESS || "";
const facilitatorUrl =
  process.env.FACILITATOR_URL || "https://facilitator.stacksx402.com";
const guidePremiumPrice = Number(process.env.GUIDE_PREMIUM_PRICE_STX || "1");

const network =
  networkName === "mainnet"
    ? STACKS_NETWORKS.MAINNET
    : STACKS_NETWORKS.TESTNET;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "stacks2d-x402-api",
    network: networkName,
    configured: Boolean(serverAddress),
  });
});

app.get("/api/premium/guide-btc/metadata", (_req, res) => {
  res.json({
    name: "guide.btc classified briefing",
    description: "Premium Stacks ecosystem briefing for the guide desk.",
    network: networkName,
    asset: "STX",
    priceStx: guidePremiumPrice,
    resource: "/api/premium/guide-btc",
    facilitatorUrl,
    status: "scaffolded",
  });
});

if (!serverAddress) {
  app.get("/api/premium/guide-btc", (_req, res) => {
    res.status(503).json({
      error: "x402_api_not_configured",
      message:
        "SERVER_ADDRESS is not set. Configure the x402 API before enabling paid guide access.",
    });
  });
} else {
  app.get(
    "/api/premium/guide-btc",
    paymentMiddleware({
      amount: STXtoMicroSTX(guidePremiumPrice),
      payTo: serverAddress,
      network,
      asset: "STX",
      facilitatorUrl,
      description: "guide.btc classified briefing",
    }),
    (_req, res) => {
      res.json({
        title: "guide.btc classified briefing",
        classification: "premium",
        summary:
          "This endpoint is the narrow x402 payment boundary for premium guide content.",
        network: networkName,
        asset: "STX",
        priceStx: guidePremiumPrice,
        deliveredAt: Date.now(),
      });
    },
  );
}

app.listen(port, () => {
  console.log(
    `[stacks2d-x402-api] listening on http://127.0.0.1:${port} (${networkName})`,
  );
});
