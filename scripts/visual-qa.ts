import { mkdir } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import { encode } from "next-auth/jwt";
import { chromium } from "playwright";

import { getPrisma } from "@/server/persistence/prisma";

const baseUrl = "http://localhost:3000";
const outputDirectory = path.join(process.cwd(), "artifacts", "visual-qa");

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  const prisma = getPrisma();
  const account = await prisma.account.findFirstOrThrow({
    where: { status: "ACTIVE" },
    select: { id: true, email: true, displayName: true },
  });
  const latestScan = await prisma.scanRun.findFirst({ where: { accountId: account.id }, orderBy: { createdAt: "desc" }, select: { id: true } });
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for visual QA.");
  const token = await encode({
    secret,
    maxAge: 10 * 60,
    token: { sub: account.id, email: account.email, name: account.displayName ?? account.email },
  });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 800 }, deviceScaleFactor: 1, colorScheme: "dark" });
  const errors: string[] = [];
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDirectory, "login.png") });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Start protecting repos/i }).waitFor();
  await page.screenshot({ path: path.join(outputDirectory, "landing.png") });
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Create your account" }).waitFor();
  await page.screenshot({ path: path.join(outputDirectory, "register.png") });
  await page.goto(`${baseUrl}/verify`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Activate your account" }).waitFor();
  await page.screenshot({ path: path.join(outputDirectory, "verify.png") });
  await context.addCookies([{ name: "next-auth.session-token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
  await page.goto(`${baseUrl}/workspace`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Welcome back/i }).waitFor();
  if (await page.getByRole("heading", { name: "Scan an open pull request now" }).count()) {
    await page.getByLabel("Pull request #").fill("1");
    await page.getByRole("button", { name: "Scan pull request" }).waitFor();
  }
  await page.getByRole("link", { name: "Scan history", exact: true }).click();
  await page.waitForURL(`${baseUrl}/history`);
  await page.getByLabel("Search scans").fill("not-a-repository");
  await page.getByText("No scans match those filters.").waitFor();
  await page.getByLabel("Search scans").fill("");
  await page.getByLabel("Filter scan status").selectOption("completed");
  await page.getByLabel("Filter scan status").selectOption("all");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outputDirectory, "history.png") });
  if (latestScan) {
    await page.goto(`${baseUrl}/scans/${latestScan.id}`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Scan findings" }).waitFor();
    await page.screenshot({ path: path.join(outputDirectory, "scan-detail.png") });
  }
  await page.goto(`${baseUrl}/connect`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Connect a provider/i }).waitFor();
  await page.screenshot({ path: path.join(outputDirectory, "connect.png") });
  await page.goto(`${baseUrl}/workspace`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDirectory, "workspace.png") });
  await page.goto(`${baseUrl}/connect/repositories?provider=github`, { waitUntil: "networkidle" });
  await page.getByLabel("Search repositories").fill("nonexistent-repository-name");
  await page.getByText("No matching repositories found.").waitFor();
  await page.getByLabel("Search repositories").fill("");
  await page.screenshot({ path: path.join(outputDirectory, "repositories.png") });
  await browser.close();
  await prisma.$disconnect();
  if (errors.length) throw new Error(`Browser console errors: ${errors.join(" | ")}`);
  console.log(`Visual QA screenshots written to ${outputDirectory}`);
}

void main();
