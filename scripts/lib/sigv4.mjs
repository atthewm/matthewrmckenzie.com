// AWS Signature Version 4 for S3 compatible storage (Cloudflare R2).
// Small on purpose: header based signing for single object requests, which is
// all scripts/backgrounds-to-r2.mjs needs. No SDK dependency.

import crypto from "node:crypto";

export const EMPTY_PAYLOAD_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export function sha256Hex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

/** RFC 3986 encoding: encodeURIComponent leaves ! * ' ( ) alone, SigV4 does not. */
function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** "2013-05-24T00:00:00.000Z" -> "20130524T000000Z" */
function amzTimestamp(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

/**
 * Sign one request. Returns the headers to send, including Authorization,
 * x-amz-date and x-amz-content-sha256.
 *
 * @param {object} request
 * @param {string} request.method            GET, HEAD or PUT
 * @param {string} request.url               full URL, path style (https://host/bucket/key)
 * @param {Record<string, string>} [request.headers]  extra headers to send and sign
 * @param {string} [request.payloadHash]     hex SHA-256 of the body (default: empty body)
 * @param {string} request.accessKeyId
 * @param {string} request.secretAccessKey
 * @param {string} [request.region]          "auto" for R2
 * @param {string} [request.service]
 * @param {Date} [request.now]
 */
export function signRequest({
  method,
  url,
  headers = {},
  payloadHash = EMPTY_PAYLOAD_SHA256,
  accessKeyId,
  secretAccessKey,
  region = "auto",
  service = "s3",
  now = new Date(),
}) {
  const target = new URL(url);
  const amzDate = amzTimestamp(now);
  const dateStamp = amzDate.slice(0, 8);

  const signed = { host: target.host, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate };
  for (const [name, value] of Object.entries(headers)) signed[name.toLowerCase()] = String(value);

  const names = Object.keys(signed).sort();
  const canonicalHeaders = names.map((n) => `${n}:${signed[n].trim().replace(/\s+/g, " ")}\n`).join("");
  const signedHeaders = names.join(";");

  // S3 signs the path encoded once, segment by segment.
  const canonicalUri = target.pathname
    .split("/")
    .map((segment) => encodeRfc3986(decodeURIComponent(segment)))
    .join("/");
  const canonicalQuery = [...target.searchParams.entries()]
    .map(([k, v]) => [encodeRfc3986(k), encodeRfc3986(v)])
    .sort(([a, av], [b, bv]) => (a === b ? (av < bv ? -1 : av > bv ? 1 : 0) : a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");

  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, dateStamp), region), service), "aws4_request");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  // fetch sets Host itself, so it is signed but not returned.
  const { host: _host, ...toSend } = signed;
  return {
    signature,
    signedHeaders,
    headers: {
      ...toSend,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}
