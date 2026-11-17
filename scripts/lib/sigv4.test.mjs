import { describe, expect, test } from "vitest";
import { EMPTY_PAYLOAD_SHA256, sha256Hex, signRequest } from "./sigv4.mjs";

// Published AWS example credentials and requests, from the Amazon S3
// "Signature Calculations for the Authorization Header" documentation.
const ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const NOW = new Date("2013-05-24T00:00:00.000Z");

describe("signRequest", () => {
  test("hashes an empty payload to the well known value", () => {
    expect(sha256Hex("")).toBe(EMPTY_PAYLOAD_SHA256);
  });

  test("matches the AWS documentation example for GET Object", () => {
    const { signature, signedHeaders, headers } = signRequest({
      method: "GET",
      url: "https://examplebucket.s3.amazonaws.com/test.txt",
      headers: { Range: "bytes=0-9" },
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: "us-east-1",
      now: NOW,
    });

    expect(signedHeaders).toBe("host;range;x-amz-content-sha256;x-amz-date");
    expect(signature).toBe("f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41");
    expect(headers["x-amz-date"]).toBe("20130524T000000Z");
    expect(headers.authorization).toBe(
      "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, " +
        "SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, " +
        "Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"
    );
  });

  test("matches the AWS documentation example for PUT Object", () => {
    const { signature, signedHeaders } = signRequest({
      method: "PUT",
      url: "https://examplebucket.s3.amazonaws.com/test$file.text",
      headers: { Date: "Fri, 24 May 2013 00:00:00 GMT", "x-amz-storage-class": "REDUCED_REDUNDANCY" },
      payloadHash: sha256Hex("Welcome to Amazon S3."),
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: "us-east-1",
      now: NOW,
    });

    expect(signedHeaders).toBe("date;host;x-amz-content-sha256;x-amz-date;x-amz-storage-class");
    expect(signature).toBe("98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd");
  });

  test("does not hand the Host header back, fetch sets it", () => {
    const { headers } = signRequest({
      method: "HEAD",
      url: "https://account.r2.cloudflarestorage.com/bucket/backgrounds/video/zen-beach.webm",
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      now: NOW,
    });
    expect(Object.keys(headers)).not.toContain("host");
    expect(headers.authorization).toContain("/20130524/auto/s3/aws4_request");
  });

  test("changes the signature when the key, the method or the path changes", () => {
    const base = { method: "GET", url: "https://h.example/b/k", accessKeyId: "id", secretAccessKey: "secret", now: NOW };
    const original = signRequest(base).signature;
    expect(signRequest({ ...base, secretAccessKey: "other" }).signature).not.toBe(original);
    expect(signRequest({ ...base, method: "HEAD" }).signature).not.toBe(original);
    expect(signRequest({ ...base, url: "https://h.example/b/k2" }).signature).not.toBe(original);
  });
});
