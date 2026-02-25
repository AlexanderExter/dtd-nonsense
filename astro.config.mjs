// @ts-check
import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://dtd-nonsense.vercel.app",
  output: "static",
  adapter: vercel(),

  integrations: [
    starlight({
      title: "Dungeons the Dragoning 40k",
      description:
        "Rulebook reference and play tools for Dungeons the Dragoning 40,000: 7th Edition",

      // Custom dark theme (tool pages use ToolLayout.astro's own :root tokens)
      customCss: ["./src/styles/custom.css"],

      // Default to dark mode (WH40K aesthetic)
      defaultLocale: "root",

      // Social links
      social: {
        github: "https://github.com/AlexanderExter/dtd-nonsense",
      },

      // Sidebar: rules reference + source books + tools
      sidebar: [
        {
          label: "Rules",
          items: [
            { label: "Core Rules", slug: "rules/01-core-rules" },
            { label: "Combat", slug: "rules/14-combat" },
            { label: "Social Combat", slug: "rules/15-social-combat" },
            { label: "Conditions", slug: "rules/16-conditions" },
          ],
        },
        {
          label: "Character",
          items: [
            { label: "Character Creation", slug: "rules/02-char-creation" },
            {
              label: "Characteristics & Skills",
              slug: "rules/03-characteristics-skills",
            },
            { label: "Races", slug: "rules/04-races" },
            { label: "Exaltations", slug: "rules/05-exaltations" },
            { label: "Classes", slug: "rules/06-classes" },
            {
              label: "Feats, Assets & Hindrances",
              slug: "rules/07-feats",
            },
            { label: "Backgrounds", slug: "rules/08-backgrounds" },
            { label: "Alignments", slug: "rules/09-alignments" },
          ],
        },
        {
          label: "Equipment",
          items: [
            { label: "Equipment", slug: "rules/10-equipment" },
            { label: "Artifacts", slug: "rules/20-artifacts" },
          ],
        },
        {
          label: "Powers",
          items: [
            { label: "Magic", slug: "rules/11-magic" },
            { label: "Sword Schools", slug: "rules/12-sword-schools" },
            { label: "Gun Kata", slug: "rules/13-gun-kata" },
          ],
        },
        {
          label: "Advanced",
          items: [
            { label: "Vehicles", slug: "rules/17-vehicles" },
            { label: "Ships", slug: "rules/18-ships" },
            { label: "Advanced Rules", slug: "rules/21-advanced-rules" },
          ],
        },
        {
          label: "Storytelling",
          items: [
            { label: "Antagonists", slug: "rules/19-antagonists" },
            {
              label: "Story Master Reference",
              slug: "rules/22-sm-reference",
            },
            { label: "Setting & Lore", slug: "rules/23-setting-lore" },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "Errata",
              slug: "rules/99-appendix-archive",
              badge: { text: "Errata", variant: "caution" },
            },
          ],
        },
        {
          label: "Source Books",
          collapsed: true,
          items: [
            {
              label: "Book 1: Dungeons the Dragoning",
              autogenerate: { directory: "books/book-1" },
            },
            {
              label: "Book 2: For a Few Subtitles More",
              autogenerate: { directory: "books/book-2" },
            },
          ],
        },
        {
          label: "Play Tools",
          items: [
            { label: "Tools Dashboard", link: "/tools/" },
            { label: "Dice Roller", link: "/tools/dice-roller/" },
            { label: "Quick Reference", link: "/tools/quick-reference/" },
            { label: "Character Builder", link: "/tools/character-builder/" },
            { label: "Character Sheet", link: "/tools/character-sheet/" },
            { label: "Combat Tracker", link: "/tools/combat-tracker/" },
            { label: "NPC Generator", link: "/tools/npc-generator/" },
            { label: "Ship Builder", link: "/tools/ship-builder/" },
            { label: "Success Curves", link: "/tools/success-curves/" },
            { label: "Defense Graph", link: "/tools/defense-graph/" },
          ],
        },
      ],

      // Table of contents — deeper nesting for class/feat tables
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },

      // Pagefind search (built-in)
      pagefind: true,
    }),
  ],
});
