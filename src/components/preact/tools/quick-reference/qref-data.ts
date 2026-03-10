export interface QRefAction {
	name: string;
	type: string;
	subtypes: string[];
	desc: string;
}

export interface QRefCondition {
	name: string;
	effect: string;
	duration: string;
}

export interface QRefRangeBand {
	band: string;
	range: string;
	mod: string;
}

export interface QRefModifier {
	situation: string;
	mod: string;
}

export interface QRefCover {
	cover: string;
	ap: number;
}

export interface QRefTN {
	tn: number;
	diff: string;
}

export interface QRefMagicSchool {
	school: string;
	char: string;
	theme: string;
}

export interface QRefSchool {
	school: string;
	skill: string;
	weapon: string;
	action: string;
	blurb: string;
}

export interface QRefWeaponProperty {
	name: string;
	desc: string;
}

export interface QRefFormula {
	metric: string;
	formula: string;
}

export interface QRefHitLocation {
	roll: string;
	location: string;
}

export const QREF_DATA = {
	actions: [
		{
			name: "Aid Another",
			type: "H",
			subtypes: ["Misc"],
			desc: "Give another character +1k0 on their next Test. Must be adjacent; skill-gated.",
		},
		{
			name: "Aim",
			type: "H/F",
			subtypes: ["Melee", "Ranged"],
			desc: "Half: +1k0 next attack. Full: +2k0 next attack. Lost if you React before attacking.",
		},
		{
			name: "All-Out Attack",
			type: "F",
			subtypes: ["Attack", "Melee"],
			desc: "+2k0 to hit, +1k0 melee damage. Cannot Dodge or Parry until next turn.",
		},
		{
			name: "Brace",
			type: "H",
			subtypes: ["Misc"],
			desc: "Brace a heavy weapon to fire normally. -3k0 without bracing.",
		},
		{
			name: "Bull Rush",
			type: "H",
			subtypes: ["Attack", "Melee", "Movement"],
			desc: "Opposed Size + Strength. Push target 2m + 2m per Raise.",
		},
		{
			name: "Called Shot",
			type: "F",
			subtypes: ["Attack", "Melee", "Ranged"],
			desc: "Choose hit location. -2k0 to hit.",
		},
		{
			name: "Charge",
			type: "F",
			subtypes: ["Attack", "Melee", "Movement"],
			desc: "Move up to 2× Speed (min 4m), +1k0 melee attack. Must be straight line.",
		},
		{
			name: "Delay",
			type: "H",
			subtypes: ["Misc"],
			desc: "Save a Half Action for later this round. Interrupts before triggering action.",
		},
		{
			name: "Disarm",
			type: "H",
			subtypes: ["Attack", "Melee"],
			desc: "Opposed Level + Weaponry. Two Raises = opponent drops weapon.",
		},
		{
			name: "Dodge",
			type: "R",
			subtypes: ["Defense", "Movement"],
			desc: "Dexterity + Acrobatics Test. Half result added to SD vs this attack.",
		},
		{
			name: "Feint",
			type: "H",
			subtypes: ["Attack", "Melee"],
			desc: "Opposed Level + Weaponry. Win = next melee attack can't be dodged/parried.",
		},
		{
			name: "Fight Defensively",
			type: "F",
			subtypes: ["Attack", "Melee", "Ranged"],
			desc: "-2k0 to hit, +2k0 to Parry and Dodge until next turn.",
		},
		{
			name: "Focus Power",
			type: "V",
			subtypes: ["Varies"],
			desc: "Cast a spell. School + Characteristic Test vs spell TN.",
		},
		{
			name: "Full Auto Burst",
			type: "F",
			subtypes: ["Attack", "Ranged"],
			desc: "+2k1 to hit. Each Raise = +1k0 damage (up to RoF). Storm: +2k0 per Raise.",
		},
		{
			name: "Full Defense",
			type: "F",
			subtypes: ["Defense", "Melee"],
			desc: "+10 SD, gain one extra Reaction until next turn.",
		},
		{
			name: "Grapple",
			type: "H/F",
			subtypes: ["Attack", "Melee"],
			desc: "H: Initiate grapple (Brawl to hit). F: Maintain, then opposed Size + Str for controller options.",
		},
		{
			name: "Healing Surge",
			type: "H",
			subtypes: ["Misc"],
			desc: "Spend RP up to Level to heal that many HP. +5 SD until next turn.",
		},
		{
			name: "Knock Down",
			type: "H",
			subtypes: ["Attack", "Melee"],
			desc: "Opposed Size + Strength. Win = target prone. Lose by 3+ Raises = you're prone.",
		},
		{
			name: "Move",
			type: "H/F",
			subtypes: ["Movement"],
			desc: "Half: move Speed meters. Full: move 2× Speed. Provokes when leaving melee.",
		},
		{
			name: "Multiple Attacks",
			type: "F",
			subtypes: ["Attack", "Melee", "Ranged"],
			desc: "Extra attacks spending Reactions. Requires two weapons or feat (Swift/Lightning Attack).",
		},
		{
			name: "Opportunity Attack",
			type: "Fr",
			subtypes: ["Attack", "Melee"],
			desc: "Free melee attack when enemy uses a Provokes action while engaged. Once per turn.",
		},
		{
			name: "Overwatch",
			type: "F",
			subtypes: ["Attack", "Ranged"],
			desc: "Establish 45° kill zone. Fire Full Auto or Suppressing Fire when conditions met. Ends if you React.",
		},
		{
			name: "Parry",
			type: "R",
			subtypes: ["Defense", "Melee"],
			desc: "Weaponry Test (+ Level k0 if proficient). Half result added to SD vs melee attack.",
		},
		{
			name: "Ready",
			type: "H",
			subtypes: ["Misc"],
			desc: "Draw/stow weapon or item. Also: apply bandage, coat blade, etc. Provokes.",
		},
		{
			name: "Reload",
			type: "V",
			subtypes: ["Misc"],
			desc: "Reload per weapon's listed reload time. Provokes.",
		},
		{
			name: "Run",
			type: "F",
			subtypes: ["Movement"],
			desc: "Move 6× Speed. Ranged attacks at -2k0 vs you; melee attacks at +2k0 vs you.",
		},
		{
			name: "Shift",
			type: "H",
			subtypes: ["Movement"],
			desc: "Move Dexterity in meters. Does not provoke.",
		},
		{
			name: "Stand",
			type: "H",
			subtypes: ["Movement"],
			desc: "Stand up from prone. Provokes.",
		},
		{
			name: "Standard Attack",
			type: "H",
			subtypes: ["Attack", "Melee", "Ranged"],
			desc: "Make one melee or ranged attack.",
		},
		{
			name: "Suppressing Fire",
			type: "F",
			subtypes: ["Attack", "Ranged"],
			desc: "Full auto into 45° kill zone. Targets must pass Pinning Test. Ballistics TN 20 for random hits.",
		},
		{
			name: "Tactical Advance",
			type: "F",
			subtypes: ["Movement", "Defense"],
			desc: "Move up to 2× Speed between cover. Retain old cover's benefits during move.",
		},
		{
			name: "Use a Skill",
			type: "V",
			subtypes: ["Misc"],
			desc: "Use any skill. Time/Test varies by skill.",
		},
		{
			name: "Withdraw",
			type: "F",
			subtypes: ["Movement"],
			desc: "Disengage from melee. Move up to Speed without provoking.",
		},
	] satisfies QRefAction[],
	conditions: [
		{
			name: "Amputation",
			effect: "Lose a body part. Treated as Heavily Wounded. Must heal limb damage before other healing.",
			duration: "Permanent (cybernetics/magic to restore)",
		},
		{
			name: "Blinded",
			effect: "-4k0 to physical Tests. Athletics + Dexterity TN 15 to move at Half Rate.",
			duration: "Until cured",
		},
		{
			name: "Blood Loss",
			effect: "Constitution Test each Round (TN 10 × Blood Loss). Fail = 1d10 damage per Blood Loss, ignoring Armor/Aura.",
			duration: "Until treated (First Aid / magic)",
		},
		{
			name: "Burning",
			effect: "1d10 Energy damage per Round, ignoring Armor. No actions except trying to extinguish (TN 15 Intelligence).",
			duration: "Until extinguished",
		},
		{
			name: "Crippled",
			effect: "Limb unusable. Arm: can't attack with it. Leg: fall prone, crawl 1m per Half Action.",
			duration: "Until healed",
		},
		{
			name: "Dazzled",
			effect: "-1k0 to all Tests. -2k0 total to sight-based Tests.",
			duration: "Varies",
		},
		{
			name: "Deafened",
			effect: "-2k0 to all Tests. Auto-fail hearing-based Tests.",
			duration: "Until cured",
		},
		{
			name: "Fatigue",
			effect: "-1k0 to all Tests per level (applied once). Levels > Constitution = unconscious for 10 − Con hours.",
			duration: "1 level per hour rest",
		},
		{
			name: "Frightened",
			effect: "Must flee source. If unable: -2k0 all Tests, no Attacks/Magic/Stunts.",
			duration: "End of encounter",
		},
		{
			name: "Helpless",
			effect: "No actions. Attacks auto-hit. Damage rolled twice, results added.",
			duration: "Until condition causing it ends",
		},
		{
			name: "Pinned",
			effect: "Cannot move or act (including Reactions) except Full Defense. Can still speak.",
			duration: "Until unpinned",
		},
		{
			name: "Prone",
			effect: "+2k0 melee attacks against you. -2k0 ranged attacks against you. -2k0 to your attacks. Crawl at Half Rate.",
			duration: "Stand up (Half Action)",
		},
		{
			name: "Stunned",
			effect: "No Reactions. Only action: move at Half Rate.",
			duration: "Varies (usually 1 Round)",
		},
		{
			name: "Toxic",
			effect: "Rating 1–2: that much damage/Round. Rating 3+: that many d10 damage/Round. Toughness TN 15 + Rating negates.",
			duration: "Until treated or purged",
		},
	] satisfies QRefCondition[],
	rangeBands: [
		{ band: "Point Blank", range: "< 2m (not engaged in melee)", mod: "+2k1" },
		{ band: "Short Range", range: "< ½ weapon range", mod: "+1k0" },
		{ band: "Normal", range: "Up to weapon range", mod: "—" },
		{ band: "Long Range", range: "> 2× weapon range", mod: "-1k0" },
		{ band: "Extreme Range", range: "> 3× weapon range", mod: "-3k0" },
	] satisfies QRefRangeBand[],
	meleeModifiers: [
		{ situation: "Combat Advantage", mod: "Free Raise" },
		{ situation: "Ganging Up 2:1", mod: "+1k0" },
		{ situation: "Ganging Up 3:1+", mod: "+2k0" },
		{ situation: "Higher Ground", mod: "+1k0" },
		{ situation: "Off Hand", mod: "-2k0" },
		{ situation: "Two Weapons (no feats)", mod: "-3k0 each" },
		{ situation: "Ambidextrous", mod: "Reduces penalty by 1k0" },
		{ situation: "Two Weapon Fighting feat", mod: "Reduces penalty by 2k0" },
		{ situation: "Shooting into Melee", mod: "-2k0" },
		{ situation: "Difficult Terrain", mod: "-1k0+ melee & Dodge" },
		{ situation: "Concealment", mod: "+5+ to target's SD" },
	] satisfies QRefModifier[],
	coverAP: [
		{ cover: "Armor-glass, Pipes, Thin Metal", ap: 4 },
		{ cover: "Storage Crate, Sandbags, Ice", ap: 8 },
		{ cover: "Computer Bank, Stasis Pod", ap: 16 },
		{ cover: "Rockcrete, Hatchway, Thick Iron", ap: 24 },
		{ cover: "Armaplas, Bulkhead, Plasteel", ap: 32 },
	] satisfies QRefCover[],
	tnTable: [
		{ tn: 5, diff: "Mundane" },
		{ tn: 10, diff: "Easy" },
		{ tn: 15, diff: "Average" },
		{ tn: 20, diff: "Hard" },
		{ tn: 25, diff: "Very Hard" },
		{ tn: 30, diff: "Heroic" },
		{ tn: 35, diff: "Never Done Before" },
		{ tn: 40, diff: "Never to be Done Again" },
	] satisfies QRefTN[],
	magicSchools: [
		{
			school: "Abjuration",
			char: "Willpower",
			theme: "Protection, barriers, wards",
		},
		{
			school: "Conjuration",
			char: "Willpower",
			theme: "Teleportation, summoning",
		},
		{
			school: "Divination",
			char: "Wisdom",
			theme: "Fate, prophecy, detection",
		},
		{
			school: "Enchantment",
			char: "Charisma",
			theme: "Mind control, influence",
		},
		{ school: "Evocation", char: "Charisma", theme: "Energy damage, blasts" },
		{ school: "Healing", char: "Wisdom", theme: "Buffs, cures, enhancement" },
		{
			school: "Illusion",
			char: "Intelligence",
			theme: "Deception, sensory tricks",
		},
		{
			school: "Necromancy",
			char: "Intelligence",
			theme: "Death, undeath, life drain",
		},
		{
			school: "Transmutation",
			char: "Wisdom",
			theme: "Physical transformation",
		},
	] satisfies QRefMagicSchool[],
	swordSchools: [
		{
			school: "Desert Wind",
			skill: "Athletics",
			weapon: "Syrneth",
			action: "Called Shot",
			blurb: "Speed, mobility, fire. Dazzling displays of sword skill, quick charges, and agile footwork. Higher forms scour foes with supernatural flame.",
		},
		{
			school: "Devoted Spirit",
			skill: "Medicae",
			weapon: "Flails",
			action: "Aid Another",
			blurb: "Faith, piety, endurance. Zealous devotion powers healing strikes, protective formations, and the ability to fight long after others would fall.",
		},
		{
			school: "Diamond Mind",
			skill: "Scrutiny",
			weapon: "Fencing",
			action: "Feint",
			blurb: "Perception and mental speed. Act in slivers of time others can't perceive. The mind is the true battleground — defeat the mind, defeat the body.",
		},
		{
			school: "Iron Heart",
			skill: "Perception",
			weapon: "Ordinary",
			action: "Aim",
			blurb: "Absolute weapon mastery through unending practice. Superhuman precision weaving patterns of steel that dizzy, confuse, and ultimately kill.",
		},
		{
			school: "Setting Sun",
			skill: "Deceive",
			weapon: "Brawl/Unarmed",
			action: "Fight Defensively",
			blurb: "Turn an enemy's strength against him. Weakening blows, stuns, redirects. The strongest opponent becomes the most vulnerable.",
		},
		{
			school: "Shadow Hand",
			skill: "Stealth",
			weapon: "Parrying",
			action: "Ready",
			blurb: "Deception, misdirection, surprise. The most effective blow strikes an enemy who doesn't know he's in danger. Some maneuvers manipulate shadows.",
		},
		{
			school: "Stone Dragon",
			skill: "Intimidate",
			weapon: "Two Handed",
			action: "Multi-Attack",
			blurb: "Mountain-like strength and endurance. Methodical, relentless force. Strikes of superhuman power and manifestations of perfect, idealized force.",
		},
		{
			school: "Tiger Claw",
			skill: "Acrobatics",
			weapon: "Chain",
			action: "All Out Attack",
			blurb: "Primal instinct over thought. Explosive strikes, leaps, and pounces emulating animals. Wild, energetic, and devastatingly powerful.",
		},
		{
			school: "White Raven",
			skill: "Command",
			weapon: "Cavalry",
			action: "Charge",
			blurb: "Teamwork and leadership. Two warriors gain the strength of five. Battle cries draw enemies into position for coordinated strikes.",
		},
	] satisfies QRefSchool[],
	gunKata: [
		{
			school: "Clay Pigeon",
			skill: "Performer",
			weapon: "Ordinary",
			action: "Called Shot",
			blurb: "Showmanship and precision. Flashy trick shots, speed-loading, and shooting projectiles out of the air. Style meets deadly accuracy.",
		},
		{
			school: "Crisis Zone",
			skill: "Tech-Use",
			weapon: "Heavy",
			action: "Suppress/Overwatch",
			blurb: "Heavy weapon mastery. Lay down devastating fields of fire, mark targets for allies, and shred through cover with sustained automatic fire.",
		},
		{
			school: "Elemental Gearbolt",
			skill: "Arcana",
			weapon: "Primitive",
			action: "Multiple Attacks",
			blurb: "Warp-infused primitive weapons. Spirit-bound shots that curve through air, change damage types, and strike with supernatural precision.",
		},
		{
			school: "Point Blank",
			skill: "Athletics",
			weapon: "Basic",
			action: "Full Auto Burst",
			blurb: "Close-quarters automatic fire. Dance through melee with guns blazing, force enemies into position, and overwhelm with volume of fire.",
		},
		{
			school: "Silent Scope",
			skill: "Perception",
			weapon: "Las",
			action: "Aim",
			blurb: "Long-range precision sniping. Patient aim, choosing hit locations, and remaining hidden after shooting. Distance is no obstacle.",
		},
		{
			school: "Tin Star",
			skill: "Scrutiny",
			weapon: "Pistol",
			action: "Ready",
			blurb: "Quick-draw pistol discipline. Lightning reflexes, ignoring environmental penalties, and silver-bullet shots that pierce supernatural defenses.",
		},
	] satisfies QRefSchool[],
	weaponProperties: [
		{
			name: "Accurate",
			desc: "+1k0 extra when Aiming. Single shot: +1k1 damage per 2 Raises on Aimed attack.",
		},
		{
			name: "Armored",
			desc: "+2 AP to wielding arm and body. Multiple shields don't stack.",
		},
		{ name: "Balanced", desc: "+1k0 to Parry Tests." },
		{
			name: "Beam",
			desc: "Fire continuous beam. Reuse successful attack result on consecutive rounds.",
		},
		{
			name: "Blast (X)",
			desc: "Everyone within X meters of impact is also hit. Roll location & damage for each.",
		},
		{
			name: "Brawling",
			desc: "Damage added to unarmed attacks. Uses Brawl skill.",
		},
		{
			name: "Compact",
			desc: "+10 TN to find when hidden. Basic weapons: half penalty one-handed.",
		},
		{
			name: "Defensive",
			desc: "+2k0 to Parry, -1k0 to Attack. Unproficient: -1k0 to all attacks.",
		},
		{
			name: "Flame",
			desc: "30° cone, no attack roll. Targets Dex Test (TN 5 × Ballistics) or take damage. Jams on 9s.",
		},
		{ name: "Flexible", desc: "Cannot be parried." },
		{
			name: "Homing",
			desc: "Counts as Accurate + Full Aim. Ignores long range penalty. ECM/stealth defeats it.",
		},
		{ name: "Inaccurate", desc: "No bonus from Aim action." },
		{ name: "Incendiary", desc: "Targets damaged are set On Fire." },
		{
			name: "Indirect",
			desc: "Fires in an arc over obstacles. No aim/accuracy bonuses when arcing.",
		},
		{
			name: "Overheats",
			desc: "On 9s in damage roll: take weapon's damage to firing arm. Drop weapon (Free) to avoid.",
		},
		{
			name: "Power Field",
			desc: "When parrying non-Power Field weapon, d10: on 4+ the other weapon is destroyed.",
		},
		{ name: "Proven (X)", desc: "Reroll damage dice showing X or less." },
		{ name: "Razor Sharp", desc: "2+ Raises: double weapon's Penetration." },
		{
			name: "Reach",
			desc: "Engaging a target doesn't make you engaged unless they close distance.",
		},
		{
			name: "Recharge",
			desc: "Must spend next Round charging. Fire every other Round only.",
		},
		{ name: "Reliable", desc: "Jams become misses instead." },
		{
			name: "Scatter",
			desc: "Short range: +1k0 damage per Raise. Long/Extreme: AP doubled against it.",
		},
		{
			name: "Shocking",
			desc: "Wounded target: Constitution TN 15 or Stunned 1 Round.",
		},
		{ name: "Smoke", desc: "Creates 3d10m smoke cloud lasting 3d10 Rounds." },
		{
			name: "Snare",
			desc: "Hit target: Dex Test (TN = attack roll) or Immobilized.",
		},
		{
			name: "Storm",
			desc: "Full Auto: +2k0 per Raise instead of +1k0 (up to RoF).",
		},
		{
			name: "Tearing",
			desc: "Always deals at least 1 wound when dealing damage, ignoring Resilience.",
		},
		{
			name: "Toxic",
			desc: "After damage: Constitution TN 15 or +1 wound to Gizzards.",
		},
		{
			name: "Twin-Linked",
			desc: "Single shot: +1k0 to hit. 2+ Raises: +2k0 damage.",
		},
		{ name: "Unbalanced", desc: "-1k0 to all Parry Tests." },
		{
			name: "Unreliable",
			desc: "Halve Ballistics (round down) for Jam checks.",
		},
		{ name: "Unwieldy", desc: "Cannot be used to Parry." },
	] satisfies QRefWeaponProperty[],
	formulas: [
		{
			metric: "Static Defense",
			formula: "10 + (Dexterity + Wisdom) × 3 − (Size × 2)",
		},
		{ metric: "Hit Points", formula: "(Constitution + Willpower) × 2" },
		{ metric: "Mental Defense", formula: "5 + (Composure × 5)" },
		{ metric: "Resolve", formula: "Willpower + Composure" },
		{ metric: "Speed", formula: "Strength + Dexterity" },
		{ metric: "Resilience", formula: "Size (characters)" },
		{ metric: "Initiative", formula: "1d10 + Dexterity + Composure" },
		{
			metric: "Skill Test",
			formula: "(Skill + Characteristic)k(Characteristic) vs TN",
		},
		{ metric: "Attack Test", formula: "(Skill)k(Skill) + (Level)k0 vs SD" },
		{
			metric: "Vehicle SD",
			formula: "10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)",
		},
	] satisfies QRefFormula[],
	hitLocations: [
		{ roll: "1", location: "Left Leg" },
		{ roll: "2", location: "Right Leg" },
		{ roll: "3–6", location: "Body" },
		{ roll: "7", location: "Gizzards" },
		{ roll: "8", location: "Left Arm" },
		{ roll: "9", location: "Right Arm" },
		{ roll: "10", location: "Head" },
	] satisfies QRefHitLocation[],
} as const;
