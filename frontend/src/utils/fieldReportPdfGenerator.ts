import { jsPDF } from 'jspdf';

export interface FieldReportPdfData {
  reportId: string;
  reportType?: string;
  visitId: string;
  workerName: string;
  workerId?: string;
  workerRole?: string;
  department: string;
  municipality: string;
  date: string;
  generatedDate?: string;
  assignment: {
    challengeId: string;
    problemTitle: string;
    domain: string;
    priority: string;
    location: string;
    ward: string;
    assignedDate?: string;
    dueDate?: string;
  };
  gpsVerification: {
    expectedCoordinates: string;
    capturedCoordinates: string;
    distanceMeters: number;
    gpsAccuracyMeters: number;
    locationStatus: string;
    timestamp: string;
  };
  observations: {
    observedProblem: string;
    actualGroundCondition: string;
    severityAssessment: string;
    affectedArea: string;
    communityImpact: string;
    immediateRisks: string;
    additionalNotes: string;
  };
  structuredQuestions?: {
    isIssuePresent: string;
    isLocationMatch: string;
    isIssueActive: string;
    isImmediateInterventionRequired: string;
    conditionChange: string;
    visibleSafetyRisks: string;
  };
  evidenceSummary: {
    photoCount: number;
    photos?: Array<{ category: string; caption: string; timestamp: string }>;
    videoCount: number;
  };
  verificationResult: {
    result: string;
    officialStatus: string;
    remarks: string;
  };
  followUp: {
    requiredAction: string;
    responsibleAuthority: string;
    targetRedressalWindow: string;
  };
}

