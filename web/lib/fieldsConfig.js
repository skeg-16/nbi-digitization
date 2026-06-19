// Configuration for field extraction strategies.
// Updated to match the specific "CASE ASSIGNMENT FORM" format.

export const fieldsConfig = [
  // Core fields matched from the form
  { name: "date_received", label: "Date", strategy: "label-anchored", regex: /DATE:\s*(.*)/i },
  { name: "agent_on_case", label: "Agent on Case", strategy: "label-anchored", regex: /Agent-on-case:\s*(.*)/i },
  { name: "ccd_no", label: "CCD No.", strategy: "label-anchored", regex: /CCD\s*No\.?:\s*(.*)/i },
  { name: "nbi_ccn", label: "NBI-CCN", strategy: "label-anchored", regex: /NBI-CCN-?\s*(.*)/i },
  { name: "acmo_no", label: "ACMO No.", strategy: "label-anchored", regex: /ACMO\s*No\.?:\s*(.*)/i },
  { name: "subject", label: "Subject", strategy: "label-anchored", regex: /SUBJECT:\s*(.*)/i },
  { name: "complainant", label: "Complainant/RP", strategy: "label-anchored", regex: /COMPLAINANT\/RP:\s*(.*)/i },
  { name: "nature_of_case", label: "Nature of Case", strategy: "label-anchored", regex: /NATURE OF CASE:\s*(.*)/i },
  
  // Remaining database fields kept for compatibility (will extract blank if not found)
  { name: "record_no", label: "Record No.", strategy: "label-anchored", regex: /Record No\.?:\s*(.*)/i },
  { name: "age_gender", label: "Age/Gender", strategy: "zone-based", zone: { x_min: 100, y_min: 200, x_max: 300, y_max: 250 } },
  { name: "contact_no", label: "Contact No.", strategy: "label-anchored", regex: /Contact No\.?:\s*(.*)/i },
  { name: "status", label: "Status", strategy: "label-anchored", regex: /Status:\s*(.*)/i },
  { name: "re_assigned", label: "Re-assigned", strategy: "label-anchored", regex: /Re-assigned:\s*(.*)/i },
];
