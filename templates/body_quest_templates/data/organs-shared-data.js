// BODY QUEST — shared config (auto-generated)
// Edit JSON files in data/, then run: node scripts/sync-organs-shared.mjs
const ORGANS_SHARED_DATA = {
  "patient": {
    "patient": {
      "name": "Rohan",
      "age": 12,
      "genericSymptoms": [
        "feels unwell with several body systems affected",
        "needs a doctor to investigate organ by organ",
        "shows signs of multiple nutrient deficiencies"
      ]
    }
  },
  "organsCore": {
    "blood": {
      "id": "blood",
      "name": "Blood",
      "icon": "🩸",
      "disease": "Anemia",
      "nutrient": "Iron",
      "color": "#c0392b",
      "description": "Your blood does not have enough iron to carry oxygen to all parts of your body.",
      "image": "images/blood_cells.png"
    },
    "eyes": {
      "id": "eyes",
      "name": "Eyes",
      "icon": "👁️",
      "disease": "Night Blindness",
      "nutrient": "Vitamin A",
      "color": "#f39c12",
      "description": "Without enough Vitamin A, your eyes cannot adjust to see in dim or dark places.",
      "image": "images/eye.png"
    },
    "bones": {
      "id": "bones",
      "name": "Bones",
      "icon": "🦴",
      "disease": "Rickets",
      "nutrient": "Vitamin D",
      "color": "#bdc3c7",
      "description": "Without enough Vitamin D, bones become soft and weak, causing pain and deformity in children.",
      "image": "images/bones.png"
    },
    "lungs": {
      "id": "lungs",
      "name": "Lungs",
      "icon": "🫁",
      "disease": "Breathing Issues",
      "nutrient": "Vitamin C",
      "color": "#3498db",
      "description": "Low Vitamin C weakens the lungs and makes it harder to breathe during exercise or illness.",
      "image": "images/lungs.png"
    },
    "stomach": {
      "id": "stomach",
      "name": "Stomach",
      "icon": "🫃",
      "disease": "Indigestion",
      "nutrient": "Fiber",
      "color": "#8e44ad",
      "description": "Without enough dietary fiber, digestion slows down, causing stomach pain, bloating, and discomfort.",
      "image": "images/stomach.png"
    },
    "brain": {
      "id": "brain",
      "name": "Brain",
      "icon": "🧠",
      "disease": "Lack of Concentration / Cognitive Weakness",
      "nutrient": "Omega-3 + B Vitamins",
      "color": "#e67e22",
      "description": "The brain needs Omega-3 fatty acids to build nerve connections and focus properly.",
      "image": "images/human_body_3d.png"
    },
    "skin": {
      "id": "skin",
      "name": "Skin",
      "icon": "🧴",
      "disease": "Dermatitis / Dry Skin",
      "nutrient": "Vitamin E + Zinc",
      "color": "#e91e8c",
      "description": "Without enough Vitamin E, skin becomes dry, itchy, and inflamed.",
      "image": "images/human_body_3d.png"
    },
    "heart": {
      "id": "heart",
      "name": "Heart",
      "icon": "❤️",
      "disease": "Poor Cardiovascular Health",
      "nutrient": "Omega-3 + Potassium",
      "color": "#e74c3c",
      "description": "Low potassium can cause irregular heartbeat and weaken the heart muscles over time.",
      "image": "images/human_body.png"
    },
    "small_intestine": {
      "id": "small_intestine",
      "name": "Small Intestine",
      "icon": "🌀",
      "disease": "Malabsorption Syndrome",
      "nutrient": "Probiotics + Fiber",
      "color": "#27ae60",
      "description": "Without enough zinc, the small intestine cannot properly absorb nutrients from food.",
      "image": "images/smallintestine.png"
    },
    "large_intestine": {
      "id": "large_intestine",
      "name": "Large Intestine",
      "icon": "🔄",
      "disease": "Constipation / IBS",
      "nutrient": "Fiber + Water",
      "color": "#16a085",
      "description": "Without enough dietary fiber, the large intestine moves waste too slowly, causing constipation.",
      "image": "images/largeIntestine.png"
    }
  },
  "hotspots": {
    "sides": {
      "left": {
        "iconLeft": 8.5,
        "bendX": 30,
        "mobileIconLeft": 13,
        "mobileBendX": 31
      },
      "right": {
        "iconLeft": 91.5,
        "bendX": 70,
        "mobileIconLeft": 87,
        "mobileBendX": 69
      }
    },
    "mobileTop": {
      "brain": 9,
      "eyes": 20,
      "lungs": 34,
      "stomach": 48,
      "small_intestine": 62,
      "skin": 9,
      "blood": 20,
      "heart": 34,
      "large_intestine": 50,
      "bones": 64
    },
    "hotspots": {
      "brain": {
        "side": "left",
        "iconTop": 9,
        "anchorTop": 8,
        "anchorLeft": 50,
        "bendX": 20,
        "mobileBendX": 24
      },
      "eyes": {
        "side": "left",
        "iconTop": 22,
        "anchorTop": 14,
        "anchorLeft": 50,
        "bendX": 24,
        "mobileBendX": 27
      },
      "lungs": {
        "side": "left",
        "iconTop": 36,
        "anchorTop": 30,
        "anchorLeft": 48,
        "bendX": 28,
        "mobileBendX": 30
      },
      "stomach": {
        "side": "left",
        "iconTop": 50,
        "anchorTop": 37,
        "anchorLeft": 52,
        "bendX": 32,
        "mobileBendX": 33
      },
      "small_intestine": {
        "side": "left",
        "iconTop": 64,
        "anchorTop": 43,
        "anchorLeft": 50,
        "bendX": 36,
        "mobileBendX": 36
      },
      "skin": {
        "side": "right",
        "iconTop": 9,
        "anchorTop": 18,
        "anchorLeft": 54,
        "bendX": 80,
        "mobileBendX": 76
      },
      "blood": {
        "side": "right",
        "iconTop": 22,
        "anchorTop": 28,
        "anchorLeft": 57,
        "bendX": 77,
        "mobileBendX": 73
      },
      "heart": {
        "side": "right",
        "iconTop": 36,
        "anchorTop": 30,
        "anchorLeft": 52,
        "bendX": 74,
        "mobileBendX": 71
      },
      "large_intestine": {
        "side": "right",
        "iconTop": 50,
        "anchorTop": 48,
        "anchorLeft": 53,
        "bendX": 71,
        "mobileBendX": 69
      },
      "bones": {
        "side": "right",
        "iconTop": 64,
        "anchorTop": 70,
        "anchorLeft": 44,
        "bendX": 68,
        "mobileBendX": 66
      }
    }
  },
  "levelsConfig": {
    "levels": {
      "1": {
        "id": 1,
        "title": "Organ Identification",
        "description": "Match organ functions to the body map.",
        "mode": "identify",
        "promptType": "function",
        "organIds": [
          "blood",
          "eyes",
          "bones",
          "lungs",
          "stomach",
          "brain",
          "skin",
          "heart",
          "small_intestine",
          "large_intestine"
        ]
      },
      "2": {
        "id": 2,
        "title": "Disease Matching",
        "description": "Match diseases to organs on the body map.",
        "mode": "identify",
        "promptType": "disease",
        "organIds": [
          "blood",
          "eyes",
          "bones",
          "lungs",
          "stomach",
          "brain",
          "skin",
          "heart",
          "small_intestine",
          "large_intestine"
        ]
      },
      "3": {
        "id": 3,
        "title": "Food Matching",
        "description": "Match healing foods to organs on the body map.",
        "mode": "identify",
        "promptType": "food",
        "organIds": [
          "blood",
          "eyes",
          "bones",
          "lungs",
          "stomach",
          "brain",
          "skin",
          "heart",
          "small_intestine",
          "large_intestine"
        ]
      },
      "4": {
        "id": 4,
        "title": "Symptom Diagnosis",
        "description": "Match symptoms to organs on the body map.",
        "mode": "identify",
        "promptType": "symptom",
        "organIds": [
          "blood",
          "eyes",
          "bones",
          "lungs",
          "stomach",
          "brain",
          "skin",
          "heart",
          "small_intestine",
          "large_intestine"
        ]
      }
    },
    "allOrganIds": [
      "blood",
      "eyes",
      "bones",
      "lungs",
      "stomach",
      "brain",
      "skin",
      "heart",
      "small_intestine",
      "large_intestine"
    ]
  }
};
