/**
 * Quick Reference — DTD 40k
 * Fast, searchable rules lookup for gameplay.
 */
const QRef = {

    /* ===================================================================
     * 1. ACTIONS REFERENCE
     * =================================================================== */
    actions: [
        { name: "Aid Another",      type: "H",  subtypes: ["Misc"],                    desc: "Give another character +1k0 on their next Test. Must be adjacent; skill-gated." },
        { name: "Aim",              type: "H/F", subtypes: ["Melee", "Ranged"],          desc: "Half: +1k0 next attack. Full: +2k0 next attack. Lost if you React before attacking." },
        { name: "All-Out Attack",   type: "F",  subtypes: ["Attack", "Melee"],           desc: "+2k0 to hit, +1k0 melee damage. Cannot Dodge or Parry until next turn." },
        { name: "Brace",            type: "H",  subtypes: ["Misc"],                      desc: "Brace a heavy weapon to fire normally. -3k0 without bracing." },
        { name: "Bull Rush",        type: "H",  subtypes: ["Attack", "Melee", "Movement"], desc: "Opposed Size + Strength. Push target 2m + 2m per Raise." },
        { name: "Called Shot",      type: "F",  subtypes: ["Attack", "Melee", "Ranged"],  desc: "Choose hit location. -2k0 to hit." },
        { name: "Charge",           type: "F",  subtypes: ["Attack", "Melee", "Movement"], desc: "Move up to 2× Speed (min 4m), +1k0 melee attack. Must be straight line." },
        { name: "Delay",            type: "H",  subtypes: ["Misc"],                       desc: "Save a Half Action for later this round. Interrupts before triggering action." },
        { name: "Disarm",           type: "H",  subtypes: ["Attack", "Melee"],             desc: "Opposed Level + Weaponry. Two Raises = opponent drops weapon." },
        { name: "Dodge",            type: "R",  subtypes: ["Defense", "Movement"],         desc: "Dexterity + Acrobatics Test. Half result added to SD vs this attack." },
        { name: "Feint",            type: "H",  subtypes: ["Attack", "Melee"],             desc: "Opposed Level + Weaponry. Win = next melee attack can't be dodged/parried." },
        { name: "Fight Defensively", type: "F", subtypes: ["Attack", "Melee", "Ranged"],   desc: "-2k0 to hit, +2k0 to Parry and Dodge until next turn." },
        { name: "Focus Power",      type: "V",  subtypes: ["Varies"],                     desc: "Cast a spell. School + Characteristic Test vs spell TN." },
        { name: "Full Auto Burst",  type: "F",  subtypes: ["Attack", "Ranged"],            desc: "+2k1 to hit. Each Raise = +1k0 damage (up to RoF). Storm: +2k0 per Raise." },
        { name: "Full Defense",     type: "F",  subtypes: ["Defense", "Melee"],             desc: "+10 SD, gain one extra Reaction until next turn." },
        { name: "Grapple",          type: "H/F", subtypes: ["Attack", "Melee"],             desc: "H: Initiate grapple (Brawl to hit). F: Maintain, then opposed Size + Str for controller options." },
        { name: "Healing Surge",    type: "H",  subtypes: ["Misc"],                       desc: "Spend RP up to Level to heal that many HP. +5 SD until next turn." },
        { name: "Knock Down",       type: "H",  subtypes: ["Attack", "Melee"],             desc: "Opposed Size + Strength. Win = target prone. Lose by 3+ Raises = you're prone." },
        { name: "Move",             type: "H/F", subtypes: ["Movement"],                   desc: "Half: move Speed meters. Full: move 2× Speed. Provokes when leaving melee." },
        { name: "Multiple Attacks", type: "F",  subtypes: ["Attack", "Melee", "Ranged"],   desc: "Extra attacks spending Reactions. Requires two weapons or feat (Swift/Lightning Attack)." },
        { name: "Opportunity Attack", type: "Fr", subtypes: ["Attack", "Melee"],            desc: "Free melee attack when enemy uses a Provokes action while engaged. Once per turn." },
        { name: "Overwatch",        type: "F",  subtypes: ["Attack", "Ranged"],             desc: "Establish 45° kill zone. Fire Full Auto or Suppressing Fire when conditions met. Ends if you React." },
        { name: "Parry",            type: "R",  subtypes: ["Defense", "Melee"],             desc: "Weaponry Test (+ Level k0 if proficient). Half result added to SD vs melee attack." },
        { name: "Ready",            type: "H",  subtypes: ["Misc"],                        desc: "Draw/stow weapon or item. Also: apply bandage, coat blade, etc. Provokes." },
        { name: "Reload",           type: "V",  subtypes: ["Misc"],                        desc: "Reload per weapon's listed reload time. Provokes." },
        { name: "Run",              type: "F",  subtypes: ["Movement"],                    desc: "Move 6× Speed. Ranged attacks at -2k0 vs you; melee attacks at +2k0 vs you." },
        { name: "Shift",            type: "H",  subtypes: ["Movement"],                    desc: "Move Dexterity in meters. Does not provoke." },
        { name: "Stand",            type: "H",  subtypes: ["Movement"],                    desc: "Stand up from prone. Provokes." },
        { name: "Standard Attack",  type: "H",  subtypes: ["Attack", "Melee", "Ranged"],   desc: "Make one melee or ranged attack." },
        { name: "Suppressing Fire", type: "F",  subtypes: ["Attack", "Ranged"],             desc: "Full auto into 45° kill zone. Targets must pass Pinning Test. Ballistics TN 20 for random hits." },
        { name: "Tactical Advance", type: "F",  subtypes: ["Movement", "Defense"],          desc: "Move up to 2× Speed between cover. Retain old cover's benefits during move." },
        { name: "Use a Skill",      type: "V",  subtypes: ["Misc"],                        desc: "Use any skill. Time/Test varies by skill." },
        { name: "Withdraw",         type: "F",  subtypes: ["Movement"],                    desc: "Disengage from melee. Move up to Speed without provoking." },
    ],

    /* ===================================================================
     * 2. CONDITIONS
     * =================================================================== */
    conditions: [
        { name: "Amputation",  effect: "Lose a body part. Treated as Heavily Wounded. Must heal limb damage before other healing.",                 duration: "Permanent (cybernetics/magic to restore)" },
        { name: "Blinded",     effect: "-4k0 to physical Tests. Athletics + Dexterity TN 15 to move at Half Rate.",                                 duration: "Until cured" },
        { name: "Blood Loss",  effect: "Constitution Test each Round (TN 10 × Blood Loss). Fail = 1d10 damage per Blood Loss, ignoring Armor/Aura.", duration: "Until treated (First Aid / magic)" },
        { name: "Burning",     effect: "1d10 Energy damage per Round, ignoring Armor. No actions except trying to extinguish (TN 15 Intelligence).", duration: "Until extinguished" },
        { name: "Crippled",    effect: "Limb unusable. Arm: can't attack with it. Leg: fall prone, crawl 1m per Half Action.",                       duration: "Until healed" },
        { name: "Dazzled",     effect: "-1k0 to all Tests. -2k0 total to sight-based Tests.",                                                        duration: "Varies" },
        { name: "Deafened",    effect: "-2k0 to all Tests. Auto-fail hearing-based Tests.",                                                          duration: "Until cured" },
        { name: "Fatigue",     effect: "-1k0 to all Tests per level (applied once). Levels > Constitution = unconscious for 10 − Con hours.",        duration: "1 level per hour rest" },
        { name: "Frightened",  effect: "Must flee source. If unable: -2k0 all Tests, no Attacks/Magic/Stunts.",                                      duration: "End of encounter" },
        { name: "Helpless",    effect: "No actions. Attacks auto-hit. Damage rolled twice, results added.",                                           duration: "Until condition causing it ends" },
        { name: "Pinned",      effect: "Cannot move or act (including Reactions) except Full Defense. Can still speak.",                               duration: "Until unpinned" },
        { name: "Prone",       effect: "+2k0 melee attacks against you. -2k0 ranged attacks against you. -2k0 to your attacks. Crawl at Half Rate.", duration: "Stand up (Half Action)" },
        { name: "Stunned",     effect: "No Reactions. Only action: move at Half Rate.",                                                               duration: "Varies (usually 1 Round)" },
        { name: "Toxic",       effect: "Rating 1–2: that much damage/Round. Rating 3+: that many d10 damage/Round. Toughness TN 15 + Rating negates.", duration: "Until treated or purged" },
    ],

    /* ===================================================================
     * 3. COMBAT MODIFIERS
     * =================================================================== */
    rangeBands: [
        { band: "Point Blank",   range: "< 2m (not engaged in melee)", mod: "+2k1" },
        { band: "Short Range",   range: "< ½ weapon range",            mod: "+1k0" },
        { band: "Normal",        range: "Up to weapon range",          mod: "—" },
        { band: "Long Range",    range: "> 2× weapon range",           mod: "-1k0" },
        { band: "Extreme Range", range: "> 3× weapon range",           mod: "-3k0" },
    ],

    meleeModifiers: [
        { situation: "Combat Advantage",      mod: "Free Raise" },
        { situation: "Ganging Up 2:1",         mod: "+1k0" },
        { situation: "Ganging Up 3:1+",        mod: "+2k0" },
        { situation: "Higher Ground",          mod: "+1k0" },
        { situation: "Off Hand",               mod: "-2k0" },
        { situation: "Two Weapons (no feats)", mod: "-3k0 each" },
        { situation: "Ambidextrous",           mod: "Reduces penalty by 1k0" },
        { situation: "Two Weapon Fighting feat", mod: "Reduces penalty by 2k0" },
        { situation: "Shooting into Melee",    mod: "-2k0" },
        { situation: "Difficult Terrain",      mod: "-1k0+ melee & Dodge" },
        { situation: "Concealment",            mod: "+5+ to target's SD" },
    ],

    coverAP: [
        { cover: "Armor-glass, Pipes, Thin Metal", ap: 4 },
        { cover: "Storage Crate, Sandbags, Ice",    ap: 8 },
        { cover: "Computer Bank, Stasis Pod",       ap: 16 },
        { cover: "Rockcrete, Hatchway, Thick Iron",  ap: 24 },
        { cover: "Armaplas, Bulkhead, Plasteel",     ap: 32 },
    ],

    /* ===================================================================
     * 4. TN REFERENCE
     * =================================================================== */
    tnTable: [
        { tn: 5,  diff: "Mundane" },
        { tn: 10, diff: "Easy" },
        { tn: 15, diff: "Average" },
        { tn: 20, diff: "Hard" },
        { tn: 25, diff: "Very Hard" },
        { tn: 30, diff: "Heroic" },
        { tn: 35, diff: "Never Done Before" },
        { tn: 40, diff: "Never to be Done Again" },
    ],

    /* ===================================================================
     * 5. MAGIC SCHOOLS
     * =================================================================== */
    magicSchools: [
        { school: "Abjuration",    char: "Willpower",    theme: "Protection, barriers, wards" },
        { school: "Conjuration",   char: "Willpower",    theme: "Teleportation, summoning" },
        { school: "Divination",    char: "Wisdom",       theme: "Fate, prophecy, detection" },
        { school: "Enchantment",   char: "Charisma",     theme: "Mind control, influence" },
        { school: "Evocation",     char: "Charisma",     theme: "Energy damage, blasts" },
        { school: "Healing",       char: "Wisdom",       theme: "Buffs, cures, enhancement" },
        { school: "Illusion",      char: "Intelligence", theme: "Deception, sensory tricks" },
        { school: "Necromancy",    char: "Intelligence", theme: "Death, undeath, life drain" },
        { school: "Transmutation", char: "Wisdom",       theme: "Physical transformation" },
    ],

    /* ===================================================================
     * 6. SWORD SCHOOLS
     * =================================================================== */
    swordSchools: [
        { school: "Desert Wind",    skill: "Athletics",  weapon: "Syrneth",       action: "Called Shot",        blurb: "Speed, mobility, fire. Dazzling displays of sword skill, quick charges, and agile footwork. Higher forms scour foes with supernatural flame." },
        { school: "Devoted Spirit", skill: "Medicae",    weapon: "Flails",        action: "Aid Another",        blurb: "Faith, piety, endurance. Zealous devotion powers healing strikes, protective formations, and the ability to fight long after others would fall." },
        { school: "Diamond Mind",   skill: "Scrutiny",   weapon: "Fencing",       action: "Feint",              blurb: "Perception and mental speed. Act in slivers of time others can't perceive. The mind is the true battleground — defeat the mind, defeat the body." },
        { school: "Iron Heart",     skill: "Perception", weapon: "Ordinary",      action: "Aim",                blurb: "Absolute weapon mastery through unending practice. Superhuman precision weaving patterns of steel that dizzy, confuse, and ultimately kill." },
        { school: "Setting Sun",    skill: "Deceive",    weapon: "Brawl/Unarmed", action: "Fight Defensively",  blurb: "Turn an enemy's strength against him. Weakening blows, stuns, redirects. The strongest opponent becomes the most vulnerable." },
        { school: "Shadow Hand",    skill: "Stealth",    weapon: "Parrying",      action: "Ready",              blurb: "Deception, misdirection, surprise. The most effective blow strikes an enemy who doesn't know he's in danger. Some maneuvers manipulate shadows." },
        { school: "Stone Dragon",   skill: "Intimidate", weapon: "Two Handed",    action: "Multi-Attack",       blurb: "Mountain-like strength and endurance. Methodical, relentless force. Strikes of superhuman power and manifestations of perfect, idealized force." },
        { school: "Tiger Claw",     skill: "Acrobatics", weapon: "Chain",         action: "All Out Attack",     blurb: "Primal instinct over thought. Explosive strikes, leaps, and pounces emulating animals. Wild, energetic, and devastatingly powerful." },
        { school: "White Raven",    skill: "Command",    weapon: "Cavalry",       action: "Charge",             blurb: "Teamwork and leadership. Two warriors gain the strength of five. Battle cries draw enemies into position for coordinated strikes." },
    ],

    /* ===================================================================
     * 7. GUN KATA
     * =================================================================== */
    gunKata: [
        { school: "Clay Pigeon",        skill: "Performer",  weapon: "Ordinary",  action: "Called Shot",        blurb: "Showmanship and precision. Flashy trick shots, speed-loading, and shooting projectiles out of the air. Style meets deadly accuracy." },
        { school: "Crisis Zone",         skill: "Tech-Use",   weapon: "Heavy",     action: "Suppress/Overwatch", blurb: "Heavy weapon mastery. Lay down devastating fields of fire, mark targets for allies, and shred through cover with sustained automatic fire." },
        { school: "Elemental Gearbolt",  skill: "Arcana",     weapon: "Primitive", action: "Multiple Attacks",   blurb: "Warp-infused primitive weapons. Spirit-bound shots that curve through air, change damage types, and strike with supernatural precision." },
        { school: "Point Blank",         skill: "Athletics",  weapon: "Basic",     action: "Full Auto Burst",    blurb: "Close-quarters automatic fire. Dance through melee with guns blazing, force enemies into position, and overwhelm with volume of fire." },
        { school: "Silent Scope",        skill: "Perception", weapon: "Las",       action: "Aim",                blurb: "Long-range precision sniping. Patient aim, choosing hit locations, and remaining hidden after shooting. Distance is no obstacle." },
        { school: "Tin Star",            skill: "Scrutiny",   weapon: "Pistol",    action: "Ready",              blurb: "Quick-draw pistol discipline. Lightning reflexes, ignoring environmental penalties, and silver-bullet shots that pierce supernatural defenses." },
    ],

    /* ===================================================================
     * 8. WEAPON PROPERTIES
     * =================================================================== */
    weaponProperties: [
        { name: "Accurate",     desc: "+1k0 extra when Aiming. Single shot: +1k1 damage per 2 Raises on Aimed attack." },
        { name: "Armored",      desc: "+2 AP to wielding arm and body. Multiple shields don't stack." },
        { name: "Balanced",     desc: "+1k0 to Parry Tests." },
        { name: "Beam",         desc: "Fire continuous beam. Reuse successful attack result on consecutive rounds." },
        { name: "Blast (X)",    desc: "Everyone within X meters of impact is also hit. Roll location & damage for each." },
        { name: "Brawling",     desc: "Damage added to unarmed attacks. Uses Brawl skill." },
        { name: "Compact",      desc: "+10 TN to find when hidden. Basic weapons: half penalty one-handed." },
        { name: "Defensive",    desc: "+2k0 to Parry, -1k0 to Attack. Unproficient: -1k0 to all attacks." },
        { name: "Flame",        desc: "30° cone, no attack roll. Targets Dex Test (TN 5 × Ballistics) or take damage. Jams on 9s." },
        { name: "Flexible",     desc: "Cannot be parried." },
        { name: "Homing",       desc: "Counts as Accurate + Full Aim. Ignores long range penalty. ECM/stealth defeats it." },
        { name: "Inaccurate",   desc: "No bonus from Aim action." },
        { name: "Incendiary",   desc: "Targets damaged are set On Fire." },
        { name: "Indirect",     desc: "Fires in an arc over obstacles. No aim/accuracy bonuses when arcing." },
        { name: "Overheats",    desc: "On 9s in damage roll: take weapon's damage to firing arm. Drop weapon (Free) to avoid." },
        { name: "Power Field",  desc: "When parrying non-Power Field weapon, d10: on 4+ the other weapon is destroyed." },
        { name: "Proven (X)",   desc: "Reroll damage dice showing X or less." },
        { name: "Razor Sharp",  desc: "2+ Raises: double weapon's Penetration." },
        { name: "Reach",        desc: "Engaging a target doesn't make you engaged unless they close distance." },
        { name: "Recharge",     desc: "Must spend next Round charging. Fire every other Round only." },
        { name: "Reliable",     desc: "Jams become misses instead." },
        { name: "Scatter",      desc: "Short range: +1k0 damage per Raise. Long/Extreme: AP doubled against it." },
        { name: "Shocking",     desc: "Wounded target: Constitution TN 15 or Stunned 1 Round." },
        { name: "Smoke",        desc: "Creates 3d10m smoke cloud lasting 3d10 Rounds." },
        { name: "Snare",        desc: "Hit target: Dex Test (TN = attack roll) or Immobilized." },
        { name: "Storm",        desc: "Full Auto: +2k0 per Raise instead of +1k0 (up to RoF)." },
        { name: "Tearing",      desc: "Always deals at least 1 wound when dealing damage, ignoring Resilience." },
        { name: "Toxic",        desc: "After damage: Constitution TN 15 or +1 wound to Gizzards." },
        { name: "Twin-Linked",  desc: "Single shot: +1k0 to hit. 2+ Raises: +2k0 damage." },
        { name: "Unbalanced",   desc: "-1k0 to all Parry Tests." },
        { name: "Unreliable",   desc: "Halve Ballistics (round down) for Jam checks." },
        { name: "Unwieldy",     desc: "Cannot be used to Parry." },
    ],

    /* ===================================================================
     * 9. FORMULA QUICK REFERENCE
     * =================================================================== */
    formulas: [
        { metric: "Static Defense",  formula: "10 + (Dexterity + Wisdom) × 3 − (Size × 2)" },
        { metric: "Hit Points",      formula: "(Constitution + Willpower) × 2" },
        { metric: "Mental Defense",  formula: "5 + (Composure × 5)" },
        { metric: "Resolve",         formula: "Willpower + Composure" },
        { metric: "Speed",           formula: "Dexterity − Size + 5" },
        { metric: "Resilience",      formula: "Size (characters)" },
        { metric: "Initiative",      formula: "1d10 + Dexterity + Composure" },
        { metric: "Skill Test",      formula: "(Skill + Characteristic)k(Characteristic) vs TN" },
        { metric: "Attack Test",     formula: "(Skill)k(Skill) + (Level)k0 vs SD" },
        { metric: "Vehicle SD",      formula: "10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)" },
    ],

    /* ===================================================================
     * 10. HIT LOCATION TABLE
     * =================================================================== */
    hitLocations: [
        { roll: "1",   location: "Left Leg" },
        { roll: "2",   location: "Right Leg" },
        { roll: "3–6", location: "Body" },
        { roll: "7",   location: "Gizzards" },
        { roll: "8",   location: "Left Arm" },
        { roll: "9",   location: "Right Arm" },
        { roll: "10",  location: "Head" },
    ],
};


