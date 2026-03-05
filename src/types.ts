import { z } from "zod";

// ─── Config (.voidhub/config.json) ───────────────────────────────────────────

export const VoidHubConfigSchema = z.object({
  base: z.string().min(1),
  username: z.string().min(1),
});

export type VoidHubConfig = z.infer<typeof VoidHubConfigSchema>;

// ─── App Manifest (void.json) ─────────────────────────────────────────────────

export const AppManifestSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with dashes"),
  repo: z.string().url().optional(),
});

export type AppManifest = z.infer<typeof AppManifestSchema>;

// ─── Discovered App (manifest + resolved fs path) ────────────────────────────

export interface DiscoveredApp {
  readonly slug: string;
  readonly manifest: AppManifest;
  readonly dir: string;
}