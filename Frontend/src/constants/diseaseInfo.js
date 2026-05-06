export const diseaseInfo = {
  akiec: {
    name: "Actinic Keratoses",
    shortName: "AK",
    description: "A rough, scaly patch on the skin that develops from years of sun exposure. It is considered 'pre-cancerous' because it can progress to Squamous Cell Carcinoma if left untreated.",
    severity: "Moderate",
    riskLevel: 2, // 1-4 scale
    recommendations: [
      "Minimize direct sunlight between 10 AM and 4 PM.",
      "Apply broad-spectrum SPF 50+ daily.",
      "Consult a dermatologist for possible cryotherapy (freezing) or topical creams."
    ],
    commonSymptoms: [
      "Rough, dry, or scaly patch of skin",
      "Flat to slightly raised bump on the top layer of skin",
      "Hard, wart-like surface in some cases",
      "Color variations: pink, red, or brown"
    ],
    typicalLocation: "Face, lips, ears, back of hands, forearms, scalp, or neck.",
    urgency: "Routine - Schedule an appointment within a few weeks."
  },
  bcc: {
    name: "Basal Cell Carcinoma",
    shortName: "BCC",
    description: "The most common form of skin cancer. It usually appears as a slightly transparent bump on the skin, though it can take other forms. It rarely spreads to other parts of the body but can damage surrounding tissue.",
    severity: "High",
    riskLevel: 3,
    recommendations: [
      "Do not squeeze or pick at the lesion.",
      "Biopsy is required for definitive diagnosis.",
      "Treatment typically involves surgical excision or Mohs surgery."
    ],
    commonSymptoms: [
      "A pearly or waxy bump",
      "A flat, flesh-colored or brown scar-like lesion",
      "A bleeding or scabbing sore that heals and returns"
    ],
    typicalLocation: "Sun-exposed areas such as the face and neck.",
    urgency: "Priority - Schedule a specialist visit soon."
  },
  bkl: {
    name: "Benign Keratosis-like Lesions",
    shortName: "BKL",
    description: "A broad category including seborrheic keratoses and lichen-planus-like keratoses. These are non-cancerous (benign) and very common as people age.",
    severity: "Low",
    riskLevel: 1,
    recommendations: [
      "No medical treatment is necessary unless the lesion is itchy or irritated.",
      "Monitor for any rapid changes in size or color.",
      "Can be removed for cosmetic reasons via laser or shave excision."
    ],
    commonSymptoms: [
      "Waxy, 'pasted-on' appearance",
      "Range in color from light tan to black",
      "Usually painless, though may itch"
    ],
    typicalLocation: "Chest, back, shoulders, or face.",
    urgency: "None - Monitor during regular checkups."
  },
  df: {
    name: "Dermatofibroma",
    shortName: "DF",
    description: "Common benign fibrous nodules. They are harmless growths within the deeper layers of the skin, often resulting from a minor injury like a bug bite or splinter.",
    severity: "Low",
    riskLevel: 1,
    recommendations: [
      "Reassurance is the primary 'treatment'.",
      "Avoid attempting home removal as it can cause deep scarring.",
      "See a doctor only if it becomes painful or changes rapidly."
    ],
    commonSymptoms: [
      "Firm, hard bump under the skin",
      "The 'dimple sign' (it sinks inward when pinched)",
      "May be tender to the touch"
    ],
    typicalLocation: "Most common on the lower legs.",
    urgency: "None."
  },
  mel: {
    name: "Melanoma",
    shortName: "MEL",
    description: "The most dangerous form of skin cancer. It forms in the melanocytes (pigment-producing cells). It has a high risk of spreading (metastasizing) to other organs if not caught early.",
    severity: "Critical",
    riskLevel: 4,
    recommendations: [
      "IMMEDIATE evaluation by a dermatologist or oncologist.",
      "Do not delay; early-stage melanoma has a high cure rate.",
      "Prepare for a full-body skin exam."
    ],
    commonSymptoms: [
      "Asymmetrical shape",
      "Irregular, notched, or blurred borders",
      "Multiple colors (black, brown, tan, blue, or red)",
      "Diameter larger than 6mm (pencil eraser size)"
    ],
    typicalLocation: "Anywhere on the body, including areas not exposed to sun.",
    urgency: "Urgent - Seek medical attention immediately."
  },
  nv: {
    name: "Melanocytic Nevi",
    shortName: "NV",
    description: "Commonly known as a mole. These are benign clusters of pigment cells. Most people have between 10 and 40 moles by adulthood.",
    severity: "Low",
    riskLevel: 1,
    recommendations: [
      "Track your moles using the 'ABCDE' method.",
      "Perform a skin self-exam once a month.",
      "Consult a doctor if a mole starts bleeding, itching, or growing."
    ],
    commonSymptoms: [
      "Symmetrical round or oval shape",
      "Uniform brown, tan, or pink color",
      "Smooth borders"
    ],
    typicalLocation: "Anywhere on the skin.",
    urgency: "None - Standard monitoring."
  },
  vasc: {
    name: "Vascular Lesions",
    shortName: "VASC",
    description: "A range of abnormalities in the blood vessels, including cherry angiomas and pyogenic granulomas. Most are benign but some can bleed easily.",
    severity: "Low",
    riskLevel: 1,
    recommendations: [
      "Avoid trauma to the area as these can bleed profusely.",
      "Laser therapy is highly effective for removal.",
      "Consult a doctor if the lesion grows rapidly or bleeds without provocation."
    ],
    commonSymptoms: [
      "Bright red, purple, or blue color",
      "Blanches (turns white) briefly when pressed",
      "Can be flat or raised"
    ],
    typicalLocation: "Trunk, limbs, or face.",
    urgency: "Routine."
  }
};
