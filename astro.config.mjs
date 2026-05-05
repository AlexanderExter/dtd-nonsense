// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://dtd-nonsense.vercel.app",
	adapter: vercel(),

	vite: { plugins: [tailwindcss()] },

	integrations: [
		react(),
		starlight({
			title: "Dungeons the Dragoning 40k",
			description: "Rulebook reference and play tools for Dungeons the Dragoning 40,000: 7th Edition",

			// Override Head component to include Vercel Analytics
			components: {
				Head: "./src/components/Head.astro",
			},

			// Custom dark theme
			customCss: ["./src/styles/tailwind.css", "./src/styles/custom.css"],

			// Default to dark mode (WH40K aesthetic)
			defaultLocale: "root",

			// Social links
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/AlexanderExter/dtd-nonsense",
				},
			],

			// Sidebar: rules reference + source books + tools
			sidebar: [
				{ label: "About", slug: "rules/00-about" },
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
						{
							label: "Quick Reference",
							link: "/tools/quick-reference/",
							attrs: { target: "_blank", rel: "noopener" },
						},
						{
							label: "Character Builder",
							link: "/tools/character-builder/",
							attrs: { target: "_blank", rel: "noopener" },
						},
						{
							label: "Character Sheet",
							link: "/tools/character-sheet/",
							attrs: { target: "_blank", rel: "noopener" },
						},
						{
							label: "Combat Tracker",
							link: "/tools/combat-tracker/",
							attrs: { target: "_blank", rel: "noopener" },
						},
						{
							label: "NPC Generator",
							link: "/tools/npc-generator/",
							attrs: { target: "_blank", rel: "noopener" },
						},
						{
							label: "Ship Builder",
							link: "/tools/ship-builder/",
							attrs: { target: "_blank", rel: "noopener" },
						},
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
