import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, concatBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { bech32 } from "@scure/base";

const BITS_PER_WORD = 5;
const BITS_PER_BYTE = 8;
const BYTE_MASK = 0xff;
const SIGNATURE_WORD_COUNT = 104;
const COMPACT_SIGNATURE_BYTE_COUNT = 64;
const CURVE_ORDER = secp256k1.Point.Fn.ORDER;

function convertWordsToZeroPaddedBytes(fiveBitWords: number[]): Uint8Array {
  const zeroPaddedBytes: number[] = [];
  let pendingBits = 0;
  let pendingBitCount = 0;
  for (const fiveBitWord of fiveBitWords) {
    pendingBits = (pendingBits << BITS_PER_WORD) | fiveBitWord;
    pendingBitCount += BITS_PER_WORD;
    while (pendingBitCount >= BITS_PER_BYTE) {
      pendingBitCount -= BITS_PER_BYTE;
      zeroPaddedBytes.push((pendingBits >> pendingBitCount) & BYTE_MASK);
    }
    pendingBits &= (1 << pendingBitCount) - 1;
  }
  if (pendingBitCount > 0) zeroPaddedBytes.push((pendingBits << (BITS_PER_BYTE - pendingBitCount)) & BYTE_MASK);
  return Uint8Array.from(zeroPaddedBytes);
}

export function recoverPayeeNodeId(invoice: string): string {
  const { prefix: humanReadablePart, words: dataPartWords } = bech32.decode(invoice, false);
  const signedWords = dataPartWords.slice(0, -SIGNATURE_WORD_COUNT);
  const signatureBytes = bech32.fromWords(dataPartWords.slice(-SIGNATURE_WORD_COUNT));
  const compactSignatureBytes = signatureBytes.slice(0, COMPACT_SIGNATURE_BYTE_COUNT);
  const recoveryId = signatureBytes[COMPACT_SIGNATURE_BYTE_COUNT];
  const signedDataHash = sha256(concatBytes(utf8ToBytes(humanReadablePart), convertWordsToZeroPaddedBytes(signedWords)));
  const invoiceSignature = secp256k1.Signature.fromBytes(compactSignatureBytes, "compact");
  const canonicalSignature = invoiceSignature.hasHighS()
    ? new secp256k1.Signature(invoiceSignature.r, CURVE_ORDER - invoiceSignature.s)
    : invoiceSignature;
  const payeePublicKey = canonicalSignature
    .addRecoveryBit(recoveryId)
    .recoverPublicKey(signedDataHash)
    .toBytes(true);
  return bytesToHex(payeePublicKey);
}
