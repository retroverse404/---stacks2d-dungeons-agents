/**
 * x402 testnet payment flow test.
 *
 * Usage:
 *   TESTNET_MNEMONIC="word1 word2 ..." node test-x402-flow.mjs
 */
import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha512 } from "@noble/hashes/sha512";
import { hmac } from "@noble/hashes/hmac";
import * as secp from "@noble/secp256k1";
import stacksTx from "@stacks/transactions";
import stacksNetwork from "@stacks/network";

const { makeSTXTokenTransfer, AnchorMode, serializeTransaction } = stacksTx;
const { STACKS_TESTNET } = stacksNetwork;

const MNEMONIC = process.env.TESTNET_MNEMONIC?.trim();
const ENDPOINT = "http://127.0.0.1:4020/api/premium/market-btc/quote?tokenX=STX&tokenY=ALEX&amountIn=1000000";
const PAY_TO = "ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S";
const AMOUNT_MICRO_STX = 1000n;

if (!MNEMONIC) {
  console.error("Set TESTNET_MNEMONIC in your local environment before running this script.");
  process.exit(1);
}

// ── BIP39/BIP32 ───────────────────────────────────────────────────────────────
function mnemonicToSeed(mnemonic) {
  return pbkdf2(sha512,
    new TextEncoder().encode(mnemonic.normalize("NFKD")),
    new TextEncoder().encode("mnemonic".normalize("NFKD")),
    { c: 2048, dkLen: 64 });
}

const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;
const toHex = (buf) => Buffer.from(buf).toString("hex");
const toInt = (buf) => BigInt("0x" + toHex(buf));
const toKey = (n) => Buffer.from(n.toString(16).padStart(64, "0"), "hex");
const addN = (a, b) => (a + b) % N;
const hmac512 = (k, d) => hmac(sha512, k, d);

function master(seed) {
  const I = hmac512(new TextEncoder().encode("Bitcoin seed"), seed);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function hard(node, i) {
  const b = new Uint8Array(37);
  b[0] = 0; b.set(node.key, 1);
  new DataView(b.buffer).setUint32(33, (i | 0x80000000) >>> 0, false);
  const I = hmac512(node.chainCode, b);
  return { key: toKey(addN(toInt(I.slice(0, 32)), toInt(node.key))), chainCode: I.slice(32) };
}

function norm(node, i) {
  const b = new Uint8Array(37);
  b.set(secp.getPublicKey(node.key, true), 0);
  new DataView(b.buffer).setUint32(33, i, false);
  const I = hmac512(node.chainCode, b);
  return { key: toKey(addN(toInt(I.slice(0, 32)), toInt(node.key))), chainCode: I.slice(32) };
}

// m/44'/5757'/0'/0/0
let node = master(mnemonicToSeed(MNEMONIC));
node = hard(node, 44); node = hard(node, 5757); node = hard(node, 0);
node = norm(node, 0);  node = norm(node, 0);

// compressed private key (32 bytes + 01 suffix = 33 bytes)
const privateKeyHex = toHex(node.key) + "01";
console.log("Private key ready (first 8):", privateKeyHex.slice(0, 8) + "...");

// ── Step 1: Probe for 402 challenge ──────────────────────────────────────────
console.log("\n── Step 1: Probe endpoint ───────────────────────────────────────────");
const probeRes = await fetch(ENDPOINT);
console.log("Status:", probeRes.status);
if (probeRes.status !== 402) { console.error("Expected 402, got", probeRes.status); process.exit(1); }

const challenge = JSON.parse(Buffer.from(probeRes.headers.get("payment-required"), "base64").toString());
const req = challenge.accepts[0];
console.log("  amount:", req.amount, "micro-STX (=", Number(req.amount) / 1e6, "STX)");
console.log("  payTo:", req.payTo);
console.log("  network:", req.network);

// ── Step 2: Build signed tx (not broadcast) ───────────────────────────────────
console.log("\n── Step 2: Sign STX transfer ────────────────────────────────────────");
const tx = await makeSTXTokenTransfer({
  recipient: PAY_TO,
  amount: AMOUNT_MICRO_STX,
  senderKey: privateKeyHex,
  network: STACKS_TESTNET,
  anchorMode: AnchorMode.Any,
  memo: "x402-market-btc",
  fee: 400n,
  nonce: 2n,
});

const txHex = serializeTransaction(tx); // already returns hex string
console.log("Signed tx (first 32):", txHex.slice(0, 32) + "...");
console.log("Tx length (bytes):", txHex.length / 2);

// ── Step 3: Build x402v2 payment payload ─────────────────────────────────────
const paymentPayload = Buffer.from(JSON.stringify({
  x402Version: 2,
  scheme: "exact",
  network: req.network,
  payload: { transaction: txHex },
})).toString("base64");

// ── Step 4: Submit with payment-response header ───────────────────────────────
console.log("\n── Step 3: Submit with payment-response header ─────────────────────");
const paidRes = await fetch(ENDPOINT, {
  headers: { "payment-signature": paymentPayload },
});
console.log("Response status:", paidRes.status);
const body = await paidRes.json();
console.log("\n── Result ───────────────────────────────────────────────────────────");
console.log(JSON.stringify(body, null, 2));
