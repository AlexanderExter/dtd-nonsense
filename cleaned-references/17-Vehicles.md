---
description: Vehicle rules and combat
sidebar:
  label: Vehicles
  order: 17
title: Vehicles
---

# Vehicles

## Vehicle Stats

### Acceleration

A vehicle's **Acceleration** (Acc) tells you how quickly it can accelerate and decelerate. A vehicle may, as part of a normal Maintain Control action, change its Momentum by up to its Acceleration stat.

### Momentum

While Acc tells you how quickly a vehicle can change its speed, **Momentum** (Mom) tells you how close to its top speed it's going. A vehicle's Momentum can range from 0 to 10. Rather than being a static stat, Momentum is a dynamic number that changes as a vehicle accelerates and decelerates. A vehicle's momentum also affects its Maneuver and its Static Defense.

While a vehicle is completely still (Mom 0), it has a Static Defense of zero. Between Mom 1-5, it applies its Speed as a bonus on its Static Defense. At Mom 6-9, it applies twice its Speed. At Mom 10+, it can apply three times its Speed to its Static Defense.

### Hit Points

How much damage the vehicle can take before being destroyed. When a vehicle loses two or more Hit Points, it must also roll on the critical chart. If a vehicle loses more than two Hit Points in a single hit, the roll is made at +1 for every Hit Point lost beyond the second one.

### Maneuver

A vehicle's **Maneuver** (Man) is its modifier to Pilot or Drive tests, and applies to its Static Defense. A vehicle's Maneuver is penalized by its current Momentum. In addition, vehicles with a base Maneuver of less than zero require Punch It tests in order to turn.

### Size

A Vehicle's size is its most important stat. A vehicle's base Hit Points, Equipment Slots, and Resilience are equal to its size.

| Size Category | Size Range | Scale                                                                         |
| ------------- | ---------- | ----------------------------------------------------------------------------- |
| Normal        | 1-10       | Each point is about 0.5 meters                                                |
| Large Vehicle | 11-20      | Each point is about 1 meter                                                   |
| Enormous      | 21-30      | Each point is about 2 meters                                                  |
| Colossus      | 31-40      | Each point is about 5 meters                                                  |
| Titanic       | 41-50      | Each point is about 10 meters                                                 |
| Spelljammer   | 51+        | This is now as large as a ship and maybe should use the rules for a spaceship |

What this means is that if something is, say, size 33, you could calculate the thing's size along its largest axis as being about 50 meters - half a meter for each Size from 1-10 (5m), then 1 meter for each point between 11 and 20 (+10m), then 2 meters for each point from 21 to 30 (+20m), and 5 meters each for points 31 to 33 (+15m).

### Speed

A vehicle's **Speed** is its base speed. It, along with the vehicle's Drive Rating, Momentum, and any extra speed modules, is used to determine how many meters it moves on any given turn.

### Static Defense

A vehicle's Static Defense is calculated in a way similarly to that of any other entity. Use the following formula:

`Static Defense = 10 + Man − (2 × Size) + Speed Bonus`

| Momentum | Speed Bonus |
| -------- | ----------- |
| Mom 0    | 0           |
| Mom 1-5  | 1x Speed    |
| Mom 6-9  | 2x Speed    |
| Mom 10+  | 3x Speed    |

---

## Vehicles in Combat

In combat, a Vehicle automatically moves during its controller's turn. A vehicle moves a number of meters equal to:

`Movement = Speed × Drive Rating × Momentum`

