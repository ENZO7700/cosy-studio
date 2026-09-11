import assert from "node:assert/strict";
import { test } from "node:test";
import { assertPublicHttpUrl, hostnameBlocked, isPrivateIp } from "./ssrf.ts";

test("private IPs and localhost hosts are blocked", () => {
  assert.equal(isPrivateIp("127.0.0.1"), true);
  assert.equal(isPrivateIp("10.0.0.9"), true);
  assert.equal(isPrivateIp("192.168.1.1"), true);
  assert.equal(isPrivateIp("169.254.169.254"), true);
  assert.equal(isPrivateIp("8.8.8.8"), false);
  assert.equal(hostnameBlocked("localhost"), true);
  assert.equal(hostnameBlocked("metadata.google.internal"), true);
});

test("SSRF guard rejects loopback and credentialed URLs", async () => {
  const local = await assertPublicHttpUrl("http://127.0.0.1/");
  assert.equal(local.ok, false);
  const file = await assertPublicHttpUrl("file:///etc/passwd");
  assert.equal(file.ok, false);
  const creds = await assertPublicHttpUrl("https://user:pass@example.com");
  assert.equal(creds.ok, false);
});
