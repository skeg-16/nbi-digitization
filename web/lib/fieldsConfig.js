// Configuration for field extraction strategies.
// Updated to match the specific "CASE ASSIGNMENT FORM" format.

export const fieldsConfig = [
  // 6 Core Focus Fields
  { name: "date_received", label: "Date", strategy: "label-anchored", regex: /DATE\s*:\s*(.*)/i },
  { name: "agent_on_case", label: "Agent on Case", strategy: "label-anchored", regex: /Agent[\s\-]*on[\s\-]*case\s*:\s*(.*)/i },
  { name: "ccd_no", label: "CCD No.", strategy: "label-anchored", regex: /CCD\s*No[\.\s]*:\s*(.*)/i },
  { name: "nbi_ccn", label: "NBI-CCN", strategy: "label-anchored", regex: /NBI[\s\-]*CCN[\s\-]*(.*)/i },
  { name: "complainant", label: "Complainant/RP", strategy: "label-anchored", regex: /COMPLAINANT[\s\/]*RP\s*:\s*(.*)/i },
  { name: "nature_of_case", label: "Nature of Case", strategy: "label-anchored", regex: /NATURE\s*OF\s*CASE\s*:\s*(.*)/i }
];
