import { jsPDF } from 'jspdf';

export interface CSRReportPdfData {
  reportId: string;
  projectId: string;
  projectTitle: string;
  university: string;
  csrPartner: string;
  csrProjectLead: string;
  reportingPeriod: string;
  generatedDate: string;
  reportStatus: string;
  reportType?: string;

  // 14 Core Sections
  executiveSummary: string;
  projectInformation: {
    domain: string;
    location: string;
    studentTeam: string;
    facultyMentor: string;
    industryMentor: string;
    currentStage: string;
  };
  problemStatement: string;
  solution: string;
  progressPercent: number;
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    progress: number;
    status: string;
  }>;
  fundingSummary: {
    approvedAmount: number;
    releasedAmount: number;
    utilizedAmount: number;
    remainingAmount: number;
  };
  deliverables: Array<{
    id: string;
    title: string;
    submittedBy: string;
    submissionDate: string;
    reviewStatus: string;
  }>;
  risks: Array<{
    id: string;
    title: string;
    severity: string;
    reportedDate: string;
    responsiblePerson: string;
    resolution: string;
    status: string;
  }>;
  socialImpact: {
    peopleBenefited: number | string;
    areasCovered: string;
    measuredOutcomes: string;
    infrastructureCreated?: string;
    environmentalImpact?: string;
  };
  industryContribution: string;
  universityContribution: string;
  nextSteps: string;
  approvalInformation: {
    reviewedBy: string;
    signoffDate: string;
    reviewComments: string;
    statutoryCompliance: string;
  };
}

/**
 * Builds an authentic, institutional Government / SIH / CSR multi-page PDF document
 * adhering to Sections 21, 22, and 23 of the CivicConnect specification.
 */