As an example, take a normal car (Ground Vehicle, Speed 10). If it's moving all out at its maximum Momentum, it's going 500 meters per combat round (Speed 10, x5 for the Wheeled Drive's Drive Rating, x10 for the Momentum). That's close to 150 KPH, which is about right for an average car.

A pilot or driver of a vehicle has a number of special actions she can take. In order to use any of these actions, she must first use the core and most basic vehicle action, Maintain Control. A driver does not have to take the Maintain Control action - she may instead end up, say, being unconscious, trying to put out a fire, or eating a delicious Hostess Fruit Pie. But if she does those things she's probably going to crash into something.

### Control Tests

Control tests are made whenever a vehicle's pilot has to act to keep her vehicle from going out of control. A Control Test is made using the vehicle's Control Skill and the pilot's choice of Dexterity or Intelligence. Most vehicles that move in two dimensions use Drive as their Control Skill, and most vehicles that move in three dimensions use Pilot, but alternate forms of vehicle control can be set up to use nearly any skill.

`Control Test = Skill + Attribute + Maneuver − Momentum`

### Crashing

If a vehicle is said to 'crash', treat this as a roll on the Out of Control chart that is automatically a 10, regardless of any modifiers to a vehicle's Out of Control rolls.

### Out of Control Table

| d10 | Result        | Effect                                                                                                                                                                                                    |
| --- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-4 | Straight Edge | The vehicle continues in a straight line for this turn                                                                                                                                                    |
| 5-7 | Swerve        | The vehicle turns at random. Roll randomly to determine the direction and amount                                                                                                                          |
| 8-9 | Wild Stallion | The vehicle turns as above, and also changes its Momentum by its Acceleration. Determine randomly if the Momentum increases or decreases                                                                  |
| 10  | Turn Over     | The vehicle flips, capsizes, or otherwise finds a way to submit to the harsh mistress of gravity. The vehicle loses Hit Points equal to its Momentum, turns onto its back, and its Momentum drops to zero |

---

## Vehicle Actions

### Maintain Control

**Half Action**
**Keywords:** Movement, Vehicle

With the Maintain Control action you maintain control of a vehicle you're driving or piloting. This does not normally require a roll unless something special is going on like driving an obstacle course or flying through a hurricane. You may keep your current speed and heading or choose one of the following options:

- **Accelerate** - Increase or decrease your vehicle's Momentum by up to the vehicle's Acceleration stat, to a maximum of Momentum 10. Wheeled, tracked, and walker vehicles may go in reverse at up to half speed.
- **Turn** - Make up to a 90 degree turn as long as your vehicle's Maneuver modifier is at least +0. If it is less than that, you'll need to take a Punch It action in order to attempt to turn.

If nobody takes a Maintain Control action and the vehicle is not at a dead stop (Momentum 0) your vehicle goes out of control. Roll on the Out Of Control chart to see what happens.

### Punch It

**Half Action**
**Keywords:** Movement, Vehicle

With the Punch It action, you attempt to push a vehicle past its maximum safe limits. This allows you to exceed the safe limits of the Maintain Control action. To make a Punch It action, make a Control Test.

- **Speed** - By pushing your engine just a little harder, you can get a few more KPH out of it. The TN for the Punch It test is equal to three times the vehicle's current Momentum. If the test passes, the vehicle's Momentum or Acceleration is increased by 1. If this would put your Momentum over 10, this bonus is lost at the start of your next turn.
- **Turning** - Normally, you must choose between changing your speed and turning with a Maintain Control action. By turning with a Punch It action, you can have your cake and eat it too. Make a Punch It test with a TN equal to three times your current Momentum. If the test passes, your vehicle may change its speed before or after making up to a 90 degree turn.
- **Hard Turn** - Sometimes you just need to keep turning. Make a Punch It test with a TN of 10 plus twice the vehicle's current Momentum to make a big, wide, 180 degree turn without losing Momentum or taking two turns.

### Fire Mounted Weapon

**Half Action**
**Keywords:** Attack, Vehicle

With this action, the pilot of a vehicle may fire one of its mounted weapons. This works just like firing any other weapon — ranged weapons use Ballistics, melee weapons use Weaponry. However, feats and miscellaneous bonuses to normal attacks do not apply when making attacks with a vehicle's mounted weapons.

Mounted Weapons may be fired by the pilot on full auto as a Half Action. However, if a vehicle fires a weapon on full auto, it may not make the Evasive Maneuvers action until its next turn.

### Evasive Maneuvers

**Reaction Action**
**Keywords:** Movement, Vehicle

With this action, the pilot of a vehicle attempts to get out of the way of an incoming attack, sacrificing some speed in the process. A vehicle must have a current Momentum 1 or more to use Evasive Maneuvers. The pilot of the vehicle makes a Control Test. Half of the result of this test is added to the vehicle's Static Defense and the vehicle's Momentum is reduced by 1.

### Ramming

**Half Action or Oops! Action**
**Keywords:** Movement, Vehicle

Sometimes done intentionally, and often not. When it's intentional the driver makes a Control Test that adds the vehicle's Momentum instead of subtracting it, in an attempt to hit the target's Static Defense (they may attempt to dodge as usual). Unintentional ramming just hits, but the target wants to make a Dexterity + Acrobatics dodge/save against a TN of the vehicle's Speed + Momentum + Drive Rating.

When the vehicle hits it deals XkY+Z damage to both what it hit, and to the vehicle itself:

- X = vehicle's Size
- Y = vehicle's Momentum
- Z = vehicle's Speed + Drive Rating

If the Momentum is higher than the Size then each excess die of Momentum adds +5 to the final damage.

After determining damage, the pilot makes a Ramming test with the vehicle's Control skill and the pilot's choice of Composure or Constitution. The TN of this test is equal to the damage the vehicle dealt. If the test passes, the pilot remains in control of her vehicle and the vehicle's Momentum is reduced by 2. On a failure, the vehicle goes out of control and the vehicle's Momentum is reduced by 3. If the pilot cannot make a test (because she's dead, unconscious, or whatever), the vehicle goes Out Of Control and rolls on the Out Of Control chart.

---

## Terrain and Vehicles

### Difficult Terrain

Vehicles treat difficult terrain much the same as any character would - their speed is reduced by half. However, a vehicle is inherently more unstable than a character simply by virtue of what it is. A vehicle can go Out Of Control if it attempts to move too quickly across areas of difficult terrain.

If a vehicle's current Momentum is 6 or more, a vehicle moving through an area of difficult terrain requires a Control Test with a TN of 5 plus double the vehicle's current Momentum, or else it goes Out of Control. Especially difficult terrain, like ice, might have a much lower threshold, a higher TN for the Control Test, or both!

### Impassible Terrain

Some types of terrain - boulder fields, cliffs, deep trenches, and so forth - are all but impossible for any normal vehicle to cross. Unless a vehicle has an accessory or Drive that allows it to move through or bypass the Impassible Terrain it is, as noted, impassible. Someone who somehow gets into impassible terrain with a vehicle automatically crashes it, treating it as an automatic 10 result on the Out Of Control chart.

---

## Flying Vehicles

Any vehicle with a Drive-train that allows for flight (VTOL, Aerospace, or Scramjet) or that uses Jump Jets might just be found in the air, assuming the pilot is any good. Flying vehicles are treated mostly as normal vehicles.

A vehicle with Flying may move in all three dimensions normally (following the same rules as movement with other vehicles, just with another dimension added in). If a flying vehicle goes Out of Control or loses multiple Hit Points at one time due to damage, it begins to fall.

A falling vehicle falls (assuming standard gravity and atmosphere) 400m at the end of its first turn of falling, another 1200m at the end of its second turn, a further 2000m at the end of its third turn, and 2700m after the next turn. If a vehicle is moving at high speed it may only fall half that distance for a couple of turns, as it begins to arc towards the ground. Stuff tends to hit its terminal velocity (maximum falling speed) at Size × 100m a turn. If a falling vehicle hits something (usually the ground), it is treated as a Ramming attack made at Momentum 10.

A pilot of a falling vehicle may attempt to break out of the fall after making a normal Maintain Control action, making a Control Test against a TN of 10 plus the vehicle's size.

### Flying Vehicles and Runways

Aerospace and Scram-jet vehicles require a certain Momentum to get into the air. Most of the time, these vehicles rely on runways to get them the necessary speed for takeoff.

- An Aerospace vehicle requires at least `Size × 50m` of flat, level ground to take off or land. Most commonly, this is tarmac designed for such use, though a long grassy field or the like can also do. If it attempts to land on difficult or impossible terrain, it Crashes.
- A Scram-jet vehicle requires an even longer runway, at least `Size × 150m`. Trying to land somewhere inappropriate causes it to Crash.

---

## Chases and Dogfights

If it's on the ground, it's a chase. If it's in the air, it's dog-fighting. While it's certainly possible to resolve any chase, race, or other vehicle action with the above rules, here are some special chase rules that can add some extra strategy to the process. These rules are optional, and more appropriate for a game where the vehicles are a focus of the action instead of just something that's also there.

### Chase Action

**Half Action**
**Keywords:** Movement, Vehicle

Used in racing and dog-fighting, the Chase action is used to try and get an advantage over the opponent. Chase is used in place of a normal Maintain Control action and has all the same effects. However, in addition to Maintain Control's normal effects, the pilot may attempt a Trick, choosing her own TN and making a Control Test.

Opponents may spend a Reaction Action to respond to the Trick. If they are able to exceed the TN of the Trick, they have successfully negated the pilot's attempt to gain an edge.

Anyone who attempts a Trick or tries to respond to it goes Out Of Control if they fail the TN set by the pilot.

If the pilot succeeds at the Trick, and none of her opponents successfully counter it, she may choose one of the following options:

- **Drift** - This turn, you may move in any direction without changing your vehicle's facing.
- **Handbrake Turn** - At the end of your turn, change the vehicle's facing to any direction.
- **Vault the Curb** - Ignore difficult or impassible terrain for one turn.
- **Slip By** - You may move through occupied spaces and narrow gaps without hitting anything for the rest of this turn.
- **Barrel Roll** - Add +5 to your vehicle's Static Defense until the start of your next turn.
- **Puchilev's Cobra** - You immediately decrease your vehicle's Momentum by up to 5 points. Aerospace vehicles do not stall if their Momentum drops too low from using this.

---

## Vehicles on Their Backs

Like the noble and mighty turtle, vehicles lying on the ground on their backs are all but immobile and useless. Unless the vehicle has a drive or accessory that allows it to self-right, it is stuck there until someone gets out and gives it a good push.

Righting a vehicle is a straight-up Strength Test against a TN of twice the vehicle's size. With all but the smallest vehicle, it's best if multiple people combine their efforts.

A flying vehicle that flips over starts falling, but it may attempt to right itself before it crashes into the ground. This requires a Control Test made as a Half Action by the pilot, with a TN equal to the vehicle's Size. If it succeeds, the pilot rights the vehicle and might even manage to miss the ground.

---

## Vehicle Critical Damage

| d10 | Effect                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The vehicle's paint job is ruined. It suffers no adverse effects                                                                             |
| 2   | The vehicle takes a staggering blow. Its Momentum is reduced by 1 (to a minimum of 0)                                                        |
| 3   | The pilot gets shaken up. They may only take a half action on their next turn                                                                |
| 4   | The vehicle goes Out of Control                                                                                                              |
| 5   | The vehicle's motive system takes a direct hit. Its Momentum is reduced by 3 and its maximum Momentum is reduced by 1 until repairs are made |
| 6   | The pilot takes a hit, from power surges, direct fire through the cockpit, or whatever else is appropriate. The pilot loses `1k1` Hit Points   |
| 7   | One of the vehicle's systems, determined randomly, cannot be used until repairs are made. Control Systems cannot be disabled in this way     |
| 8   | The vehicle Crashes                                                                                                                          |
| 9   | The cockpit breaches. The vehicle loses environmental seals, and the pilot loses `3k1` Hit Points                                              |
| 10  | Roll twice and apply both results, ignoring further results of 10                                                                            |

---

## Untrained Piloting

While certainly not recommended, it's possible for a character who is totally untrained in a vehicle's Control Skill to end up behind the wheel. Even in this situation, the character can make a valiant effort to try to avoid crashing.

For a pilot who does not have any ranks in the vehicle's Control Skill, using the Maintain Control action becomes a Full Action that is made as a base characteristic test using the worse of the pilot's Dexterity or Intelligence.

---

## Vehicles and Damage

Vehicles treat damage like everything else does - when an attack's damage exceeds its size, it loses one or more Hit Points. The main difference for a vehicle is that they don't take critical damage like living beings - when a vehicle goes to 0 Hit Points, it is destroyed. Anyone inside the vehicle at the time might want to get out.

People attempting to flee an exploding vehicle make an Acrobatics + Dexterity Test against a TN equal to the damage the vehicle suffered in the fatal blow. On a success, the people get out safely. On a failure, they get caught in the wreckage and take damage equal to that of the vehicle's death blow (armor and other sources that reduce damage from physical attacks reduce this damage normally).

Vehicles do, though, suffer from their own form of critical damage. An attack that makes a vehicle lose only a single Hit Point is called a **Glancing Blow** - the attack might have shredded some armor or scratched the paint pretty badly, but it didn't destroy any vehicle systems. On the other hand, when an attack makes a vehicle lose two or more Hit Points, that means it's a **Penetrating Blow** and the vehicle suffers critical damage. Roll 1d10 on the Vehicle Crit Damage chart.

### Repairing Vehicles

Vehicles don't (normally) heal on their own. The size of a vehicle directly correlates to how long it takes to repair it - it takes the vehicle's Size in hours to repair one Hit Point worth of damage. Multiple people working at once can reduce this. For every doubling of manpower, the effective Size of the vehicle for determining repair time is reduced by 1 (to a minimum of half the vehicle's actual Size). Large vehicles often have a hundred crew members or more on standby to repair or refit them.

If one or more of a vehicle's systems becomes disabled, the time to repair it is based on the number of unmodified slots it occupies (miniaturization doesn't help repairs), counting as one Hit Point per slot.

---

## Building a Vehicle

1. Determine Base Stats
2. Choose required components
3. Choose other components

### Step 0: Determine Your Budget

The budget for a vehicle determines how many VP you have to spend on creating your vehicle. There are generally two categories of vehicles; those you can buy with cash and those that are available only through Holdings. While it's entirely possible to buy a light tank or even a fighter jet with cash, the very top end of vehicles, super-heavy units and titans, require serious Backing or personal Wealth to keep up.

**Normal VP Costs**

| VP Budget | Rarity      |
| --------- | ----------- |
| 50        | Common      |
| 100       | Uncommon    |
| 150       | Rare        |
| 200       | Very Rare   |
| 250       | Mythic Rare |

**High VP Costs**

| VP Budget | Holdings   |
| --------- | ---------- |
| 250       | Holdings 1 |
| 300       | Holdings 2 |
| 375       | Holdings 3 |
| 450       | Holdings 4 |
| 550       | Holdings 5 |

### Improving a Vehicle

It's entirely possible to improve a vehicle or buy additional components for it after it is constructed. However, it is a somewhat difficult and lengthy process. The TN to acquire a vehicle component with a Wealth test is:

`TN = 5 + (VP Cost / 2) + (# of Slots)`

After getting a component, it takes about a day of work per slot for it to be installed.

### Step 1: Determine Base Stats

The first step in designing a vehicle is to determine its base stats. The base stats of a vehicle determine its performance. A vehicle's base Speed, Size, Man, and Acc tell you a lot about a vehicle.

### Acceleration

| Acceleration Rating | Cost |
| ------------------- | ---- |
| 0\*                 | 0    |
| 1                   | 5    |
| 2                   | 10   |
| 3                   | 25   |
| 4                   | 50   |
| 5                   | 100  |

\*A vehicle with an Acc of 0 is very difficult to start or stop. Without Push It tests, it cannot accelerate or decelerate at all!

### Size

| Size Rating | Cost      |
| ----------- | --------- |
| 1-10        | 1x Rating |
| 11-20       | 2x Rating |
| 21-30       | 4x Rating |
| 31-40       | 6x Rating |
| 41-50       | 8x Rating |

### Speed

A vehicle's Speed is priced depending on the vehicle's Acc - the two are intricately intertwined. Vehicles with high Speed ratings require extra space for their engines. The minimum Acc for this purpose is 1, even if the vehicle has Acc 0 treat as 1 for these costs.

| Speed Rating | Slots | Cost    |
| ------------ | ----- | ------- |
| 1            | 0     | 1xAcc   |
| 2            | 0     | 2xAcc   |
| 3            | 0     | 3xAcc   |
| 4            | 0     | 4xAcc   |
| 5            | 0     | 5xAcc   |
| 6            | 1     | 6xAcc   |
| 7            | 1     | 7xAcc   |
| 8            | 1     | 8xAcc   |
| 9            | 1     | 9xAcc   |
| 10           | 2     | 10xAcc  |
| 11           | 2     | 12xAcc  |
| 12           | 2     | 15xAcc  |
| 13           | 3     | 20xAcc  |
| 14           | 3     | 25xAcc  |
| 15           | 4     | 30xAcc  |
| 16           | 5     | 40xAcc  |
| 17           | 7     | 50xAcc  |
| 18           | 9     | 60xAcc  |
| 19           | 12    | 80xAcc  |
| 20           | 15    | 100xAcc |

### Maneuver

A vehicle's Maneuverability depends on its size. The larger a vehicle is, the more expensive it becomes to improve. Man can range from -10 to +10.

| Size  | Cost             |
| ----- | ---------------- |
| 1-10  | 10 + Rating      |
| 11-20 | 2x (10 + Rating) |
| 21-30 | 4x (10 + Rating) |
| 31-40 | 6x (10 + Rating) |
| 41-50 | 8x (10 + Rating) |

---

## Step 2: Install Required Components

### Drive-Train

A vehicle's Drive-train tells you a huge amount about it. It's the difference between a motorcycle and a jet-ski, a sports car and a fighter jet, a tank and a battlemech. A vehicle's Drive-train sets the vehicle's Drive Rating and may give it one or more abilities.

### Naval Drive (Rating: 3)

Naval Drives are boats. They're just as old as Wheeled Drives, but it's a bit easier to float a lot of metal than it is to make it roll along the ground.

- **Island Home:** A vehicle with this drive may not leave the water without crashing.
- **Metal Giant:** A vehicle with this drive may reduce the cost of its Size by half. A vehicle with multiple drives loses this ability.

### Tracked Drive (Rating: 3)

Something most cultures come up with at some point, tracked vehicles are significantly better than normal Wheeled vehicles on difficult terrain but with a much lower top speed.

- **Caterpillar:** A vehicle with this drive may ignore movement penalties for difficult terrain, and may turn in place.
- **Tough:** A Tracked unit has an additional 4 Hit Points. A vehicle with multiple drives loses this ability.

### Walker Drive (Rating: 4)

A drive using legs instead of wheels, wings, or treads, the walker drive is best known as a necessary technology for the creation of giant robots, which are much like giant tanks only with a very high center of balance.

- **Leggy:** A vehicle with this drive may move through impassible terrain as though it were merely difficult terrain.
- **AMBAC:** Walker drives may wobble, but when they fall down they can get back up again. Anyone piloting a walker drive may spend a half action to right it from a prone position.

### Wheeled Drive (Rating: 5)

The standard drive for ground vehicles, the wheeled drive has been around for as long as civilization has existed. There are no special rules for this one.

### Hover Drive (Rating: 6)

A drive that is slowly replacing the Wheeled Drive on many worlds, the Hover Drive is just a bit faster, requires less in the way of roads, but handles a bit like a man walking on ice.

- **Rise Above:** A vehicle with this drive is not slowed by difficult terrain, and may drive normally on water.
- **Slide About:** A hover drive is notoriously hard to control. Whenever it takes damage, make a Control Test with a TN equal to the damage taken or else it goes Out Of Control.

### VTOL Drive (Rating: 7, Flying)

One of the more versatile and useful drives available, a VTOL drive is able to move in all three dimensions, unlike most drive trains, and can move slowly or even hover, unlike the faster Aerospace or Scram-jet drives.

### Aerospace Drive (Rating: 15, Flying)

An Aerospace vehicle is one with a very distinctive profile - wings and a need to keep moving lest it fall from the sky. It's one of the fastest drive trains, and doesn't compromise in maneuverability like a Scram-jet.

- **Stalin:** A vehicle with this drive is restricted as to how fast it may go. If the vehicle's Momentum drops below 3 while using this drive, it cannot stay in the air and goes Out of Control.
- **Fragile:** Halve an Aerospace unit's HP (rounding up). If the vehicle has multiple drives, this effect remains constant - its maximum HP value remains halved in all forms.
- **Winged:** The minimum Size of a vehicle with an Aerospace Drive is 7.

### Scram-jet Drive (Rating: 30, Flying)

A scram-jet is the fastest way to fly from one spot to another. However, those two spots had better be in a straight line, because a Scramjet turns as badly as an American car with the power steering lines cut.

- **Super Stalin:** A vehicle with this drive is restricted as to how fast it may go. If the vehicle's momentum drops below 5 while using this drive, it cannot stay in the air and goes Out of Control.
- **Flying Crowbar:** A vehicle with this drive may not make turns as part of the standard Maintain Control action.
- **Big Engines:** The minimum size of a vehicle with a Scram-Jet Drive is 15.

### Multiple Drives

Certain accessories can allow a vehicle to have multiple Drive-trains installed at the same time, taking advantage of the various qualities they have. When switching between different drives, a vehicle uses the Drive Rating and properties of its current Drive until its next turn, at which point it begins using the Drive Rating and properties of its new Drive-train. Certain drive-train effects will remain active in both modes if a vehicle has Multiple Drives.

---

### Control System

A control system is an obvious and necessary part of a vehicle. Without a control system, a vehicle is just a screaming death-trap that goes in wobbly lines and crashes into things.

Control options are internal, external, remote, or autonomous. All internal controls use a cockpit or the COFFIN system. External controls can be dang near anything and are a big savings on space, there's just the little fact that the driver is hanging on to the outside of the vehicle. Remote controls are just like regular controls but located somewhere else and subject to jamming and hacking. Autonomous controls let an A.I. do all the driving and reduce the people to mere passengers.

| Name                  | Slots | Cost |
| --------------------- | ----- | ---- |
| Berserker System      | 1     | 10   |
| Cockpit               | 4     | 5    |
| Alt. Control          | 1     | 10   |
| Basic Equip.          | 0     | 3    |
| Copilot Seat          | 2     | 15   |
| Mobile Trace          | 2     | 20   |
| COFFIN                | 1     | 15   |
| Improved COFFIN       | 2     | 20   |
| Onboard AI            | 2     | 10   |
| Co-processor/2        | 0     | 5    |
| Co-processor/3        | 0     | 10   |
| Co-processor/4        | 1     | 20   |
| Co-processor/5        | 2     | 30   |
| TAPS/1                | 0     | 1    |
| TAPS/2                | 0     | 3    |
| TAPS/3                | 1     | 5    |
| TAPS/4                | 1     | 10   |
| TAPS/5                | 2     | 20   |
| RAM/2                 | 0     | 5    |
| RAM/3                 | 1     | 10   |
| RAM/4                 | 2     | 15   |
| RAM/5                 | 3     | 20   |
| RAM/6                 | 4     | 25   |
| RAM/7                 | 5     | 35   |
| RAM/8                 | 7     | 50   |
| RAM/9                 | 9     | 70   |
| Remote Up-link System | 0     | 5    |

#### Berserker System

A berserker system gives full control over a vehicle to an onboard AI or otherwise cuts the pilot out of the loop. These systems are almost always illegal, because as a necessity of their design they are only designed to kill, without mercy or questions.

**Effect:** As a Half Action or whenever the pilot becomes disabled, the Berserker system can be activated. While active, the Berserker System attempts to approach and attack any enemy it can detect. It has three ranks in any skill or attribute required to pilot the vehicle or make attacks. On each of its turns it will attempt to move closer to and/or fire upon any enemy it can detect. The Berserker System remains active until all enemies are destroyed or the vehicle it is controlling is destroyed.

### Cockpit

It's usually a good idea to have a control system of some kind installed on your vehicle. A standard cockpit has enough space for one person. In larger vehicles this might be more a bridge or a command deck, if space is allocated towards copilots.

**Effect:** A cockpit gives a person somewhere to control a vehicle from. A normal cockpit allows the vehicle's designer to choose between Drive and Pilot as the vehicle's Control Skill. Typically, Drive is used for vehicles that travel on the ground or water, with Pilot being used for flying vehicles.

### Alternate Control Input

Maybe it's just a keyboard, perhaps it's a bunch of wires and levers, maybe the controls are a bunch of trained hamsters wired into the read-outs, it could be mystic runes you have to hum to. Whatever it is it's a distinctly non-standard control set-up.

**Effect:** By installing an Alternate Control Input, you can change a vehicle's control skill to one of the following: Acrobatics, Arcana, Animal Ken, Athletics, Performer, or Tech-Use.

### Basic Equipment

The basic equipment package includes the sundry features and equipment one would expect in a cockpit. Headlights, a radio, air conditioning, seat-belts, and cup holders.

**Effect:** Without this you've got all the cockpit amenities of a WW I biplane. The windows don't roll down, there's no radio, and you'll be backing up without rear-view mirrors.

### Copilot Seat

Adding a Copilot Seat lets additional people help you control the vehicle. Copilot Seats are assigned vehicle systems, such as weapons, sensors, afterburners, and so forth.

**Effect:** The Copilot may spend Half Actions and Full Actions every turn to activate any vehicle systems assigned to them. While they're controlling a system nobody else can use that system.

### Mobile Trace

This system allows a vehicle to follow the exact movements of its pilot. It is usually installed on vehicles with manipulator arms, a Walker drive-train, or both. When used by an experienced warrior, it can improve the combat ability of a vehicle more than almost any other system.

**Effect:** The pilot may use Trick Shots and Special Attacks with the weapons installed on the vehicle.

### COFFIN

A control system that works by direct input from the pilot's brain, the COFFIN system completely isolates the pilot from the world. A COFFIN control system eliminates the normal cockpit, and the pilot instead views the world from screens around them or a direct neural interface with the machine itself. A pilot must have a Mind Impulse Unit to use a COFFIN system.

**Effect:** With a MIU interface, the pilot has an instinctive, subconscious level of control over her vehicle. The pilot gains one additional Reaction per turn to use with her vehicle.

**Improved COFFIN:** The Improved COFFIN interface grants the pilot one additional reroll to use with any vehicle action.

### Onboard AI

An expensive option that nonetheless greatly improves a vehicle, an Onboard AI gives an advanced computer system partial control over a vehicle. There are many varieties and styles of AI. Some appear as animated avatars and provide commentary, others are simply built into the systems and silently assist people as a ghost in the machine.

**Effect:** The AI has three effects:

1. It may use the Aid Another action to assist someone onboard with any test once per round.
2. It has a number of stored Half Actions which it may use, one per turn, to operate any vehicle systems that nobody else is or has used on that turn. These Half Actions are replenished at the beginning of the next scene.
3. If the pilot is disabled, the Onboard AI may make a basic Half Action Maintain Control test every round (this represents the AI's basic ability to drive the vehicle from point A to point B, anything else requires the AI to use its stored Half Actions), though its capabilities are significantly less than a dedicated Berserker system and most AIs will attempt to flee combat if their pilots are disabled.

By default, an Onboard AI has one dot in the vehicle's control skill, Ballistics or Weaponry, and one dot in each Mental and Social characteristic. They can be upgraded with the following modules:

- **Coprocessor:** Coprocessors increase an AI's base characteristics. There are six different Coprocessors, each relating to one of the AI's Mental and Social characteristics. They are purchased and increased separately.
- **TAPS Integrated Chip:** TAPS chips are used to give an AI access to an archive of skills. Each TAPS chip relates to any one skill. The AI's skills are set to that of the TAPS chips installed.
- **RAM Array:** The RAM array sets the number of Half Actions the AI has to spend per scene. The basic Onboard AI has a RAM Array of 1.

### Remote Up-link System

A remote up-link system allows a vehicle's systems to be controlled from a remote location. Most vehicles that have this system have a dedicated console in a secure place, though some have portable controls that allow a pilot to control it like a giant RC vehicle.

**Effect:** The vehicle's systems can be activated remotely. A Remote Up-link System can be attached to the Pilot's controls or any Copilot's controls (if any exist). Anyone at the remote controls may use a Full Action to take a Half Action for the vehicle. If the controls are used for a Copilot's station, that copilot cannot activate the copilot station's systems. If used on the Pilot's station, the Pilot may only use a single Half Action for vehicle actions this turn.

---

### Armor

| Name                    | Slots | Cost |
| ----------------------- | ----- | ---- |
| **Standard Armor**      | —     | —    |
| Thick Paint             | 1     | 2    |
| Light                   | 2     | 8    |
| Heavy                   | 4     | 12   |
| **Hardened Armor**      | —     | —    |
| Light                   | 1     | 16   |
| Medium                  | 2     | 24   |
| Heavy                   | 4     | 50   |
| **Ferro-Fibrous Armor** | —     | —    |
| Light                   | 3     | 4    |
| Medium                  | 6     | 6    |
| Heavy                   | 8     | 25   |
| **Hexagrammatic Wards** | —     | —    |
| Light                   | 1     | 10   |
| Medium                  | 2     | 20   |
| Heavy                   | 4     | 40   |

\*If a vehicle has multiple armor systems installed, they overlap, not stack — use only the best rating available.

### Standard Armor

An Armored vehicle has, well, armor. Standard vehicle armor is steel, armorplas, or the like. It's the least expensive vehicle armor option, offering the best protection for the cost.

**Effect:** Choose an armor grade.

- Thick Paint - The vehicle gains Armor 2
- Light Armor - The vehicle gains Armor 5
- Heavy Armor - The vehicle gains Armor 10

### Hardened Armor

While normal armor is good for civilian vehicles, it isn't nearly as tough as what a military can roll out. Hardened armor is heavier and somewhat more bulky than the standard armor, but offers much better protection without taking up as much space as Ferro-Fibrous armor.

**Effect:** Choose an armor grade.

- Light Armor - The vehicle gains Armor 5
- Medium Armor - The vehicle gains Armor 10
- Heavy Armor - The vehicle gains Armor 20

### Ferro-Fibrous Armor

Ferro-Fibrous Armor is manufactured in zero-gravity. Designed to be strong, lightweight, and durable, it uses titanium and trace amounts of mithril woven into layered blankets and set into plates of armor. This makes Ferro-Fibrous Armor bulky, but very protective.

**Effect:** Choose an armor grade.

- Light Armor - The vehicle gains Armor 5
- Medium Armor - The vehicle gains Armor 10
- Heavy Armor - The vehicle gains Armor 20

### Hexagrammatic Wards

Hexagrammatic wards are commonly used to control or impede flows of magic. While individually they are too weak to protect an entire vehicle, an array of them can be carved into a vehicle to provide passive magical shielding. The runes are often quite obvious even from a distance, pulsing and flowing as ambient magical energies cause the wards to glow.

**Effect:** Choose a grade of wards.

- Light Wards - The vehicle gains Aura 5
- Medium Wards - The vehicle gains Aura 10
- Heavy Wards - The vehicle gains Aura 20

---

## Step 3: Choose Other Components

### Accommodations

| Name                    | Slots | Cost |
| ----------------------- | ----- | ---- |
| Cargo Space             | 1     | 1    |
| Passenger Space         | 2     | 2    |
| Modular Cargo/Passenger | 2     | 5    |
| Luxury Accommodations   | 5     | 10   |
| Hidden Compartment      | 1     | 5    |

#### Cargo Space

One of the easiest things to add to a vehicle, cargo space is simply an empty space to store things in. Most cargo spaces are enclosed and have points to attach cables to tie down larger objects.

**Effect:** You gain the listed amount of cargo space for every point you spend on Cargo space, depending on the vehicle's size.

- Normal Size: 2 cubic meters
- Large Size: 5 cubic meters
- Enormous Size: 10 cubic meters
- Colossus Size: 25 cubic meters
- Titanic Size: 50 cubic meters

### Passenger Space

Many vehicles are designed to carry more than one person. Cars, buses, commercial aircraft, and so forth. Passenger Space represents basic built-in seating capacity.

**Effect:** The vehicle can comfortably and safely carry a passenger. Every time you buy this component, double the number of passengers your vehicle may carry (1, 2, 4, 8, etc). You should not allocate more than half of the vehicle's slots to passengers.

### Modular Cargo/Passenger Space

Someone noticed that fold-up seats and cargo tie-downs could be used together. Thus modular spaces that could be quickly changed between cargo and passengers were created.

**Effect:** Determine how much cargo and how many people can be carried as though you were using regular cargo and passenger space. You can split that capacity 50/50 or by any other ratio you like. It takes about one hour to change the configuration.

### Luxury Accommodations

Where the normal Passenger Space is simply sitting people down inside a cabin and strapping them in, Luxury Accommodations are considerably more comfortable. Luxury Accommodations often include separate compartments or sleeping spaces.

**Effect:** This works just like the regular passenger spaces but it's nice and luxurious.

### Hidden Compartment

Occasionally, you don't want people to know what you're hauling. Maybe it's a hidden weapon on the ship, an illegal cloaking system, or cargo space reserved for items that the authorities wouldn't be happy to see.

**Effect:** Hidden Compartment is added to another component of the vehicle. That component cannot be scanned from outside the vehicle. It appears as power couplings, empty space, or whatever seems most plausible for the item.

---

### Accessories

| Name                          | Slots | Cost |
| ----------------------------- | ----- | ---- |
| Afterburners                  | 2     | 15   |
| Composite Frame               | 0     | 5    |
| ECM                           | 2     | 15   |
| Ejector Seat                  | 1     | 10   |
| Environmental Seals           | 0     | 5    |
| Features                      | 0     | 5    |
| Jump Jets (Standard)          | 2     | 10   |
| Jump Jets (Improved)          | 4     | 25   |
| Manipulator Arms              | 3     | 15   |
| Manipulator Arms Str +1       | 1     | 5    |
| Orgone Antennae (Basic)       | 2     | 15   |
| Orgone Antennae (+`1k1` damage) | 4     | 25   |
| Orgone Antennae (+`2k2` damage) | 6     | 40   |
| Partial Wing (2)              | 1     | 5    |
| Partial Wing (4)              | 3     | 15   |
| Partial Wing (6)              | 5     | 25   |
| Reinforced Frame              | 0     | 5    |
| Sensor System (Standard)      | 1     | 10   |
| Sensor System (Advanced)      | 2     | 20   |
| Thermoptic Camo               | 2     | 25   |
| Void Shield (Rating 10)       | 4     | 15   |
| Void Shield (Rating 15)       | 7     | 30   |
| Void Shield (Rating 20)       | 10    | 60   |
| Weapon Mount (Personal)       | 1     | 5    |
| Weapon Mount (Vehicle)        | X     | X    |
| Omni Mount                    | 0     | 5    |
| Turret Mount                  | 1     | 10   |
| Arm Mount                     | 0     | 5    |

#### Afterburners

One of the more common additions to racers and high-performance aerospace craft, Afterburners provide a short burst of extra speed. Afterburners have their own supply of fuel, and can be used a limited number of times before that fuel is used up.

**Effect:** You may spend a Half Action to activate the afterburners before making your Maintain Control test. Your ship's Speed is doubled until the end of your next turn. You may use this boost once for every time you purchase Afterburners.

### Composite Frame

Using a base frame made of advanced composites of ceramics, plastics, and metal fibers means that a vehicle is made lighter and easier to maneuver. However, this comes at the price of fragility.

**Effect:** The vehicle gains +3 Man, but its maximum HP is reduced by 3.

### ECM

An ECM is an active defense measure that is designed to protect a vehicle against the sensors of enemies by blinding and confusing them. An ECM is not stealth - it's obvious to everyone when ECM is used because it is supposed to be deafening and blinding to sensors.

**Effect:** The pilot may turn the ECM on or off as a Half Action. While ECM is active, the vehicle cannot be tracked by long range sensors like radar or lidar, but the disruption is obvious to those sensors, even if they cannot find the source of the disturbance.

### Ejector Seat

Bailing out of a vehicle as it's being destroyed is typically not an easy thing, given the fire and explosions involved. With an Ejector Seat, getting away is a certainty.

**Effect:** The pilot and any copilots are automatically ejected from a destroyed vehicle. The Ejector Seat will send the pilot 100m away from the vehicle and not in its direction of travel. If the pilot hits something strong enough to stop it like a wall, another vehicle, etc., while ejecting, the ejector seat stops and the pilot takes damage as if they had fallen the remaining distance.

#### Environmental Seals

By default, vehicles are not airtight. They're vulnerable to alien atmospheres, they let water in if they're submerged, and will otherwise leak air and liquids. With Environmental Seals, the vehicle doesn't need to worry about such things.

**Effect:** The vehicle is pressurized, sealed, and carries its own atmosphere. It ignores difficulties from alien atmosphere and it doesn't fill up with water when submerged. The pilot and any passengers are immune to gas attacks from outside the vehicle.

#### Features

Any number of things can be a feature. They're miscellaneous advantages that grant useful, but minor, abilities. This might be an anti-theft alarm, cameras, emergency lights, a place to recharge power packs, radar detector, searchlights, tow cables, and anything else that seems useful but has few, if any, mechanical effects.

**Effect:** The vehicle gains a feature. This feature may be almost anything, but should only be able to give a small bonus (+`1k0`) in certain circumstances. Features should never be more important than dedicated equipment.

#### Jump Jets

Putting jump jets on a vehicle is one easy way to get it in the air, at least for a little while. Jump jets can be found on nearly every vehicle save those that already fly.

**Effect:** If you spend a half action activating the Jump Jets, the Vehicle gains Flying until your next turn. Jump Jets require two rounds to reset and cool off between uses. Improved Jump Jets require only one round between jumps.

#### Manipulator Arms

Arms! Big, beefy arms! While vehicles with legs are the ones most commonly seen with Manipulator Arms, any vehicle can mount arms.

**Effect:** Your vehicle gains manipulator arms. These arms can be used to do just about anything a normal set of arms can, and allow the vehicle to wield vehicle-scale Melee weapons. Manipulator arms are generally not designed to interact with anything small or delicate and might be unable to use items designed for normal character use, at the SM's discretion. By default, these arms have Strength 6. This strength may be increased, at the cost listed above, up to a maximum of 10.

#### Orgone Antennae

Magic has a strong place on any modern battlefield. With this device, onboard wizards can maximize the power of their spells beyond anything they could manage on their own.

**Effect:** The pilot (actually this is usually assigned to a copilot) may cast spells through the vehicle. If the spell would affect the caster, it instead provides its bonuses to the vehicle (if appropriate). The improved versions give damaging spells cast through the Orgone Antennae a bonus to their damage rolls.

#### Partial Wing

Canards, a spoiler, whatever. Extra aerodynamic surfaces rarely hurt a vehicle. A partial wing improves maneuverability, especially at high speeds.

**Effect:** The Momentum penalty to Man is reduced by 2, 4, or 6, depending on the wing purchased, to a minimum of 0.

#### Reinforced Frame

Where a composite frame is lighter and faster, it can be equally valuable to have a frame that can roll with the punches and survive a hefty beating.

**Effect:** The vehicle gains +3 to its maximum Hit Points, but takes -3 to Maneuver.

#### Sensor System

Without a sensor system of some kind, a vehicle's pilot must rely on windows and her own eyes. With a sensor system pilots can see and hear things beyond their limited senses.

**Effect:** Choose between Standard and Advanced sensors.

- **Standard** - The pilot gets +`1k0` to all Perception tests and automatically detects any vehicle or ship not using ECM within 10km.
- **Advanced** - The pilot gets +`1k1` to all Perception tests and automatically detects any vehicle or ship not using ECM within 20km.

#### Thermoptic Camo

Active Camouflage is hard to produce on a small scale, and it becomes easier the more flat, rigid surfaces something has. Thermoptic camo doesn't do anything to protect against radar or other sensors, but it does make the vehicle all but invisible to casual inspection.

**Effect:** You may make Stealth rolls for the vehicle using Stealth + your choice of Dexterity or Intelligence, as if someone had cast the Invisibility spell on it. This uses all the normal rules for Stealth.

#### Void Shield

A Void Shield system is one of the most expensive and powerful things you can install on a vehicle. Normally, energy shields can only be installed on ships and similarly large structures, so miniaturizing the systems to fit into a vehicle is expensive.

**Effect:** A vehicle with a void shield is all but invulnerable to conventional attack. While the void shield can be bypassed with melee attacks, ranged attacks that have a Penetration less than the vehicle's Void Shield rating are totally negated, unless the ranged attack is made by a unit with a Void Shield of its own.

#### Weapon Mount

Most military vehicles, and quite a few civilian ones, have mounts for weapons. These mounts can hold normal weapons or special vehicle-only weapons.

**Effect:** The pilot can use the mounted weapon to attack. The weapon can fire into one general arc from the vehicle (forward, behind, above, to the left, etc., about 120 degrees). A weapon mounted in this way cannot be removed. Note that the cost for the weapon mount does not include the cost for the weapon.

- **Personal Mount** - A Personal Mount can hold any man-portable weapon. Usually, they are used to mount heavy weapons to a vehicle for anti-personnel use.
- **Vehicle Mount** - This heavier type of mount can hold a vehicle-only weapon such as a cannon or other super-heavy weapon. The number of slots and cost depend on the weapon mounted.
- **Omni Mount** - An add-on for a Personal or Vehicle mount, an Omni mounting allows the attached weapon to be swapped out easily. It takes only an hour of work for a weapon in an Omni Mount to be changed.
- **Turreted Mount** - It's a turret. This is another add-on for a weapon or a group of weapons. It allows the vehicle to fire everywhere except in one specific arc (about 180 degrees).
- **Arm Mount** - For a trivial price you can attach a weapon to one of the vehicle's arms, if it has any. You can ignore all that arc stuff and shoot any direction, but the vehicle has to have Manipulator Arms.

---

### Reactor

| Name                             | Slots | Cost |
| -------------------------------- | ----- | ---- |
| Overcharged Reactor              | 1     | 10   |
| Super Solenoid Engine (Rating 1) | 0     | 15   |
| Super Solenoid Engine (Rating 2) | 1     | 25   |
| Super Solenoid Engine (Rating 3) | 2     | 35   |
| XL Engine (Rating 1)             | 2     | 10   |
| XL Engine (Rating 2)             | 4     | 20   |
| XL Engine (Rating 3)             | 6     | 30   |
| XL Engine (Rating 4)             | 8     | 40   |
| XL Engine (Rating 5)             | 10    | 50   |

#### Overcharged Reactor

An overcharged reactor is almost more of a liability than anything else. It's simply an engine with almost all of the safeties ripped out. This allows a pilot to blast a vehicle all the way to top speed in an instant, as long as they don't mind breaking some very important things.

**Effect:** The Pilot may spend a half action to activate the Overcharged Reactor. The vehicle's Hit Points are reduced by a quarter of its full amount (rounded up). Its Mom becomes 10.

#### Super Solenoid Engine

A Super Solenoid Engine is a theoretical engine design that utilizes ambient magical energy and a deep understanding of the theoretical underpinning of the physics of the Warp in order to create a permanently self-sustaining reaction. The S2 engine can create an infinite amount of energy, though its output at any one point is limited by the size of the engine.

**Effect:** The pilot of a vehicle with an S2 engine may activate or deactivate it as a half action. While the S2 Engine is active, the vehicle gains a bonus equal to the Engine's rating to its Speed, Man, and Acc. The pilot rolls a Warp Phenomenon test at the end of any round where the S2 Engine was active, with +10 on the roll per the engine's rating.

#### XL Engine

From time to time, engineers have experimented with larger engines than the standard models. These Extra-Large engines trade bulk for speed - they can even allow a vehicle to go beyond the normal limits a vehicle has.

**Effect:** A vehicle's XL engine may be rated from 1-5. The vehicle's speed is increased by its XL engine rating, even if it would put the vehicle's rating above the normal limit of 15.

---

### Modifications

| Name              | Slots | Cost |
| ----------------- | ----- | ---- |
| Diver Down        | 3     | 20   |
| Flawed            | 0     | -10  |
| Living Vehicle    | 4     | 5    |
| Macronized        | -     | -    |
| Miniaturized      | -     | -    |
| Open Topped       | 0     | 0    |
| Variable          | 2     | 10   |
| Magnetic Couplers | 1     | 10   |

#### Diver Down

The Diver Down upgrade allows a ground vehicle to burrow underground, or a naval vehicle to act as a submarine.

**Effect:** Choose between Subterranean and Submarine. A vehicle must be Environmentally Sealed in order to take the Diver Down mod.

- **Subterranean** - A subterranean vehicle can burrow through the earth. While using Subterranean movement, a vehicle's maximum momentum is reduced to 5. It can burrow through earth and stone equally well, though some material, like buried armor plating, deposits of extremely hard stone, and so forth might slow or stop it entirely, at the SM's discretion.
- **Submarine** - A submarine vehicle can travel underwater. This does not impede its top speed.

#### Flawed

A Flawed vehicle has one or more problems with its design. Flawed vehicles are significantly less expensive than a vehicle without such problems, and might represent cutting corners in the design process, using substandard materials, and whatever else might be used as a cost-cutting measure.

**Effect:** Choose one of the following flaws. This may be taken multiple times, choosing a different flaw each time.

- **External Power** - The vehicle relies on an external source of power. If the power is beamed in, it must remain within line of sight to its power supply. If it is wire-fed, the pilot must make a TN 15 Control Test every round to avoid snagging the cable. If the cable becomes snagged or the vehicle leaves line of sight of its power supply, roll a d10. The pilot may take this many half actions before the vehicle loses power and Crashes.
- **Feedback** - The pilot is prone to suffering feedback from her vehicle. Whenever the vehicle takes damage, the pilot must make an Athletics + Constitution test against TN 15 or else gain a level of fatigue.
- **Fragile** - The vehicle's maximum Hit Points are reduced by 25%, rounded up.
- **Hangar Queen** - The vehicle requires maintenance after every sortie. This takes as long as the vehicle was deployed, plus an additional eight hours.
- **Inefficient Controls** - Whenever the pilot makes a Maintain Control test, she must spend an additional Half Action or Reaction Action to keep the vehicle doing what she wants.
- **Junker** - The vehicle's systems are ready to fall apart. Whenever the vehicle suffers damage, roll twice on the critical chart and take the worse result.
- **Overheating** - The vehicle is prone to overheating. It loses 1 HP every round in which its Momentum is above 6 or the driver uses the Push It action.
- **Unstable** - Double this vehicle's Man penalty due to Momentum.

#### Living Vehicle

A living vehicle is, well, alive. This has both benefits and drawbacks.

**Effect:** The vehicle heals 1 HP per day, benefits from Healing magic if it has an Orgone Antenna attachment, and it can self-right from a prone position.

#### Macronized

A Macronized component uses larger and less expensive parts.

**Effect:** Apply the modification to a component in the vehicle. The component's cost is cut in half (rounding up) and its size is doubled. Applying this to the same component multiple times doubles its size every time.

#### Miniaturized

A Miniaturized component uses smaller and more expensive parts.

**Effect:** Apply the modification to a component in the vehicle. The component's size is cut in half (rounding up) and its cost is doubled. You may apply this to the same component multiple times, doubling its new cost every time. Passenger and cargo space can only be miniaturized once.

#### Open Topped

Vehicles with firing ports, lacking a roof, or otherwise open to the elements.

**Effect:** The vehicle does not block line of sight to and from its crew and passengers, allowing them to use their personal weapons to make attacks, and to be targeted and attacked in turn. It cannot be environmentally sealed.

#### Variable

A Variable vehicle has more than one drive-train. One of the more popular variable drive-trains is to switch between a flying movement type and one that goes on the ground, especially a Walker drive.

**Effect:** The vehicle gains an additional drive-train type. This modification may be taken multiple times, choosing a new drive-train each time. The pilot must spend a Half Action to switch between drives.

**Magnetic Couplers** - With magnetic couplers, it takes only a Reaction Action to switch between drive-trains.

---

## Vehicle Weapons

### Ranged Vehicle Weapons

| Name                        | Damage  | Type | Pen | RoF  | Range | Size | Cost | Special                      |
| --------------------------- | ------- | ---- | --- | ---- | ----- | ---- | ---- | ---------------------------- |
| **Autocannon (Ordinary)**   | —       | —    | —   | —    | —     | —    | —    | —                            |
| AC/5                        | `4k2`+10  | I    | 0   | S/-  | 250m  | 2    | 15   | —                            |
| AC/10                       | `5k2`+15  | I    | 5   | S/-  | 200m  | 3    | 20   | —                            |
| AC/15                       | `6k3`+15  | I    | 10  | S/-  | 150m  | 4    | 25   | —                            |
| AC/20                       | `7k4`+20  | I    | 15  | S/-  | 100m  | 5    | 30   | —                            |
| Hyper Velocity AC/5         | `2k2`+15  | R    | 5   | S/-  | 450m  | 2    | 20   | —                            |
| Hyper Velocity AC/10        | `3k2`+20  | R    | 10  | S/-  | 350m  | 3    | 25   | —                            |
| Hyper Velocity AC/15        | `4k3`+25  | R    | 15  | S/-  | 250m  | 4    | 30   | —                            |
| Hyper Velocity AC/20        | `5k4`+30  | R    | 20  | S/-  | 150m  | 5    | 35   | —                            |
| Ultra AC/5                  | `4k2`+10  | I    | 0   | -/3  | 250m  | 2    | 20   | —                            |
| Ultra AC/10                 | `5k2`+15  | I    | 5   | -/3  | 200m  | 3    | 25   | —                            |
| Ultra AC/15                 | `6k3`+15  | I    | 10  | -/3  | 150m  | 4    | 30   | —                            |
| Ultra AC/20                 | `7k4`+20  | I    | 15  | -/3  | 100m  | 5    | 35   | —                            |
| **Punisher Gatling Cannon** | —       | —    | —   | —    | —     | —    | —    | —                            |
| Light                       | `3k2`+5   | I    | 0   | -/10 | 100m  | 2    | 15   | —                            |
| Heavy                       | `4k3`+10  | I    | 5   | -/8  | 80m   | 3    | 20   | —                            |
| **Railgun**                 | —       | —    | —   | —    | —     | —    | —    | —                            |
| Railgun                     | `4k3`+15  | R    | 10  | S/-  | 500m  | 4    | 25   | Accurate, Reliable           |
| Heavy Railgun               | `6k4`+15  | R    | 10  | S/-  | 300m  | 5    | 30   | Accurate                     |
| Hyper Assault Gauss         | `4k3`+15  | X    | 10  | S/8  | 100m  | 4    | 25   | —                            |
| **Las Weapons**             | —       | —    | —   | —    | —     | —    | —    | —                            |
| Multilas                    | `3k2`+5   | E    | 0   | S/9  | 60m   | 2    | 10   | Reliable                     |
| Blazer                      | `4k3`+10  | E    | 5   | S/-  | 100m  | 3    | 15   | Twin-Linked, Reliable        |
| Bombast Laser               | `4k3`+10  | E    | 5   | S/-  | 100m  | 4    | 15   | Bi-Modal, Reliable           |
| Bombast (Bi-modal)          | `6k4`+10  | E    | 10  | S/-  | 150m  | -    | -    | Bi-Modal, Recharge           |
| Lascannon                   | `5k5`     | E    | 10  | S/-  | 300m  | 3    | 15   | Recharge                     |
| **Plasma, Melta, & Flame**  | —       | —    | —   | —    | —     | —    | —    | —                            |
| Plasma Destroyer            | `4k3`+20  | E    | 15  | S/-  | 100m  | 4    | 15   | Recharge                     |
| Mega-Melta                  | `5k3`+20  | E    | 15  | S/-  | 50m   | 4    | 25   | Twin-Linked                  |
| Inferno Cannon              | `4k2`+10  | E    | 5   | S/-  | 40m   | 2    | 10   | Flame                        |
| **Bolter**                  | —       | —    | —   | —    | —     | —    | —    | —                            |
| Vulcan Mega-Bolter          | `6k2`+15  | X    | 10  | S/6  | 120m  | 4    | 25   | Tearing                      |
| Hurricane Bolter            | `4k2`+5   | X    | 8   | -/10 | 120m  | 3    | 20   | Tearing, Storm               |
| **Syrneth**                 | —       | —    | —   | —    | —     | —    | —    | —                            |
| M-Wave Cannon               | `7k4`+35  | E    | 20  | S/-  | 500m  | 10   | 30   | Accurate, Blast(5), Recharge |
| Dimensional Rift Cannon     | `4k2`+10  | E    | 20  | S/3  | 20m   | 2    | 20   | Storm                        |
| **Exotic**                  | —       | —    | —   | —    | —     | —    | —    | —                            |
| Particle Projection Cannon  | `5k2`+15  | E    | 5   | S/-  | 350m  | 3    | 20   | —                            |
| Mega Particle Cannon        | `7k4`+25  | E    | 15  | S/-  | 250m  | 7    | 25   | Recharge                     |
| **Primitive**               | —       | —    | —   | —    | —     | —    | —    | —                            |
| Catapult                    | `4k1`+15  | I    | 0   | S/-  | 150m  | 4    | 5    | Indirect, Minimum Range      |
| Ballista                    | `3k1`+10  | R    | 2   | S/-  | 100m  | 3    | 5    | Reliable                     |
| **Missile Launchers**       | —       | —    | —   | —    | —     | —    | —    | —                            |
| LRM                         | `3k2`+15  | X    | 5   | S/-  | 500m  | 3    | 15   | Homing, Minimum Range        |
| LRM-Swarm                   | `4k3`+15  | X    | 5   | S/-  | 500m  | 4    | 20   | Blast(10), Minimum Range     |
| SRM                         | `4k2`+15  | X    | 5   | S/-  | 100m  | 2    | 15   | —                            |
| Tandem Charge SRM           | `3k3`+15  | X    | 10  | S/-  | 100m  | 3    | 20   | Tandem Charge                |
| Arrow IV Artillery          | `7k4`+35  | X    | 20  | S/-  | 500m  | 10   | 35   | Indirect, Minimum Range      |
| Arrow IV MIRV               | `10k5`+20 | X    | 10  | S/-  | 500m  | 10   | 35   | Blast(30), Minimum Range     |
| Arrow IV Homing             | `7k4`+35  | X    | 20  | S/-  | 1000m | 11   | 35   | Homing, Minimum Range        |

### Weapon Descriptions

**Autocannon:** The simplest and most common vehicle weapon, firing large shells from an automatically loaded internal magazine.

- **HV ACs:** Longer barrels firing APDS ammo at higher velocity, providing incredible range with improved armor penetration.
- **Ultra ACs:** Multiple rotating barrels able to rapid-fire shells of surprising size.

**Punisher Gatling Cannon:** Six small, short-barreled autocannons using a rotating frame for full-auto fire. Effective against lightly armored vehicles and large biological targets.

**Railgun:** Uses magnets to accelerate a slug of metal to supersonic speeds. Excellent range and power, ideal as sniper weapons.

- **HAG (Hyper-Assault Gauss):** Fires explosive sub-munitions instead of a single slug.

**Multilas:** A laser weapon using rapid-fire pulses. Powerful for anti-infantry operations.

**Blazer (Binary Laser):** Two heavy lasers fused into one weapon.

**Bombast Laser:** Designed to be the ultimate laser weapon, but compromised with slow recharge. May be fired in minimal mode (standard stats) or maximal mode (Bi-Modal line stats).

**Lascannon:** A formidable Laser Weapon capable of penetrating most armored vehicles.

**Plasma Destroyer:** Throws hot globs of plasma at a target with devastating, armor-melting effect.

**Mega-Melta:** A series of melta weapons firing in parallel. Targets are melted away, turning creatures into piles of ash and vehicles into pools of molten metal.

**Inferno Cannon:** A scaled-up Flamer. Mostly used for terror rather than real military actions.

**Vulcan Mega-Bolter:** Heavy caliber rotating bolt gun capable of firing shells at a high rate. Designed to fight mid-range armored vehicles.

**Hurricane Bolter:** A number of Boltguns mounted co-axially into a single weapon turret. A premier anti-infantry weapon.

**Wave Motion Cannon (M-Wave):** Among the most powerful weapons that can be mounted on a vehicle. A miniaturized lance battery that can actually damage a starship.

**Dimensional Rift Cannon:** An ancient Syrneth weapon that opens micro-portals in the Warp, allowing chaotic matter and energy to seep through. Ignores most armor.

**PPC (Particle Projection Cannon):** Throws a beam of neutrally-charged massive particles at near-C. Common on high-performance military units.

**Mega Particle Cannon:** A larger, more powerful version of a PPC with nearly twice the power output of a similar laser unit.

**Catapult:** A primitive weapon that slings large rocks. Cannot strike targets at Short range.

**Ballista:** A scaled-up crossbow firing huge arrows.

**LRM (Long Range Missile):** Fires missiles out to extreme range. One of the most accurate weapons for inexperienced pilots due to internal homing devices. Cannot fire at Short range or less.

- **Swarm:** Launches several unguided LRMs in a spread pattern. Less accurate against individuals but more damaging against groups.

**SRM (Short Range Missile):** Direct-fire missiles that sacrifice range for hitting power.

- **Tandem Charge SRM:** Has two warheads. All Glancing Blows are upgraded to Penetrating Hits.

**Arrow IV:** A stand-alone missile-based artillery system. One of the few vehicular weapons with damage high enough to threaten starships. Cannot fire at Short range or less.

- **MIRV Missile:** Releases sub-munitions over a target zone. Gains Blast(30) but loses the ability to fire over obstacles.
- **Homing Missile:** Advanced target acquisition system for accurate targeting.

### Melee Vehicle Weapons

| Name       | Damage | Type | Pen | Size | Cost | Special             |
| ---------- | ------ | ---- | --- | ---- | ---- | ------------------- |
| Ordinary   | `1k2`+20 | I/R  | 5   | 2    | 5    | Parrying            |
| Parrying   | `1k1`+15 | R    | 10  | 1    | 10   | Balanced            |
| Cavalry    | `1k3`+20 | R    | 15  | 2    | 10   | Reach, Unbalanced   |
| Flail      | `0k2`+25 | I    | 5   | 2    | 10   | Flexible            |
| Fencing    | `1k2`+20 | R    | 10  | 2    | 10   | Balanced            |
| Two Handed | `1k4`+20 | I/R  | 5   | 2    | 10   | Unwieldy            |
| Syrneth    | `3k2`+20 | E/R  | 20  | 2    | 15   | —                   |
| Chain      | `1k2`+25 | R    | 5   | 2    | 10   | Tearing             |
| Shield     | `0k2`+25 | I    | 5   | 2    | 10   | Balanced, Defensive |
| Unarmed    | `0k1`+15 | I    | 5   | 1    | 5    | —                   |

Rarely seen on anything that isn't a mecha, vehicle-scale melee weapons are all essentially the same with only minor differences. To effectively equip a vehicle with a CQC weapon it should have arms. Like all melee weapons, a vehicle's melee attacks add the vehicle's Strength to their damage. If the vehicle lacks arms it can only use a CQC weapon to add extra damage during a ramming maneuver - roll the weapon's base damage separately and add it to the total damage that the rammed vehicle or object takes.

---

## Sample Vehicles

### Jet-pack

A small civilian model jet-pack.

| Stat           | Value                          |
| -------------- | ------------------------------ |
| Size           | 2 (about 1m high)              |
| Price          | Rare                           |
| HP             | 2                              |
| Resilience     | 2                              |
| Static Defense | 0 / 22 / 28 / 34\*             |
| Maneuver       | +10                            |
| Acceleration   | 3                              |
| Speed          | 6                              |
| Movement       | 36m/momentum (13 kph/momentum) |

**Drive:** VTOL (×6) - May hover and turn in place; begins Falling if it takes 2 or more damage or if it goes Out of Control.

**Control System:** Pilot Seat & Alternate Controls (Acrobatics).

**Open Top:** People can shoot in to & out of the vehicle.

\*Static Defense numbers are for Momentum: 0, 1-5, 6-9, and 10+.

---

### Van

Just a regular van capable of carrying some people or boxes of stuff around town. It does not handle corners well at high speeds.

| Stat           | Value                          |
| -------------- | ------------------------------ |
| Size           | 9 (about 4.5m long)            |
| Price          | Uncommon                       |
| HP             | 9                              |
| Resilience     | 9                              |
| Static Defense | 0 / 12 / 24 / 36\*             |
| Maneuver       | +0                             |
| Acceleration   | 1                              |
| Speed          | 10                             |
| Movement       | 50m/momentum (18 kph/momentum) |

**Drive:** Wheeled (×5) - No special modifications.

**Control System:** Pilot Seat & Basic Equipment - Has seat belts, cup holders, AC, heater, radios, etc.

**Flaws:** Inefficient Controls & Unstable - Requires an extra Half or Reaction action to maintain control. Double the maneuver penalty for momentum.

**Passenger Space:** 1 person.

**Modular Cargo/Passenger Space:** 12 m³ or 8 passengers or any reasonable split.

\*Static Defense numbers are for Momentum: 0, 1-5, 6-9, and 10+.

---

### Atlas Mecha

A big stompy mecha with heat-seeking missiles, full-auto lasers, and a really big gun. Just make sure you can pay for the fuel.

| Stat           | Value                           |
| -------------- | ------------------------------- |
| Size           | 30 (about 35m tall)             |
| Price          | Holdings 3                      |
| HP             | 30                              |
| Resilience     | 30                              |
| Static Defense | 0 / 6 / 12 / 18\*               |
| Maneuver       | +0                              |
| Acceleration   | 1                               |
| Speed          | 6                               |
| Movement       | 24m/momentum (8.6 kph/momentum) |

**Drive:** Walker (×4) - Treats impassible terrain as merely difficult; if flipped over or knocked down it may stand back up as a Half Action.

**Sensors:** Standard Sensors - +5 perception tests and 10km automatic vehicle detection range.

**Control System:** Pilot Seat & Co-Pilot Seat & Basic Equipment & Mobile Trace System - Enables gun kata trick shots and sword school special attacks.

**Flaws:** Controls Feedback & Inefficient Controls - When damaged the vehicle may inflict Fatigue on the pilots. Requires an extra Half or Reaction action to maintain control.

**Environmental Seals:** Airtight & safe.

**Armor:** Heavy Hardened Armor (20 AP)

**Manipulator Arms:** Strength 8

**Weapons:**

- Long Range Missile Launcher (`3k2`+15 X, Pen 5, 500m range, Homing, Minimum Range)
- Short Range Missile Launcher (`4k2`+15 X, Pen 5, 100m range)
- Arm Mount: Multi-Las (`3k2`+5 E, Pen 0, S/9, 60m range, Reliable)
- Arm Mount: AC-20 (`7k4`+20 I, Pen 15, S/-, 100m range)
- Ordinary CQC - Extra Big Fists (`9k2`+20 I, Pen 5)

\*Static Defense numbers are for Momentum: 0, 1-5, 6-9, and 10+.

---

### Variable Advanced Technology Fighter

A basic fighter jet that turns into a giant robot with a gun.

| Stat           | Value                           |
| -------------- | ------------------------------- |
| Size           | 20 (about 15m long/tall)        |
| Price          | Holdings 2                      |
| HP             | 10                              |
| Resilience     | 20                              |
| Static Defense | 0 / 12 / 24 / 36\*              |
| Maneuver       | +2                              |
| Acceleration   | 2                               |
| Speed          | 12                              |
| Movement       | 180m/momentum (65 kph/momentum) |

**Drive:** Aerospace (×15) - Has wings; if Momentum is less than 3 it goes Out of Control and begins Falling; requires a runway of at least base Speed × 100m; begins Falling if it takes 2 or more damage or if it goes Out of Control.

**Other Drive:** Walker (×4) - Treats impassible terrain as merely difficult; if flipped over or knocked down it may stand back up as a half action.

**Control System:** Pilot Seat & Basic Equipment & Mobile Trace System - Enables gun kata trick shots and sword school special attacks.

**Flaws:** Controls Feedback & Hangar Queen - When damaged the vehicle may inflict Fatigue on the pilots & Requires extra repair and reload time.

**Sensors:** +5 to Perception tests and a 10km automatic vehicle detection range.

**Ejector Seat:** Could save your life.

**Environmental Seals:** Airtight & safe.

**Manipulator Arms:** Strength 6.

**Afterburners (1):** Double speed while activated.

**Armor:** Light Hardened Armor (5 AP)

**Weapons:**

- Omni Weapon Mount: Long Range Missile (`3k2`+15 X, Pen 5, 500m range, Homing, Minimum Range)
- Arm Mount: Vulcan Mega Bolter (`6k2`+15 X, Pen 10, S/6, 120m range, Tearing)
- Unarmed CQC - Reinforced Fists (`6k2`+15 I, Pen 5)

\*Static Defense numbers are for Momentum: 0, 1-5, 6-9, and 10+.

---

### Cyborg-Ninja Tyrannosaurus Rex Cocaine-Wizard Pet

Damn cocaine-wizards being all awesome.

| Stat           | Value                                    |
| -------------- | ---------------------------------------- |
| Size           | 19 (about 14m long)                      |
| Price          | Holdings 4                               |
| HP             | 19                                       |
| Resilience     | 19                                       |
| Static Defense | 0 / 0 / 0 / 6 (0 / 0 / 1 / 10)\*         |
| Maneuver       | +10                                      |
| Acceleration   | 3                                        |
| Speed          | 8                                        |
| Movement       | 32(36)m/momentum (11.5(13) kph/momentum) |

> **Calculation Note:** Base SD = 10 + 10 - 38 = -18, clamped to 0. At Mom 10+: -18 + 24 = +6.

**Drive:** Walker (×4) - Treats impassible terrain as merely difficult; if flipped over or knocked down it may stand back up as a half action.

**Control System:** Berserker AI System - Rolls `6k3` for everything & goes on a killing rampage when the primary AI runs out of actions.

**AI Systems:**

- TAPS (3 dots Ballistics)
- TAPS (3 dots Stealth)
- RAM-3 (the AI has 3 Half Actions per scene)
- Co-processor (3 dots Wis)
- Co-processor (2 dots Int)
- The AI will obey orders until it is out of Half Actions, then it will use the Aid Another action on the Berserker AI.

**Super Solenoid Engine:** Activate for +1 to speed, maneuver, acceleration; roll for warp at +10.

**Hexagrammatic Wards:** 5 Aura.

**Armor:** Medium Hardened Armor (10 AP)

**Thermoptic Camo:** Can be almost invisible.

**Manipulator Arms (Jaws):** Strength 9.

**Living Vehicle:** It's ALIVE!

**Weapons:**

- Two Handed Big Teeth (`10k4`+20 R, Pen 5, Unwieldy - cannot parry)
- 2x Short Range Missile (`4k2`+15 X, Pen 5, 100m range)
- 2x Personnel Weapon Mounts: 2x Heavy Bolters (`4k2` X, Pen 8, -/10, 120m range, Tearing, 60 ammo each)

\*Static Defense numbers are for Momentum: 0, 1-5, 6-9, and 10+. Numbers in parentheses show values with S2 Engine active.

---

## Quick & Dirty Vehicle Building Rules

### Building a Vehicle

**Size =** 1/5 passengers (min 1) + 1/5 m³ cargo + 1/5 armor + 1/light weapon (`3k2`+5 p5 50m) + 3/heavy weapon (`5k3`+10 p10 150m) + 6/huge weapon (`7k4`+20 p20 500m) + 1/special electronics/feature + 3/equipment module + 1/4 speed

### Vehicle Properties

**Momentum:** none(0), minimum(1), slow(3), fast(5), maximum(10) — applies as penalty to drive/pilot rolls

**Maneuver:** -10 to +10 — applies to drive & piloting rolls; requires drive test to turn if negative

**Speed:** 0 to 20 (speed 0 requires regular drive tests for all momentum changes)

**Drive Multipliers:**
| Drive Type | Multiplier |
|------------|------------|
| Treads & Naval | x3 |
| Wheels & Walker | x5 |
| Hover & VTOL | x7 |
| Jets & Wings | x15 |
| Rockets | x30 |

**Drive Properties:**

- Hover, VTOL & winged craft: pilot roll or out of control when damaged
- VTOL, wings, & rockets: start falling if out of control
- Treads: +4 HP, ignore difficult terrain
- Walkers: can stand, treat impassible as difficult
- Hover: no problems over water, ice, mud, snow
- Rockets: piloting to change direction
- Wings, jets, & rockets: momentum 5+ or fall (except runway takeoff/landing)
- Second drive: equipment module

### AI Systems

- **Autopilot (`2k1` non-combat driving):** special feature
- **Helper AI (1/round Aid Another):** special feature
- **Berserker system (`6k3` kill-bot if no pilot):** special feature & +5 cost
- **Full skill AI (`6k3`):** equipment module & +15 Cost
- **Fully functional AI (`8k4`, can socialize/self-repair):** 2 modules & +40 Cost

### Quick Vehicle Stats

| Stat               | Calculation                                                   |
| ------------------ | ------------------------------------------------------------- |
| HP = Resilience    | Size                                                          |
| Move/turn (meters) | Speed × Drive × Momentum                                      |
| KPH                | 1/3 Move                                                      |
| Defense            | 0 at momentum 0; Maneuver + Speed + Momentum - Size           |
| Cost               | 5 + Maneuver + Size + Speed + 5/feature + 10/module-or-weapon |

**Cost Chart:**

| Cost Range | Rarity      |
| ---------- | ----------- |
| 1-10       | Common      |
| 11-20      | Uncommon    |
| 21-30      | Rare        |
| 31-40      | Very Rare   |
| 41-50      | Mythic Rare |
| 51-70      | Holdings 1  |
| 71-90      | Holdings 2  |
| 91-110     | Holdings 3  |
| 111-130    | Holdings 4  |
| 131-150    | Holdings 5  |

Vehicles with no drive or naval-only: 1/2 size & speed for cost.

---

## Extended Vehicle Rules

### Quick & Dirty Vehicle Rolls

**Rolling:** Drive/Pilot + Int/Dex, add Maneuver, subtract Momentum

**No tests required:** Change momentum by 1 step, 90° turn, non-threatened regular activity

**TN 15:** Change momentum by 2 steps, 180° turn, avoid going out of control

**TN 25:** Change momentum by 3 steps, bootlegger reverse or Immelmann turn, recover from out of control

**Opposed Test:** Racing, chasing, gaining advantage over opponent

### Actions

| Type         | Examples                                                                               |
| ------------ | -------------------------------------------------------------------------------------- |
| Half Actions | Regular driving, single shot, aiming, use feature                                      |
| Full Actions | Stunt driving, full auto/multiple weapons, careful aiming, recover from out of control |
| Reactions    | Dodge, parry, stay in control                                                          |

### Damage and Crashes

**Damage:** When vehicle takes 2+ damage, roll on vehicle critical chart.

**Ram/Crash:** Driving roll vs Dodging roll or automatic hit. Size 10+ vehicles have blast radius equal to Size in meters.

**Ram Damage:** Rolled dice = Size, kept dice = Momentum, adding Speed + drive rating as flat bonus. Excess Momentum dice over Size = +5 flat damage per die. Then driving roll against half damage or go out of control.

**Vehicle vs Vehicle:** Add momentums for head-on, subtract for same-direction. Use other vehicle's Size for rolled damage dice.

**Vehicle vs Immovable Objects:** Take same damage dealt.

**Vehicle vs People:** Take 1/4 damage dealt (1/2 if power armor).

### Vehicle Critical Hit Chart

| Roll | Result                                        |
| ---- | --------------------------------------------- |
| 0-2  | Scratched the paint                           |
| 3-4  | Lose 2 momentum; drive roll or out of control |
| 5-6  | Random module/feature/weapon damaged          |
| 7-8  | Random person aboard takes 1d5 wounds         |
| 9    | Hard driving roll or crash immediately        |
| 10+  | Roll twice on this chart at 1d10-1            |

### Vehicle Called Shots

State the desired effect when making a called shot. Determine damage normally.

- **Tearing-only damage:** Effect not achieved
- **1 HP damage (normally no crit chart):** Roll d10; on 10, roll on chart
- **2+ HP damage:** Roll on chart; may modify roll by HP lost to reach appropriate result

**Appropriate Result Mapping:**

1. **"Ruined paint job":** Cosmetic damage
2. **"Staggering blow":** Speed/direction changes
3. **"Pilot shaken":** Reduced pilot actions
4. **"Out of Control":** Maneuverability problems, won't crash immediately
5. **"Motive system hit":** Engine problems, try to stop safely
6. **"Pilot hit":** Harm to pilot (same wounds as vehicle unless exposed)
7. **"System hit":** Take out weapons, modules, systems
8. **"Crash":** Vehicle will crash
9. **"Cockpit breach":** Controls/windscreen damaged; gains "open topped"
10. **"Roll twice":** Doesn't map—called shots already add specific effects

### Pilot Swapping

Vehicle moves on pilot's turn. If pilot swapping is possible, give vehicle its own initiative (set to original pilot's). Changes only at Momentum 0 at round end.

If pilot and vehicle have different initiatives, control tests require spending a Reaction.

### When to Move Vehicles

For slow vehicles (up to ~100-150m movement): move on pilot's turn.

**Options for faster vehicles:**

- Half movement at start/end of round, half during pilot's turn
- 1/3 at start, 1/3 on pilot's turn, 1/3 at end
- Pilot decides at scene start whether control action is first or last turn action

### Used Car Salesmen

**Upgrades:** TN = 15 + (VP/10). A 100vp part is TN 25.

**Holdings-priced vehicles (250+ vp):** Need appropriate background resources for maintenance.

**Without backgrounds:** Tech-Use & Craft tests of TN (VP/10) + (5 per previous success). Failure adds flaws.

**Trade-ins:** Vehicle/part worth 1/10 VP (1/5 with effort). Subtract from new purchase VP before calculating TN. Each additional trade-in item: halve its value.

### Reaching Orbit

**Afterburner Optional Rule:** Vehicle with speed 20+, scramjet drive, momentum 10+ at high altitude: use multiple afterburner charges for escape velocity.

**Standard Earth gravity (10m/s²):** 2 afterburner charges. Each additional 10m/s² requires another charge.

### Limited Ammo

**Personal weapons in mounts:** Regular ammo counts. Reload from inside or 3× clip size with external access.

**Ballistics weapons:** (HP - Slots) × 3 shots. Multiply by rate of fire for actual rounds. Weapons over +10 damage require downtime to reload.

**Missile weapons:** (HP + 1 - Slots) / 2 shots

**Arrow-IV systems:** (HP - Slots) / 5 missiles

**Missile sizes:** SRMs ~size 2, LRMs ~size 3, A-4s ~size 6. Only SRMs field-reloadable (~1/minute).

**Energy weapons:** (Size + Speed - Slots) × 2 shots. Requires refueling or downtime to recharge. Refuel time: Size in minutes.

### Vehicle Weapons vs Spaceships

Spelljammers have: void shield rating 20, armor equal to Size, immunity to Tearing/auto-HP-loss/Resilience bypass. Maximum 1 hull damage from vehicle/personal weapons; no critical damage from external sources.

### The Ultra-Bigness Scale

| Size Range | Meters per Point | Maximum |
| ---------- | ---------------- | ------- |
| 1-10       | 0.5              | 5m      |
| 11-20      | 1                | 15m     |
| 21-30      | 2                | 35m     |
| 31-40      | 5                | 90m     |
| 41-50      | 10               | 200m    |
| 51-60      | 20               | 400m    |
| 61-70      | 50               | 1000m   |
| 71-80      | 100              | 2km     |
| 81-90      | 200              | 4km     |
| 91-100     | 500              | 10km    |

Pattern: Every 10 points scales 1→2→5, then x10.

### Optional Rules for A.I.s

No limit on simultaneous A.I.s, but each uses different vehicle systems; only one makes control tests per turn.

**A.I. linking feature:** Secondary A.I.s act after previous ones, half cost/slots, abilities capped by primary A.I. Bundle secondary A.I.s into one "item." Only active A.I. can aid rolls.

**Robot vehicle:** Two sets of identical linked A.I.s with 10+ rounds of actions, combined exceeding half vehicle size/cost = run as robot vehicle with normal actions.