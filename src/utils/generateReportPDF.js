import jsPDF from "jspdf";

/**
 * Generate a branded Device Tracker PDF report.
 * Automatically adapts layout and icon based on device category.
 *
 * @param {Object} data - Report details object.
 * @param {string} data.device_category - phone | laptop | smart_tv
 * @param {string} data.device_type - model / brand name
 * @param {string} data.imei - IMEI / serial / MAC
 * @param {string} data.color - color if available
 * @param {string} data.location_area - where lost
 * @param {string} data.lost_type - misplaced or stolen
 * @param {string} data.lost_datetime - when lost
 * @param {string} data.other_details - extra notes
 * @param {string} data.proof_name - proof file name
 * @param {string} data.police_name - police report file name
 * @param {string|number} data.report_id - unique report id
 * @param {string} [data.reporter] - reporter username
 */
export const generateReportPDF = async (data) => {
  const doc = new jsPDF("p", "mm", "a4");

  // === BRAND HEADER BAR ===
  doc.setFillColor(25, 80, 180); // deep blue
  doc.rect(0, 0, 210, 25, "F");

  // === OPTIONAL LOGO (place your logo in /src/assets/logo.png) ===
  try {
    // if you add a base64 logo, you can import it and use: doc.addImage(logo, "PNG", 10, 5, 20, 15);
    // Example: import logo from "../assets/logo.png";
  } catch {
    // ignore if logo not found
  }

  // === HEADER TEXT ===
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("🔒 DEVICE TRACKER REPORT RECEIPT", 14, 16);

  // Reset to normal text
  doc.setTextColor(0, 0, 0);

  // === BASIC INFO SECTION ===
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 33);
  doc.text(`Report ID: ${data.report_id || "N/A"}`, 14, 40);
  if (data.reporter)
    doc.text(`Reporter: ${data.reporter}`, 14, 47);

  // === SECTION TITLE ===
  const icon =
    data.device_category === "phone"
      ? "📱 Phone Information"
      : data.device_category === "laptop"
      ? "💻 Laptop Information"
      : "📺 Smart TV Information";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(icon, 14, 60);

  // === DEVICE DETAILS ===
  doc.setFont("helvetica", "normal");
  const info = [
    ["Device Category", data.device_category || "—"],
    ["Device Type / Model", data.device_type || "—"],
    ["IMEI / Serial / MAC", data.imei || "—"],
    ["Color", data.color || "—"],
    ["Lost Type", data.lost_type || "—"],
    ["Location", data.location_area || "—"],
    ["Lost Date & Time", data.lost_datetime || "—"],
    ["Other Details", data.other_details || "—"],
    ["Proof of Ownership", data.proof_name || "None uploaded"],
    ["Police Report", data.police_name || "None uploaded"],
  ];

  let y = 70;
  info.forEach(([label, value]) => {
    doc.text(`${label}:`, 14, y);
    doc.text(String(value), 70, y);
    y += 7;
  });

  // === FOOTER NOTE ===
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text(
    "Thank you for submitting your report. Device Tracker partners with local authorities and communities to help recover lost or stolen devices.",
    14,
    y + 12,
    { maxWidth: 180 }
  );

  // === SAVE ===
  const cleanName =
    data.device_type?.replace(/\s+/g, "_") ||
    data.device_category ||
    "Device";
  const fileName = `DeviceTracker_${cleanName}_Report_${
    data.report_id || "receipt"
  }.pdf`;

  doc.save(fileName);
};