export function generateFieldReportPdf(data: FieldReportPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const drawHeaderFooter = (pageNumber: number, totalPages: number) => {
    // 1. National Tricolor Accent Strip
    doc.setFillColor(255, 153, 51); // Saffron
    doc.rect(margin, 8, contentWidth / 3, 1.2, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(margin + contentWidth / 3, 8, contentWidth / 3, 1.2, 'F');
    doc.setFillColor(19, 136, 8); // Green
    doc.rect(margin + (contentWidth * 2) / 3, 8, contentWidth / 3, 1.2, 'F');

    // Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138); // Royal Navy
    doc.text('CIVICCONNECT — GOVERNMENT & MUNICIPAL FIELD OPERATIONS', margin, 12.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Government of India • Ministry of Housing & Urban Affairs', pageWidth - margin, 12.5, { align: 'right' });

    // Header divider line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer divider line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `CivicConnect Official Field Report • Ref: ${data.reportId} • ${data.municipality}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }
  };

  // Title Banner
  y = 19;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(19, 42, 74);
  doc.text('OFFICIAL GROUND VERIFICATION & INSPECTION REPORT', margin + 4, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Urban Local Body: ${data.municipality} | Department: ${data.department}`,
    margin + 4,
    y + 11.5
  );
  doc.text(
    `Report ID: ${data.reportId}   |   Visit ID: ${data.visitId}   |   Inspection Date: ${data.date}`,
    margin + 4,
    y + 15.5
  );

  y += 22;

  // Metadata Row
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INSPECTING FIELD OFFICER', margin + 3, y + 4.5);
  doc.text('OFFICIAL BADGE / ID', margin + 55, y + 4.5);
  doc.text('OFFICIAL DESIGNATION', margin + 105, y + 4.5);
  doc.text('JURISDICTION WARD', margin + 148, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.workerName, margin + 3, y + 9);
  doc.text(data.workerId || 'GOV-FO-PWD-101', margin + 55, y + 9);
  doc.text(data.workerRole || 'Field Inspection Officer', margin + 105, y + 9);
  doc.text(data.assignment.ward, margin + 148, y + 9);

  y += 16;

  // SECTION 1: ASSIGNMENT DETAILS
  checkPageBreak(30);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION 1: ASSIGNMENT & CIVIC CHALLENGE DETAILS', margin + 3, y + 4);

  y += 5.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CHALLENGE ID:', margin + 3, y + 4.5);
  doc.text('PRIORITY TIER:', margin + 65, y + 4.5);
  doc.text('CIVIC DOMAIN:', margin + 120, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text(data.assignment.challengeId, margin + 28, y + 4.5);

  // Priority color badge
  if (data.assignment.priority.toUpperCase() === 'CRITICAL') {
    doc.setTextColor(220, 38, 38);
  } else if (data.assignment.priority.toUpperCase() === 'HIGH') {
    doc.setTextColor(217, 119, 6);
  } else {
    doc.setTextColor(37, 99, 235);
  }
  doc.text(data.assignment.priority.toUpperCase(), margin + 90, y + 4.5);

  doc.setTextColor(15, 23, 42);
  doc.text(data.assignment.domain, margin + 145, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PROBLEM TITLE:', margin + 3, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.assignment.problemTitle, margin + 28, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL SITE ADDRESS:', margin + 3, y + 16.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(data.assignment.location, margin + 38, y + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('DUE DATE SLA:', margin + 3, y + 21.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.assignment.dueDate || '26 Sep 2026', margin + 28, y + 21.5);

  y += 28;

  // SECTION 2: GPS VERIFICATION & ACCURACY AUDIT
  checkPageBreak(28);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION 2: GEOLOCATION & GPS ACCURACY VERIFICATION', margin + 3, y + 4);

  y += 5.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 20, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EXPECTED CITIZEN COORD:', margin + 3, y + 5);
  doc.text('CAPTURED FIELD GPS:', margin + 65, y + 5);
  doc.text('HAIVERSINE DISTANCE:', margin + 125, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.gpsVerification.expectedCoordinates, margin + 3, y + 9.5);
  doc.text(data.gpsVerification.capturedCoordinates, margin + 65, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`${data.gpsVerification.distanceMeters} metres`, margin + 125, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('GPS ACCURACY RADIUS:', margin + 3, y + 15);
  doc.text('LOCATION MATCH STATUS:', margin + 65, y + 15);
  doc.text('CAPTURE TIMESTAMP:', margin + 125, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`±${data.gpsVerification.gpsAccuracyMeters || 6} metres (Browser Geolocation)`, margin + 3, y + 18.5);

  if (data.gpsVerification.locationStatus.includes('Outside')) {
    doc.setTextColor(220, 38, 38);
  } else {
    doc.setTextColor(5, 150, 105);
  }
  doc.text(data.gpsVerification.locationStatus, margin + 65, y + 18.5);

  doc.setTextColor(15, 23, 42);
  doc.text(data.gpsVerification.timestamp, margin + 125, y + 18.5);

  y += 24;

  // SECTION 3: SITE OBSERVATIONS
  checkPageBreak(35);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION 3: GROUND PHYSICAL OBSERVATIONS & IMPACT AUDIT', margin + 3, y + 4);

  y += 5.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 34, 'FD');

  const addField = (lbl: string, val: string, currY: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, margin + 3, currY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(val || 'N/A', margin + 48, currY);
  };

  addField('Observed Problem Condition:', data.observations.observedProblem, y + 5);
  addField('Actual Ground Situation:', data.observations.actualGroundCondition, y + 10);
  addField('Assessed Ground Severity:', `Field Assessment: ${data.observations.severityAssessment}`, y + 15);
  addField('Geographical Footprint:', data.observations.affectedArea, y + 20);
  addField('Public & Community Impact:', data.observations.communityImpact, y + 25);
  addField('Immediate Safety Hazards:', data.observations.immediateRisks, y + 30);

  y += 38;

  // SECTION 4: STRUCTURED VERIFICATION QUESTIONS
  if (data.structuredQuestions) {
    checkPageBreak(25);
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('SECTION 4: STRUCTURED FIELD VERIFICATION PROTOCOL', margin + 3, y + 4);

    y += 5.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    const sq = data.structuredQuestions;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`1. Reported Issue Present on Ground?  [ ${sq.isIssuePresent} ]`, margin + 3, y + 5);
    doc.text(`2. Physical Location Matches Coordinates?  [ ${sq.isLocationMatch} ]`, margin + 95, y + 5);

    doc.text(`3. Issue Currently Active & Unresolved?  [ ${sq.isIssueActive} ]`, margin + 3, y + 10);
    doc.text(`4. Immediate Emergency Intervention Required?  [ ${sq.isImmediateInterventionRequired} ]`, margin + 95, y + 10);

    doc.text(`5. Condition Change Since Citizen Filing:  [ ${sq.conditionChange} ]`, margin + 3, y + 15);
    doc.text(`6. Visible Public Safety Risks:  [ ${sq.visibleSafetyRisks} ]`, margin + 95, y + 15);

    y += 22;
  }

  // SECTION 5: VERIFICATION RESULT & ULB DECISION RULE
  checkPageBreak(30);
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION 5: OFFICIAL FIELD VERIFICATION RESULT', margin + 3, y + 4);

  y += 5.5;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 26, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FIELD VERIFICATION RESULT:', margin + 3, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (data.verificationResult.result === 'Verified') {
    doc.setTextColor(5, 150, 105);
  } else if (data.verificationResult.result === 'Requires Follow-up') {
    doc.setTextColor(217, 119, 6);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(data.verificationResult.result.toUpperCase(), margin + 55, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICER REMARKS:', margin + 3, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const splitRemarks = doc.splitTextToSize(data.verificationResult.remarks, contentWidth - 40);
  doc.text(splitRemarks, margin + 35, y + 11);

  // Administrative Rule Notice Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + 2, y + 17, contentWidth - 4, 7, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 28, 28);
  doc.text(
    'IMPORTANT ULB RULE: Field verification submission provides ground truth and does NOT automatically close the challenge.',
    margin + 4,
    y + 21
  );
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Final administrative closure decision is exercised strictly by authorized Municipal / ULB executive authority.',
    margin + 4,
    y + 23.5
  );

  y += 30;

  // SECTION 6: EVIDENCE SUMMARY & SIGNATURE SEAL
  checkPageBreak(30);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EVIDENCE ATTACHMENTS VERIFIED:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Photographs Captured: ${data.evidenceSummary.photoCount}   |   Video Files: ${data.evidenceSummary.videoCount}   |   Integrity Timestamp Verified`,
    margin + 3,
    y + 9
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFICATION SEAL', pageWidth - margin - 48, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Authenticated by Field Worker', pageWidth - margin - 48, y + 9);
  doc.text(`Timestamp: ${new Date().toISOString()}`, pageWidth - margin - 48, y + 12);
  doc.text(`ULB Node: Anand Municipal Corp`, pageWidth - margin - 48, y + 15);

  // Draw header and footers for all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawHeaderFooter(p, totalPages);
  }

  return doc;
}