/* ======================================================================
 * UI CONTROLLER
 * ====================================================================== */
(function () {
    "use strict";

    let searchTimeout = null;
    const DEBOUNCE_MS = 200;

    /* ------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------ */
    function esc(str) {
        const el = document.createElement("span");
        el.textContent = str;
        return el.innerHTML;
    }

    function badgeHTML(type) {
        // type may be "H/F" — split and render each
        return type.split("/").map(function (t) {
            return '<span class="badge badge-' + esc(t.trim()) + '">' + esc(t.trim()) + "</span>";
        }).join(" ");
    }

    function subtypeTags(arr) {
        return arr.map(function (s) {
            return '<span class="subtype-tag">' + esc(s) + "</span>";
        }).join(" ");
    }

    /* ------------------------------------------------------------------
     * Section renderers — each returns HTML string for its .section-body
     * ------------------------------------------------------------------ */
    function renderActions() {
        var html = [];
        // Filter bar
        html.push('<div class="filter-bar" id="actionFilters">');
        html.push('<span class="filter-group-label">Type</span>');
        ["H", "F", "R", "Fr", "V"].forEach(function (t) {
            html.push('<button class="filter-btn badge-filter" data-filter-type="' + t + '">' + t + "</button>");
        });
        html.push('<span class="sep"></span>');
        html.push('<span class="filter-group-label">Subtype</span>');
        ["Attack", "Defense", "Movement", "Melee", "Ranged", "Misc"].forEach(function (s) {
            html.push('<button class="filter-btn subtype-filter" data-filter-subtype="' + s + '">' + s + "</button>");
        });
        html.push("</div>");

        // Table
        html.push('<div class="table-wrap"><table class="qref-table" id="actionsTable">');
        html.push("<thead><tr><th>Name</th><th>Type</th><th>Subtypes</th><th>Description</th></tr></thead>");
        html.push("<tbody>");
        QRef.actions.forEach(function (a) {
            var typeNorm = a.type.replace(/\//g, " ").trim();
            var subtypeList = a.subtypes.join(" ");
            html.push('<tr data-types="' + esc(typeNorm) + '" data-subtypes="' + esc(subtypeList) + '" data-search="' + esc((a.name + " " + a.desc + " " + subtypeList).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(a.name) + "</strong></td>");
            html.push("<td>" + badgeHTML(a.type) + "</td>");
            html.push("<td>" + subtypeTags(a.subtypes) + "</td>");
            html.push("<td>" + esc(a.desc) + "</td>");
            html.push("</tr>");
        });
        html.push("</tbody></table></div>");
        return html.join("");
    }

    function renderConditions() {
        var html = [];
        html.push('<div class="table-wrap"><table class="qref-table">');
        html.push("<thead><tr><th>Condition</th><th>Effect</th><th>Duration</th></tr></thead>");
        html.push("<tbody>");
        QRef.conditions.forEach(function (c) {
            html.push('<tr data-search="' + esc((c.name + " " + c.effect + " " + c.duration).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(c.name) + "</strong></td>");
            html.push("<td>" + esc(c.effect) + "</td>");
            html.push("<td>" + esc(c.duration) + "</td>");
            html.push("</tr>");
        });
        html.push("</tbody></table></div>");
        return html.join("");
    }

    function renderCombatModifiers() {
        var html = [];

        // Range Calculator Widget
        html.push('<div class="mod-calculator">');
        html.push('<h3>Range Calculator</h3>');
        html.push('<div class="calc-row">');
        html.push('<label>Weapon Range (m) <input type="number" id="calcWeaponRange" min="1" value="30" class="calc-input" /></label>');
        html.push('<label>Distance to Target (m) <input type="number" id="calcDistance" min="0" value="15" class="calc-input" /></label>');
        html.push('</div>');
        html.push('<div class="calc-result" id="rangeCalcResult"></div>');
        html.push('</div>');

        // Situational Modifier Toggles
        html.push('<div class="mod-calculator">');
        html.push('<h3>Modifier Accumulator</h3>');
        html.push('<div class="mod-toggles" id="modToggles">');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="0" data-kept="0" data-label="Combat Advantage" data-note="Free Raise" /> Combat Advantage</label>');
        html.push('<span class="mod-group-label">Ganging Up:</span>');
        html.push('<label class="mod-toggle"><input type="radio" name="gangup" value="0" data-rolled="0" data-kept="0" data-label="" checked /> None</label>');
        html.push('<label class="mod-toggle"><input type="radio" name="gangup" value="1" data-rolled="1" data-kept="0" data-label="Ganging Up 2:1" /> 2:1</label>');
        html.push('<label class="mod-toggle"><input type="radio" name="gangup" value="2" data-rolled="2" data-kept="0" data-label="Ganging Up 3:1+" /> 3:1+</label>');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="1" data-kept="0" data-label="Higher Ground" /> Higher Ground</label>');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="-2" data-kept="0" data-label="Off Hand" /> Off Hand</label>');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="-3" data-kept="0" data-label="Two Weapons" /> Two Weapons (-3k0 each)</label>');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="-2" data-kept="0" data-label="Shooting into Melee" /> Shooting into Melee</label>');
        html.push('<label class="mod-toggle"><input type="checkbox" data-rolled="-1" data-kept="0" data-label="Difficult Terrain" /> Difficult Terrain</label>');
        html.push('</div>');
        html.push('<div class="calc-result" id="modAccumResult"></div>');
        html.push('</div>');

        // Range Bands
        html.push("<h3>Range Bands</h3>");
        html.push('<div class="table-wrap"><table class="qref-table"><thead><tr><th>Band</th><th>Range</th><th>Modifier</th></tr></thead><tbody>');
        QRef.rangeBands.forEach(function (r) {
            html.push('<tr data-search="' + esc((r.band + " " + r.range + " " + r.mod).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(r.band) + "</strong></td><td>" + esc(r.range) + "</td><td>" + esc(r.mod) + "</td></tr>");
        });
        html.push("</tbody></table></div>");

        // Melee/Situational Modifiers
        html.push("<h3>Situational Modifiers</h3>");
        html.push('<div class="table-wrap"><table class="qref-table"><thead><tr><th>Situation</th><th>Modifier</th></tr></thead><tbody>');
        QRef.meleeModifiers.forEach(function (m) {
            html.push('<tr data-search="' + esc((m.situation + " " + m.mod).toLowerCase()) + '">');
            html.push("<td>" + esc(m.situation) + "</td><td>" + esc(m.mod) + "</td></tr>");
        });
        html.push("</tbody></table></div>");

        // Cover AP
        html.push("<h3>Cover Armor Points</h3>");
        html.push('<div class="table-wrap"><table class="qref-table"><thead><tr><th>Cover Type</th><th>AP</th></tr></thead><tbody>');
        QRef.coverAP.forEach(function (c) {
            html.push('<tr data-search="' + esc((c.cover + " " + c.ap).toLowerCase()) + '">');
            html.push("<td>" + esc(c.cover) + "</td><td>" + c.ap + "</td></tr>");
        });
        html.push("</tbody></table></div>");

        return html.join("");
    }

    function renderTN() {
        var html = [];
        html.push('<div class="table-wrap"><table class="qref-table">');
        html.push("<thead><tr><th>TN</th><th>Difficulty</th></tr></thead><tbody>");
        QRef.tnTable.forEach(function (t) {
            html.push('<tr data-search="' + esc((t.tn + " " + t.diff).toLowerCase()) + '">');
            html.push("<td><strong>" + t.tn + "</strong></td><td>" + esc(t.diff) + "</td></tr>");
        });
        html.push("</tbody></table></div>");
        html.push('<p style="margin-top:var(--space-md);color:var(--text-muted);font-size:0.85rem"><strong>Raises:</strong> Every 5 above TN. <strong>Checks:</strong> Every 5 below TN.</p>');
        return html.join("");
    }

    function renderMagicSchools() {
        var html = [];
        html.push('<div class="table-wrap"><table class="qref-table">');
        html.push("<thead><tr><th>School</th><th>Characteristic</th><th>Theme</th></tr></thead><tbody>");
        QRef.magicSchools.forEach(function (m) {
            html.push('<tr data-search="' + esc((m.school + " " + m.char + " " + m.theme).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(m.school) + "</strong></td><td>" + esc(m.char) + "</td><td>" + esc(m.theme) + "</td></tr>");
        });
        html.push("</tbody></table></div>");

        // Casting modes
        html.push('<div class="casting-modes">');
        html.push('<div class="casting-mode"><h4>Fettered</h4><p>Halve rolled dice. No Psychic Phenomena risk.</p></div>');
        html.push('<div class="casting-mode"><h4>Unfettered</h4><p>Full dice. If keeping exploded 10s, roll Psychic Phenomena.</p></div>');
        html.push('<div class="casting-mode"><h4>Push</h4><p>+1 to +3 school rating (Sanctioned) or +4 (Unsanctioned). Forced Phenomena roll.</p></div>');
        html.push("</div>");

        return html.join("");
    }

    function renderSwordSchools() {
        var html = [];
        html.push('<div class="school-cards">');
        QRef.swordSchools.forEach(function (s) {
            html.push('<div class="school-card" data-search="' + esc((s.school + " " + s.skill + " " + s.weapon + " " + s.action + " " + s.blurb).toLowerCase()) + '">');
            html.push('<div class="school-card-header"><strong>' + esc(s.school) + '</strong></div>');
            html.push('<div class="school-card-body">');
            html.push('<p class="school-blurb">' + esc(s.blurb) + '</p>');
            html.push('<div class="school-meta">');
            html.push('<span><em>Skill:</em> ' + esc(s.skill) + '</span>');
            html.push('<span><em>Weapon:</em> ' + esc(s.weapon) + '</span>');
            html.push('<span><em>Action:</em> ' + esc(s.action) + '</span>');
            html.push('</div></div></div>');
        });
        html.push('</div>');
        html.push('<p style="margin-top:var(--space-md);color:var(--text-muted);font-size:0.85rem"><strong>Martial Adept Level</strong> = highest Sword School dots. <strong>Style Points</strong> per attack = Adept Level. <strong>Cost:</strong> 50 XP per Style Point.</p>');
        return html.join("");
    }

    function renderGunKata() {
        var html = [];
        html.push('<div class="school-cards">');
        QRef.gunKata.forEach(function (g) {
            html.push('<div class="school-card" data-search="' + esc((g.school + " " + g.skill + " " + g.weapon + " " + g.action + " " + g.blurb).toLowerCase()) + '">');
            html.push('<div class="school-card-header"><strong>' + esc(g.school) + '</strong></div>');
            html.push('<div class="school-card-body">');
            html.push('<p class="school-blurb">' + esc(g.blurb) + '</p>');
            html.push('<div class="school-meta">');
            html.push('<span><em>Skill:</em> ' + esc(g.skill) + '</span>');
            html.push('<span><em>Weapon:</em> ' + esc(g.weapon) + '</span>');
            html.push('<span><em>Action:</em> ' + esc(g.action) + '</span>');
            html.push('</div></div></div>');
        });
        html.push('</div>');
        html.push('<p style="margin-top:var(--space-md);color:var(--text-muted);font-size:0.85rem"><strong>Gunslinger Level</strong> = highest Gun Kata dots. <strong>Trick Shot cost:</strong> 50 XP per Style Point.</p>');
        return html.join("");
    }

    function renderWeaponProperties() {
        var html = [];
        html.push('<div class="property-grid" id="propertiesGrid">');
        QRef.weaponProperties.forEach(function (p) {
            html.push('<div class="property-item" data-search="' + esc((p.name + " " + p.desc).toLowerCase()) + '">');
            html.push("<strong>" + esc(p.name) + "</strong>");
            html.push("<span>" + esc(p.desc) + "</span>");
            html.push("</div>");
        });
        html.push("</div>");
        return html.join("");
    }

    function renderFormulas() {
        var html = [];
        html.push('<div class="table-wrap"><table class="qref-table">');
        html.push("<thead><tr><th>Metric</th><th>Formula</th></tr></thead><tbody>");
        QRef.formulas.forEach(function (f) {
            html.push('<tr data-search="' + esc((f.metric + " " + f.formula).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(f.metric) + "</strong></td><td><span class=\"formula\">" + esc(f.formula) + "</span></td></tr>");
        });
        html.push("</tbody></table></div>");
        return html.join("");
    }

    function renderHitLocations() {
        var html = [];
        html.push('<div class="table-wrap"><table class="qref-table">');
        html.push("<thead><tr><th>d10 Roll</th><th>Location</th></tr></thead><tbody>");
        QRef.hitLocations.forEach(function (h) {
            html.push('<tr data-search="' + esc((h.roll + " " + h.location).toLowerCase()) + '">');
            html.push("<td><strong>" + esc(h.roll) + "</strong></td><td>" + esc(h.location) + "</td></tr>");
        });
        html.push("</tbody></table></div>");
        return html.join("");
    }

    /* ------------------------------------------------------------------
     * Range Calculator + Modifier Accumulator
     * ------------------------------------------------------------------ */
    function initRangeCalculator() {
        var weaponInput = document.getElementById("calcWeaponRange");
        var distInput   = document.getElementById("calcDistance");
        var resultDiv   = document.getElementById("rangeCalcResult");
        if (!weaponInput || !distInput || !resultDiv) return;

        function update() {
            var wpnRange = parseFloat(weaponInput.value) || 0;
            var distance = parseFloat(distInput.value) || 0;
            if (wpnRange <= 0) { resultDiv.textContent = "Enter weapon range."; return; }
            var ratio = distance / wpnRange;
            var band, mod, note = "";
            if (distance <= 2) {
                band = "Point Blank"; mod = "+2k1";
                note = " — Does not apply if engaged in melee";
            } else if (ratio < 0.5) {
                band = "Short Range"; mod = "+1k0";
            } else if (ratio <= 2) {
                band = "Normal Range"; mod = "— (no modifier)";
            } else if (ratio <= 3) {
                band = "Long Range"; mod = "−1k0";
            } else {
                band = "Extreme Range"; mod = "−3k0";
                note = " — No maximum range in rules; this is the worst penalty";
            }
            resultDiv.innerHTML = '<strong>' + band + '</strong> — ' + mod +
                '<span class="calc-detail"> (distance/range = ' + ratio.toFixed(2) + ')' + note + '</span>';
        }
        weaponInput.addEventListener("input", update);
        distInput.addEventListener("input", update);
        update();
    }

    function initModAccumulator() {
        var container = document.getElementById("modToggles");
        var resultDiv = document.getElementById("modAccumResult");
        if (!container || !resultDiv) return;

        function update() {
            var totalR = 0, totalK = 0;
            var freeRaise = false;
            var labels = [];
            var boxes = container.querySelectorAll("input[type=checkbox]:checked");
            for (var i = 0; i < boxes.length; i++) {
                var r = parseInt(boxes[i].getAttribute("data-rolled"), 10) || 0;
                var k = parseInt(boxes[i].getAttribute("data-kept"), 10) || 0;
                var label = boxes[i].getAttribute("data-label") || "";
                if (label === "Combat Advantage") { freeRaise = true; }
                totalR += r;
                totalK += k;
                labels.push(label);
            }
            // Ganging Up (radio — mutually exclusive, "instead" per rules)
            var gangRadio = container.querySelector('input[name="gangup"]:checked');
            if (gangRadio && gangRadio.value !== "0") {
                var gr = parseInt(gangRadio.getAttribute("data-rolled"), 10) || 0;
                totalR += gr;
                labels.push(gangRadio.getAttribute("data-label"));
            }
            if (labels.length === 0) {
                resultDiv.textContent = "Toggle modifiers above.";
                return;
            }
            var parts = [];
            if (freeRaise) parts.push("Free Raise");
            var sign = (totalR >= 0 ? "+" : "") + totalR + "k" + (totalK >= 0 ? totalK : totalK);
            parts.push(sign + " to attack roll");
            resultDiv.innerHTML = '<strong>' + parts.join(" + ") + '</strong>' +
                '<span class="calc-detail"> (' + labels.join(", ") + ')</span>';
        }
        container.addEventListener("change", update);
        update();
    }

    /* ------------------------------------------------------------------
     * Build page sections
     * ------------------------------------------------------------------ */
    var sections = [
        { id: "actions",       title: "Actions Reference",    count: QRef.actions.length + " actions",  render: renderActions },
        { id: "conditions",    title: "Conditions",           count: QRef.conditions.length + " conditions", render: renderConditions },
        { id: "modifiers",     title: "Combat Modifiers",     count: "",                                 render: renderCombatModifiers },
        { id: "magic",         title: "Magic Schools",        count: QRef.magicSchools.length + " schools", render: renderMagicSchools },
        { id: "swords",        title: "Sword Schools",        count: QRef.swordSchools.length + " schools", render: renderSwordSchools },
        { id: "gunkata",       title: "Gun Kata",             count: QRef.gunKata.length + " schools",     render: renderGunKata },
        { id: "properties",    title: "Weapon Properties",    count: QRef.weaponProperties.length + " properties", render: renderWeaponProperties },
        { id: "formulas",      title: "Formula Quick Reference", count: "",                              render: renderFormulas },
    ];

    /* Sidebar panels (always visible, not accordion) */
    var sidebarPanels = [
        { id: "tn",           title: "Target Numbers", render: renderTN },
        { id: "hitlocation",  title: "Hit Location",   render: renderHitLocations },
    ];

    function buildSections() {
        var container = document.getElementById("sectionsContainer");
        sections.forEach(function (sec) {
            var div = document.createElement("div");
            div.className = "qref-section";
            div.id = "section-" + sec.id;
            div.innerHTML =
                '<button class="section-header" aria-expanded="false">' +
                    esc(sec.title) +
                    (sec.count ? '<span class="section-count">' + esc(sec.count) + "</span>" : "") +
                "</button>" +
                '<div class="section-body">' + sec.render() + "</div>";
            container.appendChild(div);
        });

        // Build sidebar
        var sidebar = document.getElementById("sidebarContainer");
        sidebarPanels.forEach(function (panel) {
            var div = document.createElement("div");
            div.className = "sidebar-panel";
            div.id = "sidebar-" + panel.id;
            div.innerHTML = '<h3>' + esc(panel.title) + '</h3>' + panel.render();
            sidebar.appendChild(div);
        });
    }

    /* ------------------------------------------------------------------
     * Accordion toggle
     * ------------------------------------------------------------------ */
    function toggleSection(sectionEl) {
        var isOpen = sectionEl.classList.contains("open");
        sectionEl.classList.toggle("open");
        var btn = sectionEl.querySelector(".section-header");
        btn.setAttribute("aria-expanded", !isOpen);
    }

    function expandAll() {
        document.querySelectorAll(".qref-section").forEach(function (s) {
            s.classList.add("open");
            s.querySelector(".section-header").setAttribute("aria-expanded", "true");
        });
    }

    function collapseAll() {
        document.querySelectorAll(".qref-section").forEach(function (s) {
            s.classList.remove("open");
            s.querySelector(".section-header").setAttribute("aria-expanded", "false");
        });
    }

    /* ------------------------------------------------------------------
     * Search
     * ------------------------------------------------------------------ */
    function doSearch(query) {
        var q = query.toLowerCase().trim();

        // Clear highlights first
        document.querySelectorAll("mark").forEach(function (m) {
            var parent = m.parentNode;
            parent.replaceChild(document.createTextNode(m.textContent), m);
            parent.normalize();
        });

        // Reset row visibility
        document.querySelectorAll("[data-search]").forEach(function (el) {
            el.classList.remove("hidden-row");
            if (el.classList.contains("property-item")) {
                el.style.display = "";
            }
        });

        // Reset section visibility
        document.querySelectorAll(".qref-section").forEach(function (s) {
            s.classList.remove("hidden");
        });

        if (!q) {
            collapseAll();
            return;
        }

        var words = q.split(/\s+/).filter(Boolean);

        // For each section, check if any searchable elements match
        document.querySelectorAll(".qref-section").forEach(function (sec) {
            var searchables = sec.querySelectorAll("[data-search]");
            var sectionHasMatch = false;

            searchables.forEach(function (el) {
                var text = el.getAttribute("data-search");
                var matches = words.every(function (w) { return text.indexOf(w) !== -1; });
                if (matches) {
                    sectionHasMatch = true;
                } else {
                    if (el.tagName === "TR") {
                        el.classList.add("hidden-row");
                    } else if (el.classList.contains("property-item")) {
                        el.style.display = "none";
                    }
                }
            });

            // Also match section title
            var title = sec.querySelector(".section-header").textContent.toLowerCase();
            if (words.every(function (w) { return title.indexOf(w) !== -1; })) {
                sectionHasMatch = true;
                // Show all rows in this section
                searchables.forEach(function (el) {
                    el.classList.remove("hidden-row");
                    if (el.classList.contains("property-item")) {
                        el.style.display = "";
                    }
                });
            }

            if (sectionHasMatch) {
                sec.classList.remove("hidden");
                sec.classList.add("open");
                sec.querySelector(".section-header").setAttribute("aria-expanded", "true");
            } else {
                sec.classList.add("hidden");
                sec.classList.remove("open");
            }
        });

        // Highlight matching text
        highlightMatches(words);
    }

    function highlightMatches(words) {
        if (!words.length) return;
        // Build regex from words
        var escaped = words.map(function (w) {
            return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        });
        var regex = new RegExp("(" + escaped.join("|") + ")", "gi");

        document.querySelectorAll(".qref-section:not(.hidden) .section-body").forEach(function (body) {
            highlightTextNodes(body, regex);
        });
    }

    function highlightTextNodes(el, regex) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(function (textNode) {
            var text = textNode.textContent;
            if (!regex.test(text)) return;
            regex.lastIndex = 0;

            var frag = document.createDocumentFragment();
            var lastIndex = 0;
            var match;
            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                }
                var mark = document.createElement("mark");
                mark.textContent = match[0];
                frag.appendChild(mark);
                lastIndex = regex.lastIndex;
            }
            if (lastIndex < text.length) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            textNode.parentNode.replaceChild(frag, textNode);
        });
    }

    /* ------------------------------------------------------------------
     * Action filters
     * ------------------------------------------------------------------ */
    var activeTypeFilters = new Set();
    var activeSubtypeFilters = new Set();

    function applyActionFilters() {
        var table = document.getElementById("actionsTable");
        if (!table) return;
        var rows = table.querySelectorAll("tbody tr");

        rows.forEach(function (row) {
            var rowTypes = row.getAttribute("data-types").split(/\s+/);
            var rowSubtypes = row.getAttribute("data-subtypes").split(/\s+/);

            var typeMatch = activeTypeFilters.size === 0 || rowTypes.some(function (t) { return activeTypeFilters.has(t); });
            var subtypeMatch = activeSubtypeFilters.size === 0 || rowSubtypes.some(function (s) { return activeSubtypeFilters.has(s); });

            if (typeMatch && subtypeMatch) {
                row.classList.remove("hidden-row");
            } else {
                row.classList.add("hidden-row");
            }
        });
    }

    /* ------------------------------------------------------------------
     * Init
     * ------------------------------------------------------------------ */
    document.addEventListener("DOMContentLoaded", function () {
        buildSections();
        initRangeCalculator();
        initModAccumulator();

        var searchInput = document.getElementById("searchInput");
        searchInput.focus();

        // Search
        searchInput.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function () {
                // Clear action filters on search
                activeTypeFilters.clear();
                activeSubtypeFilters.clear();
                document.querySelectorAll(".filter-btn.active").forEach(function (b) { b.classList.remove("active"); });
                doSearch(searchInput.value);
            }, DEBOUNCE_MS);
        });

        // Keyboard shortcut
        document.addEventListener("keydown", function (e) {
            if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            if (e.key === "Escape" && document.activeElement === searchInput) {
                searchInput.value = "";
                doSearch("");
                searchInput.blur();
            }
        });

        // Accordion delegation
        document.getElementById("sectionsContainer").addEventListener("click", function (e) {
            var header = e.target.closest(".section-header");
            if (header) {
                toggleSection(header.parentElement);
                return;
            }

            // Action filter buttons
            var filterBtn = e.target.closest(".filter-btn");
            if (filterBtn) {
                filterBtn.classList.toggle("active");
                var type = filterBtn.getAttribute("data-filter-type");
                var subtype = filterBtn.getAttribute("data-filter-subtype");
                if (type) {
                    if (activeTypeFilters.has(type)) activeTypeFilters.delete(type);
                    else activeTypeFilters.add(type);
                }
                if (subtype) {
                    if (activeSubtypeFilters.has(subtype)) activeSubtypeFilters.delete(subtype);
                    else activeSubtypeFilters.add(subtype);
                }
                applyActionFilters();
            }
        });

        // Expand/Collapse all
        document.getElementById("expandAll").addEventListener("click", expandAll);
        document.getElementById("collapseAll").addEventListener("click", collapseAll);
    });
})();
