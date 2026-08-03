import type { Concept } from "./types.ts";

export type { Concept, Misconception, Objective } from "./types.ts";

export const PHOTOSYNTHESIS: Concept = {
  id: "photosynthesis",
  title: "Photosynthesis",
  objectives: [
    {
      id: "gases",
      title: "Discovering gases",
      shortTitle: "Gases",
      takeaway: "Carbon dioxide supplies the carbon plants use to build glucose, while oxygen is released.",
      masteryCriterion:
        "Explains that plants take in carbon dioxide from the air and release oxygen, and connects carbon dioxide to the material used to build glucose.",
    },
    {
      id: "water-role",
      title: "Finding water's role",
      shortTitle: "Water's role",
      takeaway: "Roots absorb water, which contributes matter to photosynthesis rather than ready-made food.",
      masteryCriterion:
        "Explains that roots absorb water and that water supplies matter used in photosynthesis rather than being ready-made food.",
    },
    {
      id: "sunlight-job",
      title: "Identifying sunlight's job",
      shortTitle: "Sunlight's job",
      takeaway: "Sunlight supplies the energy for the reaction; it does not become plant matter.",
      masteryCriterion:
        "Distinguishes light as the energy source that powers the reaction from the matter that becomes glucose.",
    },
    {
      id: "balanced-equation",
      title: "Balancing the photosynthesis equation",
      shortTitle: "The equation",
      takeaway: "The balanced equation shows atoms being rearranged into glucose and oxygen, never created.",
      masteryCriterion:
        "Builds and balances 6CO2 + 6H2O -> C6H12O6 + 6O2 and explains that atoms are rearranged rather than created.",
    },
    {
      id: "final-understanding",
      title: "Building a complete understanding",
      shortTitle: "Final understanding",
      takeaway: "Inputs, energy, chloroplasts, and outputs connect plants to nearly every food chain.",
      masteryCriterion:
        "Combines inputs, outputs, energy transfer, location in chloroplasts, and significance to food chains into a coherent explanation that transfers to a new situation.",
    },
  ],
  reviewCards: [
    {
      id: "no-carbon-dioxide",
      question: "What if a leaf had light and water, but no carbon dioxide?",
      answer: "It could not build glucose because carbon dioxide supplies the carbon atoms that become part of the sugar.",
    },
    {
      id: "no-water",
      question: "What if a plant's roots could no longer absorb water?",
      answer: "Photosynthesis would slow or stop because water is one of its material inputs—and the plant would also lose the water pressure that keeps it upright.",
    },
    {
      id: "darkness",
      question: "What if a healthy plant stayed in darkness for several days?",
      answer: "It could keep respiring stored glucose for a while, but without light energy it could not make new glucose through photosynthesis.",
    },
    {
      id: "unbalanced-equation",
      question: "What if we wrote the photosynthesis equation without balancing it?",
      answer: "The equation would not account for equal numbers of each atom on both sides, so it would fail to represent conservation of matter.",
    },
  ],
  misconceptions: [
    {
      id: "soil_food",
      belief: "Plants get their food from the soil.",
      reality:
        "Plants absorb water and minerals from soil, but make their own food from CO2, water, and light.",
    },
    {
      id: "mass_from_soil",
      belief: "A plant's material/mass comes mainly from the soil.",
      reality:
        "Most of a plant's dry mass comes from carbon captured out of CO2 in the air.",
    },
    {
      id: "water_is_food",
      belief: "Water is the plant's food or becomes plant material by itself.",
      reality:
        "Water contributes matter to photosynthesis, but plants make glucose by rearranging water and carbon dioxide using light energy.",
    },
    {
      id: "night_respiration",
      belief: "Plants only respire at night / do not respire.",
      reality:
        "Plants respire all the time; they only photosynthesize when there is light.",
    },
    {
      id: "light_optional",
      belief: "Plants just need water and soil, not light, to make food.",
      reality: "Light is an essential energy source for photosynthesis.",
    },
    {
      id: "light_is_matter",
      belief: "Sunlight becomes the physical material of the plant.",
      reality:
        "Light supplies energy; carbon dioxide and water supply the atoms that are rearranged into glucose.",
    },
    {
      id: "atoms_created",
      belief: "Balancing an equation changes or creates atoms to make the formula work.",
      reality:
        "Balancing records equal numbers of each atom before and after the reaction; atoms are rearranged, not created.",
    },
    {
      id: "photo_eq_resp",
      belief: "Photosynthesis and respiration are the same thing.",
      reality:
        "They are opposite processes: photosynthesis stores energy, respiration releases it.",
    },
  ],
};