export function buildCSRReportPdfDocument(data: CSRReportPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomFooterMargin = 16;

  let y = 14;

  // Palettes
  const cDeepNavy = [19, 48, 84] as const;      // #133054
  const cGovBlue = [30, 78, 140] as const;      // #1E4E8C
  const cHeaderBg = [240, 244, 248] as const;   // #F0F4F8
  const cBorder = [203, 213, 225] as const;     // #CBD5E1
  const cDarkText = [15, 23, 42] as const;      // #0F172A
  const cMuted = [100, 116, 139] as const;      // #64748B
  const cGreen = [22, 101, 52] as const;        // #166534

  // Check page overflow and add new page if needed
  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - bottomFooterMargin) {
      doc.addPage();
      y = 16;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cDeepNavy);
    doc.text('CIVICCONNECT — CSR & UNIVERSITY INNOVATION PLATFORM', margin, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cMuted);
    doc.text(`PROJECT ID: ${data.projectId} | REPORT: ${data.reportId}`, pageWidth - margin, 10, { align: 'right' });

    doc.setDrawColor(...cGovBlue);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // -------------------------------------------------------------
  // PAGE 1: OFFICIAL GOVERNMENT & INSTITUTIONAL HEADER
  // -------------------------------------------------------------
  // Tricolor accent line at top
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(margin, y, contentWidth / 3, 1.5, 'F');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(margin + contentWidth / 3, y, contentWidth / 3, 1.5, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect(margin + (2 * contentWidth) / 3, y, contentWidth / 3, 1.5, 'F');
  y += 4;

  // Institution title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...cDeepNavy);
  doc.text('CIVICCONNECT', margin, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...cGovBlue);
  doc.text('University & Industry Innovation Platform', margin, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cMuted);
  doc.text('Government of India • Ministry of Education • Smart India Hackathon Innovation Ecosystem', margin, y + 12.5);

  y += 16;

  // Title Box
  doc.setFillColor(...cHeaderBg);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...cDeepNavy);
  doc.text(data.reportType ? data.reportType.toUpperCase() : 'CSR PROJECT REPORT', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...cGreen);
  doc.text(`STATUS: ${data.reportStatus.toUpperCase()}`, pageWidth - margin - 4, y + 7.5, { align: 'right' });

  y += 15;

  // Project Dossier Metadata Box
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 28, 'S');
  doc.setDrawColor(...cBorder);

  // Divide box into 2 columns
  const halfCol = contentWidth / 2;
  doc.line(margin + halfCol, y, margin + halfCol, y + 28);

  // Left Column
  doc.setFontSize(7.5);
  const printMeta = (label: string, val: string, xPos: number, yPos: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cMuted);
    doc.text(label, xPos, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...cDarkText);
    const splitVal = doc.splitTextToSize(val, halfCol - 26);
    doc.text(splitVal[0] || 'N/A', xPos + 24, yPos);
  };

  printMeta('Report ID:', data.reportId, margin + 3, y + 5);
  printMeta('Project ID:', data.projectId, margin + 3, y + 10);
  printMeta('Project:', data.projectTitle, margin + 3, y + 15);
  printMeta('University:', data.university, margin + 3, y + 20);
  printMeta('Domain:', data.projectInformation.domain, margin + 3, y + 25);

  // Right Column
  printMeta('CSR Partner:', data.csrPartner, margin + halfCol + 3, y + 5);
  printMeta('CSR Lead:', data.csrProjectLead, margin + halfCol + 3, y + 10);
  printMeta('Period:', data.reportingPeriod, margin + halfCol + 3, y + 15);
  printMeta('Gen Date:', data.generatedDate, margin + halfCol + 3, y + 20);
  printMeta('Location:', data.projectInformation.location, margin + halfCol + 3, y + 25);

  y += 32;

  // Section Heading Helper
  const printSectionHeader = (title: string) => {
    ensureSpace(12);
    doc.setFillColor(...cHeaderBg);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(...cBorder);
    doc.rect(margin, y, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...cDeepNavy);
    doc.text(title, margin + 3, y + 4.2);
    y += 8;
  };

  // Section 1: Executive Summary
  printSectionHeader('1. EXECUTIVE SUMMARY');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  const execLines = doc.splitTextToSize(data.executiveSummary, contentWidth - 4);
  doc.text(execLines, margin + 2, y);
  y += execLines.length * 4 + 4;

  // Section 2: Project Information & Key Personnel
  printSectionHeader('2. PROJECT INFORMATION & STAKEHOLDERS');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cMuted);
  const colW = contentWidth / 3;

  doc.text('FACULTY MENTOR', margin + 2, y);
  doc.text('INDUSTRY MENTOR', margin + colW + 2, y);
  doc.text('STUDENT TEAM LEAD', margin + 2 * colW + 2, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  doc.text(data.projectInformation.facultyMentor, margin + 2, y + 4.5);
  doc.text(data.projectInformation.industryMentor, margin + colW + 2, y + 4.5);
  doc.text(data.projectInformation.studentTeam, margin + 2 * colW + 2, y + 4.5);
  y += 9;

  // Section 3: Problem Statement
  printSectionHeader('3. PROBLEM STATEMENT');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  const probLines = doc.splitTextToSize(data.problemStatement, contentWidth - 4);
  doc.text(probLines, margin + 2, y);
  y += probLines.length * 4 + 4;

  // Section 4: Proposed / Implemented Solution
  printSectionHeader('4. PROPOSED / IMPLEMENTED SOLUTION');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  const solLines = doc.splitTextToSize(data.solution, contentWidth - 4);
  doc.text(solLines, margin + 2, y);
  y += solLines.length * 4 + 4;

  // Section 5: Project Progress Bar & Stage
  printSectionHeader('5. PROJECT PROGRESS & LIFECYCLE STAGE');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...cDeepNavy);
  doc.text(`Current Stage: ${data.projectInformation.currentStage.toUpperCase()}   |   Overall Progress: ${data.progressPercent}%`, margin + 2, y);

  // Visual progress bar
  y += 3;
  doc.setFillColor(226, 232, 240); // slate-200
  doc.rect(margin + 2, y, 100, 3, 'F');
  doc.setFillColor(...cGovBlue);
  doc.rect(margin + 2, y, (100 * Math.min(data.progressPercent, 100)) / 100, 3, 'F');
  y += 7;

  // Section 6: Milestone Status Table
  printSectionHeader('6. MILESTONE MONITORING');
  ensureSpace(24);
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setDrawColor(...cBorder);
  doc.rect(margin, y, contentWidth, 5.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDeepNavy);
  doc.text('Milestone Code & Scope', margin + 3, y + 3.8);
  doc.text('Target Due Date', margin + 115, y + 3.8);
  doc.text('Progress', margin + 145, y + 3.8);
  doc.text('Status', margin + 165, y + 3.8);
  y += 5.5;

  (data.milestones || []).forEach((m) => {
    ensureSpace(6);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 5.5, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cDarkText);
    doc.text(`${m.id}: ${m.title.substring(0, 52)}`, margin + 3, y + 3.8);
    doc.text(m.dueDate, margin + 115, y + 3.8);
    doc.text(`${m.progress}%`, margin + 145, y + 3.8);
    doc.text(m.status, margin + 165, y + 3.8);
    y += 5.5;
  });
  y += 4;

  // Section 7: Funding Summary (Section 23 requirement)
  printSectionHeader('7. FUNDING SUMMARY & FISCAL UTILIZATION');
  ensureSpace(16);
  const fundBoxW = contentWidth / 4;
  const printFundCell = (label: string, amt: number, xP: number) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(xP, y, fundBoxW, 11, 'F');
    doc.setDrawColor(...cBorder);
    doc.rect(xP, y, fundBoxW, 11, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...cMuted);
    doc.text(label.toUpperCase(), xP + 2, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...cDeepNavy);
    doc.text(`₹ ${(amt / 100000).toFixed(2)} Lakhs`, xP + 2, y + 8.5);
  };

  printFundCell('Approved Amount', data.fundingSummary.approvedAmount, margin);
  printFundCell('Released Amount', data.fundingSummary.releasedAmount, margin + fundBoxW);
  printFundCell('Utilized Amount', data.fundingSummary.utilizedAmount, margin + 2 * fundBoxW);
  printFundCell('Remaining Amount', data.fundingSummary.remainingAmount, margin + 3 * fundBoxW);
  y += 15;

  // Section 8: Deliverables Table
  printSectionHeader('8. KEY DELIVERABLES & TECHNICAL REVIEWS');
  ensureSpace(20);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setDrawColor(...cBorder);
  doc.rect(margin, y, contentWidth, 5.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDeepNavy);
  doc.text('Deliverable Artifact', margin + 3, y + 3.8);
  doc.text('Submitted By', margin + 95, y + 3.8);
  doc.text('Date', margin + 140, y + 3.8);
  doc.text('Audit Status', margin + 160, y + 3.8);
  y += 5.5;

  if (data.deliverables && data.deliverables.length > 0) {
    data.deliverables.forEach((d) => {
      ensureSpace(6);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 5.5, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...cDarkText);
      doc.text(d.title.substring(0, 48), margin + 3, y + 3.8);
      doc.text(d.submittedBy.substring(0, 24), margin + 95, y + 3.8);
      doc.text(d.submissionDate, margin + 140, y + 3.8);
      doc.text(d.reviewStatus, margin + 160, y + 3.8);
      y += 5.5;
    });
  } else {
    ensureSpace(6);
    doc.rect(margin, y, contentWidth, 5.5, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cMuted);
    doc.text('Deliverables scheduled for upcoming tranches.', margin + 3, y + 3.8);
    y += 5.5;
  }
  y += 4;

  // Section 9: Issues & Risks Table
  printSectionHeader('9. ISSUES & RISKS MANAGEMENT');
  ensureSpace(20);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setDrawColor(...cBorder);
  doc.rect(margin, y, contentWidth, 5.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDeepNavy);
  doc.text('Risk Description', margin + 3, y + 3.8);
  doc.text('Severity', margin + 90, y + 3.8);
  doc.text('Owner', margin + 112, y + 3.8);
  doc.text('Mitigation Strategy', margin + 140, y + 3.8);
  y += 5.5;

  if (data.risks && data.risks.length > 0) {
    data.risks.forEach((r) => {
      ensureSpace(6);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 5.5, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...cDarkText);
      doc.text(r.title.substring(0, 44), margin + 3, y + 3.8);
      doc.text(r.severity, margin + 90, y + 3.8);
      doc.text(r.responsiblePerson.substring(0, 16), margin + 112, y + 3.8);
      doc.text((r.resolution || 'Active monitoring').substring(0, 25), margin + 140, y + 3.8);
      y += 5.5;
    });
  } else {
    ensureSpace(6);
    doc.rect(margin, y, contentWidth, 5.5, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cGreen);
    doc.text('No active blockers or unresolved risk escalations logged.', margin + 3, y + 3.8);
    y += 5.5;
  }
  y += 4;

  // Section 10: Social Impact (Section 23 requirement)
  printSectionHeader('10. SOCIAL IMPACT & MEASURED CITIZEN OUTCOMES');
  ensureSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cMuted);
  doc.text('PEOPLE BENEFITED:', margin + 2, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cDeepNavy);
  doc.text(`${Number(data.socialImpact.peopleBenefited).toLocaleString('en-IN')} Citizens`, margin + 35, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cMuted);
  doc.text('AREAS COVERED:', margin + 95, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDarkText);
  doc.text(data.socialImpact.areasCovered, margin + 125, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cMuted);
  doc.text('MEASURED OUTCOME:', margin + 2, y);
  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  const outLines = doc.splitTextToSize(data.socialImpact.measuredOutcomes, contentWidth - 4);
  doc.text(outLines, margin + 2, y);
  y += outLines.length * 4 + 4;

  // Section 11 & 12: Industry & University Contributions
  printSectionHeader('11 & 12. INDUSTRY & UNIVERSITY COLLABORATIVE CONTRIBUTIONS');
  ensureSpace(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDeepNavy);
  doc.text('Industry CSR Partner Contribution:', margin + 2, y);
  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDarkText);
  const indLines = doc.splitTextToSize(data.industryContribution, contentWidth - 4);
  doc.text(indLines, margin + 2, y);
  y += indLines.length * 3.5 + 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDeepNavy);
  doc.text('University Academic & Lab Contribution:', margin + 2, y);
  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDarkText);
  const uniLines = doc.splitTextToSize(data.universityContribution, contentWidth - 4);
  doc.text(uniLines, margin + 2, y);
  y += uniLines.length * 3.5 + 4;

  // Section 13: Next Steps
  printSectionHeader('13. FORWARD ROADMAP & NEXT STEPS');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cDarkText);
  const nextLines = doc.splitTextToSize(data.nextSteps, contentWidth - 4);
  doc.text(nextLines, margin + 2, y);
  y += nextLines.length * 4 + 4;

  // Section 14: Approval / Review Signoff
  printSectionHeader('14. APPROVAL & STATUTORY AUDIT SIGNOFF');
  ensureSpace(24);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setDrawColor(...cBorder);
  doc.rect(margin, y, contentWidth, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cMuted);
  doc.text('APPROVED & SUBMITTED BY:', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cDeepNavy);
  doc.text(data.approvalInformation.reviewedBy, margin + 44, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cMuted);
  doc.text('SIGNOFF DATE:', margin + 115, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDarkText);
  doc.text(data.approvalInformation.signoffDate, margin + 140, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cMuted);
  doc.text('STATUTORY CLAUSE:', margin + 3, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDarkText);
  doc.text(data.approvalInformation.statutoryCompliance, margin + 44, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cMuted);
  doc.text('AUDIT COMMENTS:', margin + 3, y + 14);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...cDarkText);
  doc.text(data.approvalInformation.reviewComments.substring(0, 75), margin + 44, y + 14);

  // -------------------------------------------------------------
  // FOOTER PAGINATION: CivicConnect — CSR Project Report | Page X of Y
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...cBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cMuted);
    doc.text('CivicConnect — CSR Project Report', margin, pageHeight - 7.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  }

  return doc;
}
