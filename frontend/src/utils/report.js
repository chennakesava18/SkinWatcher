import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadReport = async (elementId, filename = "skinwatcher-report.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, { backgroundColor: "#061528", scale: 2 });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = 210;
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(img, "PNG", 0, 0, width, Math.min(height, 297));
  pdf.save(filename);
};

