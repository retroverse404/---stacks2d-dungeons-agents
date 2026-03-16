#!/usr/bin/env node

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeed } from "@scure/bip39";
import { deriveStxPrivateKey } from "@stacks/wallet-sdk";
import { getAddressFromPrivateKey } from "@stacks/transactions";

const rl = readline.createInterface({ input, output });

const target = (process.argv[2] ?? "").trim();
if (!target) {
  console.error("Usage: node scripts/find-stacks-account.mjs <TARGET_STX_ADDRESS>");
  process.exit(1);
}

const reveal = process.argv.includes("--reveal-private-key");

const mnemonic = (await rl.question("Paste your Leather seed phrase locally: ")).trim();
rl.close();

const seed = await mnemonicToSeed(mnemonic);
const rootNode = HDKey.fromMasterSeed(seed);

console.log(`Checking derived Stacks testnet accounts for target: ${target}`);

for (let index = 0; index <= 10; index += 1) {
  const privateKey = deriveStxPrivateKey({ rootNode, index });
  const address = getAddressFromPrivateKey(privateKey, "testnet");
  const marker = address === target ? "MATCH" : "";
  const row = reveal || address === target
    ? { index, address, privateKey, marker }
    : { index, address, marker };
  console.log(JSON.stringify(row));
  if (address === target) {
    process.exit(0);
  }
}

console.error("No matching address found in indices 0..10.");
process.exit(2);
