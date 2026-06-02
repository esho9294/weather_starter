import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import astroMermaid from "astro-mermaid";

export default defineConfig({
  integrations: [
    starlight({
      title: "Weather Starter Docs",
      sidebar: [
        {
          label: "Guides",
          items: [{ autogenerate: { directory: "guides" } }],
        },
        {
          label: "Architecture",
          items: [{ autogenerate: { directory: "architecture" } }],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
    }),
    astroMermaid(),
  ],
});
