// Configuration for field extraction strategies.
// Note: These are placeholders. Real-world calibration is needed once the physical form layout is confirmed.

export const fieldsConfig = [
  { name: "record_no", label: "Record No.", strategy: "label-anchored", regex: /Record No\.?:\s*(.*)/i },
  { name: "date_received", label: "Date Received", strategy: "label-anchored", regex: /Date Received:\s*(.*)/i },
  { name: "ccd_no", label: "CCD No.", strategy: "label-anchored", regex: /CCD No\.?:\s*(.*)/i },
  { name: "nbi_ccn", label: "NBI-CCN", strategy: "label-anchored", regex: /NBI-CCN:\s*(.*)/i },
  { name: "nature_of_case", label: "Nature of Case", strategy: "label-anchored", regex: /Nature of Case:\s*(.*)/i },
  { name: "complainant", label: "Complainant", strategy: "label-anchored", regex: /Complainant:\s*(.*)/i },
  { name: "subject", label: "Subject", strategy: "label-anchored", regex: /Subject:\s*(.*)/i },
  { name: "agent_on_case", label: "Agent on Case", strategy: "label-anchored", regex: /Agent on Case:\s*(.*)/i },
  { name: "age_gender", label: "Age/Gender", strategy: "zone-based", zone: { x_min: 100, y_min: 200, x_max: 300, y_max: 250 } },
  { name: "contact_no", label: "Contact No.", strategy: "label-anchored", regex: /Contact No\.?:\s*(.*)/i },
  { name: "status", label: "Status", strategy: "label-anchored", regex: /Status:\s*(.*)/i },
  { name: "re_assigned", label: "Re-assigned", strategy: "label-anchored", regex: /Re-assigned:\s*(.*)/i },
];
