export const demoResult = {
  topMatch: {
    label: "mel",
    name: "Melanoma",
    shortName: "MEL",
    confidence: "88.4",
    severity: "Critical",
    riskLevel: 4,
    description: "The most dangerous form of skin cancer. It forms in the melanocytes (pigment-producing cells). It has a high risk of spreading (metastasizing) to other organs if not caught early.",
    recommendations: [
      "IMMEDIATE evaluation by a dermatologist or oncologist.",
      "Do not delay; early-stage melanoma has a high cure rate.",
      "Prepare for a full-body skin exam."
    ],
    urgency: "Urgent - Seek medical attention immediately."
  },
  fullList: [
    { label: "mel", name: "Melanoma", confidence: "88.4", riskLevel: 4 },
    { label: "bcc", name: "Basal Cell Carcinoma", confidence: "7.2", riskLevel: 3 },
    { label: "nv", name: "Melanocytic Nevi", confidence: "2.1", riskLevel: 1 },
    { label: "akiec", name: "Actinic Keratoses", confidence: "1.5", riskLevel: 2 },
    { label: "bkl", name: "Benign Keratosis", confidence: "0.5", riskLevel: 1 },
    { label: "vasc", name: "Vascular Lesion", confidence: "0.2", riskLevel: 1 },
    { label: "df", name: "Dermatofibroma", confidence: "0.1", riskLevel: 1 }
  ]
};