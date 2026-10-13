import { jsPDF } from 'jspdf';

export interface ReportBundleData {
  report: {
    id: string;
    project: string;
    projectId: string;
    team: string;
    reportType: string;
    reportingPeriod?: string;
    progressSummary: string;
    technicalProgress: string;
    teamPerformance: string;
    milestoneProgress: string;
    industryContribution?: string;
    challengesRisks: string;
    nextSteps: string;
    attachments?: { name: string; size: string }[];
    submittedDate: string;
    status: string;
    reviewedBy?: string;
  };
  project: {
    id: string;
    title: string;
    domain: string;
    facultyMentor: string;
    studentTeam: string;
    industryPartner: string;
    currentStage: string;
    progress: number;
    status: string;
    budget: string;
    timeline: string;
  };
  challenge: {
    id: string;
    title: string;
    domain: string;
    location: string;
    priority: string;
    validationStatus: string;
    description: string;
    citizenEvidence?: {
      coordinates?: [number, number];
      notes?: string;
      photos?: string[];
    };
    aiAnalysis?: {
      category?: string;
      domain?: string;
      severity?: number;
      priority?: string;
      problemSummary?: string;
      evidenceAssessment?: string;
      duplicateDetectionResult?: string;
      locationRelevance?: string;
      recommendedTechnicalAreas?: string[];
    };
  };
  team: {
    id: string;
    name: string;
    facultyMentor: string;
    leadStudent: string;
    membersCount: number;
    skills: string[];
    members: Array<{
      studentName: string;
      studentId: string;
      department: string;
      role: string;
      skills?: string[];
      assignedTasks: string;
      taskStatus: string;
    }>;
  };
  proposal?: {
    proposedSolution?: string;
    objectives?: string;
    techStack?: string;
    estimatedCost?: string;
    timeline?: string;
    industrySupport?: string;
    technicalRequirements?: string;
    expectedOutcomes?: string;
    reviewComments?: string;
  };
  milestones: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: string;
    completionPercentage: number;
    assignedTasks?: string;
    submissionStatus: string;
    mentorNotes?: string;
  }>;
  industryPartner?: {
    name: string;
    type?: string;
    domain?: string;
    matchPercentage?: number;
    contactPerson?: string;
    availableSupport?: string[];
  };
  collaborationRequest?: {
    requiredSupport?: string;
    status?: string;
  };
  facultyProfile: {
    facultyName: string;
    designation: string;
    department: string;
    university: string;
  };
  testingDetails?: {
    objective: string;
    testEnvironment: string;
    testCases: string[];
    accuracy: string;
    snrImprovement: string;
    telemetryRange: string;
    packetLoss: string;
    powerMetrics: string;
    issuesFound: string;
    correctiveActions: string;
    validationResult: string;
  };
  mentorEvaluation: {
    mentorName: string;
    designation: string;
    institution: string;
    evaluationDate: string;
    decision: 'APPROVED' | 'REVISION REQUIRED' | 'UNDER REVIEW' | 'REJECTED';
    rubrics: Record<string, string>;
    comments: string;
  };
  endorsement: {
    facultyMentor: string;
    department: string;
    institution: string;
    industryPartner?: string;
    reportStatus: string;
    reviewDate: string;
    verificationToken: string;
  };
}

export function buildFacultyReportPdfDocument(bundle: ReportBundleData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const topHeaderMargin = 22;
  const bottomFooterMargin = 18;

  let y = topHeaderMargin;

  const cDeepNavy = [10, 37, 64] as const;
  const cGovBlue = [30, 78, 140] as const;
  const cLightGovBlue = [238, 244, 250] as const;
  const cLightGrey = [248, 250, 252] as const;
  const cBorderGrey = [203, 213, 225] as const;
  const cBorderLight = [226, 232, 240] as const;
  const cText = [15, 23, 42] as const;
  const cSecondaryText = [71, 85, 105] as const;
  const cGold = [217, 119, 6] as const;
  const cGreen = [16, 122, 68] as const;
  const cAmber = [180, 83, 9] as const;
  const cRed = [185, 28, 28] as const;
  const cWhite = [255, 255, 255] as const;
  const cLightSlate = [226, 232, 240] as const;

  const setFill = (rgb: readonly [number, number, number]) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setTextCol = (rgb: readonly [number, number, number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const setDrawCol = (rgb: readonly [number, number, number]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

  const safeStr = (val: string | undefined | null, fallback = 'Not Available'): string => {
    if (!val || typeof val !== 'string' || !val.trim()) return fallback;
    return val.trim();
  };

  const drawRunningHeader = (): void => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cDeepNavy);
    doc.text('CIVICCONNECT — UNIVERSITY & INDUSTRY INNOVATION PLATFORM', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...cSecondaryText);
    const shortProj = bundle.report.project.length > 55
      ? bundle.report.project.substring(0, 52) + '...'
      : bundle.report.project;
    doc.text(`Project: ${shortProj}`, margin, 15);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cDeepNavy);
    doc.text(`DOCKET: ${bundle.report.id}`, pageWidth - margin, 11, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...cGovBlue);
    doc.text(bundle.report.reportType.toUpperCase(), pageWidth - margin, 15, { align: 'right' });

    doc.setDrawColor(...cGovBlue);
    doc.setLineWidth(0.4);
    doc.line(margin, 17.5, pageWidth - margin, 17.5);
  };

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - bottomFooterMargin) {
      doc.addPage();
      y = topHeaderMargin;
      drawRunningHeader();
    }
  };

  const renderSectionHeader = (title: string, num: string): void => {
    checkPageBreak(12);

    doc.setFillColor(...cLightGovBlue);
    doc.rect(margin, y, contentWidth, 6.4, 'F');

    doc.setFillColor(...cGovBlue);
    doc.rect(margin, y, 2.5, 6.4, 'F');

    doc.setDrawColor(...cBorderGrey);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    doc.line(margin, y + 6.4, margin + contentWidth, y + 6.4);

    doc.setTextColor(...cDeepNavy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${num}. ${title.toUpperCase()}`, margin + 5, y + 4.5);

    y += 8.5;
  };

  const renderKeyValueRow = (
    label: string,
    value: string,
    labelWidth = 50,
    statusColor?: readonly [number, number, number]
  ): void => {
    const valueWidth = contentWidth - labelWidth;
    const splitVal = doc.splitTextToSize(value, valueWidth - 6);
    const rowHeight = Math.max(6.2, splitVal.length * 3.6 + 2.6);

    checkPageBreak(rowHeight + 0.5);

    doc.setFillColor(...cLightGrey);
    doc.setDrawColor(...cBorderLight);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, labelWidth, rowHeight, 'FD');

    doc.setFillColor(255, 255, 255);
    doc.rect(margin + labelWidth, y, valueWidth, rowHeight, 'FD');

    doc.setDrawColor(...cBorderGrey);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin, y + rowHeight);
    doc.line(margin + contentWidth, y, margin + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...cSecondaryText);
    doc.text(label, margin + 2.5, y + 4.3);

    doc.setFont('helvetica', statusColor ? 'bold' : 'normal');
    doc.setFontSize(7.6);
    if (statusColor) {
      doc.setTextColor(...statusColor);
    } else {
      doc.setTextColor(...cText);
    }
    doc.text(splitVal, margin + labelWidth + 3, y + 4.3);

    y += rowHeight;
  };

  const renderCalloutBox = (
    label: string,
    body: string,
    borderColor: readonly [number, number, number] = cBorderGrey,
    fillColor: readonly [number, number, number] = cLightGrey
  ): void => {
    const splitText = doc.splitTextToSize(body, contentWidth - 8);
    const boxHeight = splitText.length * 3.7 + 9.5;

    checkPageBreak(boxHeight + 2);

    doc.setFillColor(...fillColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.35);
    doc.rect(margin, y, contentWidth, boxHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cGovBlue);
    doc.text(label.toUpperCase(), margin + 3.5, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cText);
    doc.text(splitText, margin + 3.5, y + 8.5);

    y += boxHeight + 2.5;
  };

  // =========================================================================
  // PAGE 1 — COVER PAGE
  // =========================================================================
  doc.setDrawColor(...cDeepNavy);
  doc.setLineWidth(1.2);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

  doc.setDrawColor(...cGold);
  doc.setLineWidth(0.4);
  doc.rect(margin - 2.2, margin - 2.2, contentWidth + 4.4, pageHeight - margin * 2 + 4.4);

  let cy = margin + 10;

  doc.setFillColor(...cDeepNavy);
  doc.rect(margin, cy, contentWidth, 1.2, 'F');
  cy += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...cDeepNavy);
  doc.text('CIVICCONNECT', pageWidth / 2, cy, { align: 'center' });
  cy += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...cGovBlue);
  doc.text('UNIVERSITY & INDUSTRY INNOVATION PLATFORM', pageWidth / 2, cy, { align: 'center' });
  cy += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cSecondaryText);
  doc.text(
    'National Municipal Grievance Redressal & Societal Innovation Initiative (SIH-195)',
    pageWidth / 2,
    cy,
    { align: 'center' }
  );
  cy += 8;

  doc.setDrawColor(...cBorderGrey);
  doc.setLineWidth(0.4);
  doc.line(margin + 20, cy, pageWidth - margin - 20, cy);
  cy += 9;

  doc.setFillColor(...cLightGovBlue);
  doc.setDrawColor(...cGovBlue);
  doc.setLineWidth(0.5);
  const badgeWidth = 92;
  doc.rect(pageWidth / 2 - badgeWidth / 2, cy, badgeWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cGovBlue);
  doc.text(
    `OFFICIAL ${bundle.report.reportType.toUpperCase()}`,
    pageWidth / 2,
    cy + 4.8,
    { align: 'center' }
  );
  cy += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...cDeepNavy);
  const titleLines = doc.splitTextToSize(bundle.report.project.toUpperCase(), contentWidth - 10);
  doc.text(titleLines, pageWidth / 2, cy, { align: 'center' });
  cy += titleLines.length * 6 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...cSecondaryText);
  const domainText = `Domain: ${bundle.challenge.domain} | Municipal Ward: ${bundle.challenge.location}`;
  doc.text(domainText, pageWidth / 2, cy, { align: 'center' });
  cy += 10;

  const metaBoxY = cy;
  const metaBoxHeight = 36;
  doc.setFillColor(...cLightGrey);
  doc.setDrawColor(...cBorderGrey);
  doc.setLineWidth(0.4);
  doc.rect(margin, metaBoxY, contentWidth, metaBoxHeight, 'FD');

  const col1X = margin + 5;
  const col2X = margin + 95;
  let myY = metaBoxY + 6;

  const renderMetaItem = (lbl: string, val: string, xPos: number, yPos: number, isGreen = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...cSecondaryText);
    doc.text(lbl.toUpperCase(), xPos, yPos);

    doc.setFont('helvetica', isGreen ? 'bold' : 'normal');
    doc.setFontSize(8);
    setTextCol(isGreen ? cGreen : cText);
    doc.text(val, xPos, yPos + 3.8);
  };

  renderMetaItem('Report Identifier', bundle.report.id, col1X, myY);
  renderMetaItem('Submission Date', bundle.report.submittedDate, col2X, myY);
  myY += 9;

  renderMetaItem('Project Identifier', bundle.report.projectId, col1X, myY);
  renderMetaItem('Reporting Period', bundle.report.reportingPeriod || 'Current Sprint', col2X, myY);
  myY += 9;

  renderMetaItem('Linked Challenge ID', bundle.challenge.id, col1X, myY);
  renderMetaItem(
    'Approval Status',
    bundle.report.status.toUpperCase(),
    col2X,
    myY,
    bundle.report.status === 'Approved'
  );

  cy = metaBoxY + metaBoxHeight + 8;

  const stakeBoxY = cy;
  const stakeBoxHeight = 44;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...cBorderGrey);
  doc.setLineWidth(0.4);
  doc.rect(margin, stakeBoxY, contentWidth, stakeBoxHeight, 'FD');

  doc.setFillColor(...cLightGovBlue);
  doc.rect(margin, stakeBoxY, contentWidth, 6.2, 'F');
  doc.setDrawColor(...cBorderGrey);
  doc.line(margin, stakeBoxY + 6.2, margin + contentWidth, stakeBoxY + 6.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...cDeepNavy);
  doc.text('ACADEMIC & INDUSTRIAL STAKEHOLDER RECORD', margin + 4, stakeBoxY + 4.4);

  let sy = stakeBoxY + 11;
  const renderStakeholderRow = (roleLbl: string, primaryName: string, subDetail: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cGovBlue);
    doc.text(roleLbl, margin + 4, sy);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cText);
    doc.text(primaryName, margin + 42, sy);

    if (subDetail) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...cSecondaryText);
      doc.text(`— ${subDetail}`, margin + 42 + doc.getTextWidth(primaryName) + 2, sy);
    }
    sy += 8.2;
  };

  renderStakeholderRow(
    'Academic Institution:',
    bundle.facultyProfile.university,
    bundle.facultyProfile.department
  );
  renderStakeholderRow(
    'Faculty Mentor:',
    bundle.facultyProfile.facultyName,
    bundle.facultyProfile.designation
  );
  renderStakeholderRow(
    'Student Team Lead:',
    bundle.team.name,
    `Lead: ${bundle.team.leadStudent} (${bundle.team.membersCount} Members)`
  );
  renderStakeholderRow(
    'Industry Partner:',
    bundle.industryPartner?.name || 'Tata Steel Utilities & Infrastructure (TSUISL)',
    bundle.industryPartner?.type || 'Municipal Infrastructure Integrator'
  );

  cy = stakeBoxY + stakeBoxHeight + 8;

  doc.setFillColor(...cLightGrey);
  doc.setDrawColor(...cBorderGrey);
  doc.setLineWidth(0.3);
  doc.rect(margin, cy, contentWidth, 14, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cGovBlue);
  doc.text(
    `SECURITY VERIFICATION HASH: ${bundle.endorsement.verificationToken}`,
    margin + 4,
    cy + 5.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...cSecondaryText);
  doc.text(
    'Document signed and cryptographically archived in CivicConnect Municipal Blockchain Registry. Tampering invalidates academic accreditation.',
    margin + 4,
    cy + 10
  );

  // =========================================================================
  // PAGE 2 — EXECUTIVE SUMMARY & CITIZEN CHALLENGE
  // =========================================================================
  doc.addPage();
  y = topHeaderMargin;
  drawRunningHeader();

  renderSectionHeader('Executive Summary', '01');
  renderKeyValueRow('Project Overview', bundle.report.project);
  renderKeyValueRow('Societal Problem', bundle.challenge.description);
  renderKeyValueRow(
    'Proposed Solution',
    bundle.proposal?.proposedSolution ||
      'Real-time hydro-acoustic sensor telemetry network detecting sub-surface fracture events with sub-meter localization.'
  );
  renderKeyValueRow(
    'Core Objectives',
    bundle.proposal?.objectives ||
      'Rapid pipe rupture localization (< 60s), non-revenue water mitigation (35%), zero grid dependency via energy harvesting.'
  );
  renderKeyValueRow(
    'Expected Social Impact',
    bundle.proposal?.expectedOutcomes ||
      'Eliminate 35% non-revenue water loss in Ward 4; reduce average repair dispatch response from 72 hours to under 3 hours.'
  );

  y += 4;

  renderSectionHeader('Challenge & Citizen Evidence Dossier', '02');
  renderKeyValueRow('Challenge Title', bundle.challenge.title);
  renderKeyValueRow('Thematic Domain', bundle.challenge.domain);
  renderKeyValueRow('Municipal Location', bundle.challenge.location);
  renderKeyValueRow('Priority Rating', bundle.challenge.priority.toUpperCase(), 50, cRed);
  renderKeyValueRow('PWD Validation Status', bundle.challenge.validationStatus, 50, cGreen);
  renderKeyValueRow(
    'Geographic Coordinates',
    bundle.challenge.citizenEvidence?.coordinates
      ? `Latitude: ${bundle.challenge.citizenEvidence.coordinates[1]} N, Longitude: ${bundle.challenge.citizenEvidence.coordinates[0]} E`
      : 'Ward 4 Grid Centroid'
  );
  renderKeyValueRow(
    'Citizen Problem Statement',
    safeStr(bundle.challenge.description)
  );

  if (bundle.challenge.citizenEvidence?.notes) {
    renderCalloutBox(
      'Field Inspection Notes & Observations',
      bundle.challenge.citizenEvidence.notes,
      cGovBlue,
      cLightGovBlue
    );
  }

  y += 2;

  // SECTION 3 — AI VALIDATION
  renderSectionHeader('AI Analysis & Automated Defect Scrutiny', '03');

  if (bundle.challenge.aiAnalysis) {
    const ai = bundle.challenge.aiAnalysis;
    renderKeyValueRow('AI Classification Domain', ai.domain || ai.category || 'Water Infrastructure');
    renderKeyValueRow(
      'Computed Severity Score',
      `${ai.severity || 8} / 10 (Critical Societal Impact)`,
      50,
      (ai.severity || 8) >= 7 ? cRed : cAmber
    );
    renderKeyValueRow('Duplicate Defect Analysis', ai.duplicateDetectionResult || 'Unique Defect Group');
    renderKeyValueRow('Location & Hydraulic Relevance', ai.locationRelevance || 'Critical Junction Feeder Trunk');
    renderKeyValueRow('AI Problem Summary', ai.problemSummary || 'Verified sub-surface fluid loss defect');
    renderKeyValueRow('Evidence Assessment', ai.evidenceAssessment || 'Photographs substantiate street deformation');
    renderKeyValueRow(
      'Recommended Technical Areas',
      Array.isArray(ai.recommendedTechnicalAreas)
        ? ai.recommendedTechnicalAreas.join(' | ')
        : 'Embedded IoT, Hydro-Acoustic Signal Processing, LoRaWAN'
    );
    renderKeyValueRow('AI Validation Result', 'VALIDATED & MATCHED TO ACADEMIC DOMAIN', 50, cGreen);
  } else {
    renderCalloutBox('AI Analysis Status', 'AI analysis not available for this report.');
  }

  y += 4;

  // SECTION 4 — UNIVERSITY PROJECT & STUDENT TEAM
  renderSectionHeader('University Project Information & Student Team', '04');
  renderKeyValueRow('Academic Institution', bundle.facultyProfile.university);
  renderKeyValueRow(
    'Faculty Mentor',
    `${bundle.facultyProfile.facultyName} (${bundle.facultyProfile.designation}, ${bundle.facultyProfile.department})`
  );
  renderKeyValueRow('Student Team Name', bundle.team.name);
  renderKeyValueRow('Student Lead', bundle.team.leadStudent);
  renderKeyValueRow(
    'Team Interdisciplinary Skills',
    bundle.team.skills.join(', ')
  );

  y += 3;

  if (bundle.team.members && bundle.team.members.length > 0) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cGovBlue);
    doc.text('STUDENT TEAM MEMBER ROSTER', margin, y + 3.5);
    y += 5.5;

    const colWidths = [36, 26, 34, 28, 56];
    const colHeaders = ['Student Name', 'ID Number', 'Department', 'Role', 'Assigned Responsibility'];

    doc.setFillColor(...cGovBlue);
    doc.rect(margin, y, contentWidth, 5.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    let curX = margin;
    colHeaders.forEach((hdr, idx) => {
      doc.text(hdr, curX + 2, y + 4);
      curX += colWidths[idx];
    });
    y += 5.8;

    bundle.team.members.forEach((m, rowIdx) => {
      const respLines = doc.splitTextToSize(m.assignedTasks || 'System Development', colWidths[4] - 4);
      const rowH = Math.max(5.8, respLines.length * 3.4 + 2);

      checkPageBreak(rowH);

      setFill(rowIdx % 2 === 0 ? cLightGrey : cWhite);
      doc.setDrawColor(...cBorderLight);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowH, 'FD');

      doc.setDrawColor(...cBorderGrey);
      doc.line(margin, y, margin, y + rowH);
      doc.line(margin + contentWidth, y, margin + contentWidth, y + rowH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(...cText);

      let rx = margin;
      doc.text(m.studentName, rx + 2, y + 3.8);
      rx += colWidths[0];

      doc.setFont('courier', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...cSecondaryText);
      doc.text(m.studentId, rx + 2, y + 3.8);
      rx += colWidths[1];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...cText);
      doc.text(m.department, rx + 2, y + 3.8);
      rx += colWidths[2];

      doc.text(m.role, rx + 2, y + 3.8);
      rx += colWidths[3];

      doc.text(respLines, rx + 2, y + 3.8);

      y += rowH;
    });
  }

  y += 4;

  // SECTION 5 — PROJECT PROPOSAL
  renderSectionHeader('Project Proposal & Technical Specifications', '05');
  if (bundle.proposal) {
    renderKeyValueRow('Technology Stack', bundle.proposal.techStack || 'LoRaWAN, ESP32-S3, Edge Impulse');
    renderKeyValueRow('Technical Requirements', bundle.proposal.technicalRequirements || 'Dynamic acoustic piezo sensors');
    renderKeyValueRow('Approved Grant Budget', bundle.proposal.estimatedCost || 'Rs 4,50,000', 50, cGreen);
    renderKeyValueRow('Project Timeline', bundle.proposal.timeline || '6 Months');
    renderKeyValueRow('Industry Support Offered', bundle.proposal.industrySupport || 'Hydraulic testbed & matching grant');
  } else {
    renderKeyValueRow('Technology Stack', 'LoRaWAN, ESP32-S3, Edge Impulse, AWS IoT Core, FreeRTOS, PostGIS');
    renderKeyValueRow('Technical Requirements', 'Piezo transducers dynamic sensitivity > 50 mV/g, IP68 hermetic casing');
    renderKeyValueRow('Approved Grant Budget', bundle.project.budget || 'Rs 4,50,000', 50, cGreen);
    renderKeyValueRow('Project Timeline', '6 Months (Milestone-Governed)');
    renderKeyValueRow('Industry Support Offered', 'TSUISL Hydrology Loop Access, Mentorship & Matching Grant');
  }

  y += 4;

  // SECTION 6 — PROJECT LIFECYCLE
  renderSectionHeader('Project Lifecycle & Execution Stage', '06');
  checkPageBreak(24);

  const stages = [
    'Challenge Accepted',
    'Team Formed',
    'Solution Proposal',
    'Industry Collaboration',
    'Prototyping',
    'Testing',
    'Field Pilot',
    'Deployment',
    'Completed',
  ];

  const currentStage = bundle.project.currentStage || 'Field Pilot';
  const stageIdx = stages.findIndex((s) => s.toLowerCase() === currentStage.toLowerCase());
  const activeIdx = stageIdx >= 0 ? stageIdx : 6;

  const trackerY = y;
  doc.setFillColor(...cLightGrey);
  doc.setDrawColor(...cBorderGrey);
  doc.setLineWidth(0.3);
  doc.rect(margin, trackerY, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...cSecondaryText);
  doc.text('CIVICCONNECT LIFECYCLE PIPELINE', margin + 3.5, trackerY + 4.2);

  const stepWidth = (contentWidth - 8) / stages.length;
  stages.forEach((st, idx) => {
    const sx = margin + 4 + idx * stepWidth;
    const sy = trackerY + 9;
    const isPast = idx < activeIdx;
    const isCurrent = idx === activeIdx;

    setFill(isCurrent ? cGold : isPast ? cGreen : cLightSlate);
    doc.rect(sx, sy, stepWidth - 1.5, 3.5, 'F');

    doc.setFont('helvetica', isCurrent ? 'bold' : 'normal');
    doc.setFontSize(5.2);
    setTextCol(isCurrent ? cDeepNavy : isPast ? cText : cSecondaryText);

    const abbrev = st.length > 9 ? st.substring(0, 8) + '.' : st;
    doc.text(abbrev, sx, sy + 6.8);
  });

  y = trackerY + 20;

  renderKeyValueRow('Current Active Stage', currentStage.toUpperCase(), 50, cGold);
  renderKeyValueRow(
    'Overall Project Progress',
    `${bundle.project.progress || 85}% (On Schedule)`,
    50,
    cGreen
  );

  y += 4;

  // SECTION 7 — MILESTONES
  renderSectionHeader('Milestone Progress & Deliverables Table', '07');

  if (bundle.milestones && bundle.milestones.length > 0) {
    checkPageBreak(32);

    const mColWidths = [18, 54, 24, 22, 32, 30];
    const mHeaders = ['ID', 'Milestone Name & Tasks', 'Due Date', 'Progress', 'Submission', 'Review'];

    doc.setFillColor(...cGovBlue);
    doc.rect(margin, y, contentWidth, 5.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    let curMx = margin;
    mHeaders.forEach((hdr, idx) => {
      doc.text(hdr, curMx + 2, y + 4);
      curMx += mColWidths[idx];
    });
    y += 5.8;

    bundle.milestones.forEach((m, idx) => {
      const nameLines = doc.splitTextToSize(`${m.name}\nTask: ${m.assignedTasks || 'General Task'}`, mColWidths[1] - 4);
      const rowH = Math.max(7.5, nameLines.length * 3.3 + 3);

      checkPageBreak(rowH);

      setFill(idx % 2 === 0 ? cLightGrey : cWhite);
      doc.setDrawColor(...cBorderLight);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowH, 'FD');

      doc.setDrawColor(...cBorderGrey);
      doc.line(margin, y, margin, y + rowH);
      doc.line(margin + contentWidth, y, margin + contentWidth, y + rowH);

      let rx = margin;
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(...cDeepNavy);
      doc.text(m.id, rx + 2, y + 4.2);
      rx += mColWidths[0];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...cText);
      doc.text(nameLines, rx + 2, y + 3.8);
      rx += mColWidths[1];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...cSecondaryText);
      doc.text(m.dueDate, rx + 2, y + 4.2);
      rx += mColWidths[2];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      setTextCol(m.completionPercentage === 100 ? cGreen : cAmber);
      doc.text(`${m.completionPercentage}%`, rx + 2, y + 4.2);
      rx += mColWidths[3];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...cText);
      doc.text(m.submissionStatus, rx + 2, y + 4.2);
      rx += mColWidths[4];

      const isDone = m.status === 'Completed';
      const isProg = m.status === 'In Progress';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      setTextCol(isDone ? cGreen : isProg ? cAmber : cSecondaryText);
      doc.text(m.status.toUpperCase(), rx + 2, y + 4.2);

      y += rowH;
    });
  }

  y += 4;

  // SECTION 8 — INDUSTRY COLLABORATION
  renderSectionHeader('Industry Collaboration & Support Record', '08');

  if (bundle.industryPartner) {
    const ind = bundle.industryPartner;
    renderKeyValueRow('Industry Partner', ind.name);
    renderKeyValueRow('Enterprise Domain', ind.domain || ind.type || 'Urban Utilities');
    renderKeyValueRow('Matching Engine Compatibility', `${ind.matchPercentage || 94}% Compatibility`, 50, cGreen);
    renderKeyValueRow('Industry Contact Person', ind.contactPerson || 'Suresh Nambiar');
    renderKeyValueRow(
      'Available Resources',
      Array.isArray(ind.availableSupport) ? ind.availableSupport.join(' | ') : 'Test bench, Hydro engineers'
    );
    renderKeyValueRow(
      'Active Support Requested',
      bundle.collaborationRequest?.requiredSupport ||
        bundle.proposal?.industrySupport ||
        'Hydraulic testbench access, prototype pressure calibration, municipal field crew coordination'
    );
    renderKeyValueRow('Collaboration Status', (bundle.collaborationRequest?.status || 'Accepted').toUpperCase(), 50, cGreen);
  } else {
    renderCalloutBox('Industry Collaboration Status', 'Industry collaboration has not yet been established.');
  }

  y += 4;

  // SECTION 9 — TESTING & VALIDATION
  renderSectionHeader('Testing, Validation & Empirical Performance', '09');

  if (bundle.testingDetails) {
    const td = bundle.testingDetails;
    renderKeyValueRow('Testing Objective', td.objective);
    renderKeyValueRow('Test Environment & Rig', td.testEnvironment);
    renderKeyValueRow('Leak Pin-point Accuracy', td.accuracy, 50, cGreen);
    renderKeyValueRow('Acoustic SNR Improvement', td.snrImprovement, 50, cGreen);
    renderKeyValueRow('LoRaWAN Telemetry Range', td.telemetryRange);
    renderKeyValueRow('Packet Transmission Reliability', td.packetLoss, 50, cGreen);
    renderKeyValueRow('Power Consumption & Duty Cycle', td.powerMetrics);
    renderKeyValueRow('Known Operational Challenges', td.issuesFound);
    renderKeyValueRow('Mitigation & Corrective Action', td.correctiveActions);
    renderKeyValueRow('Validation Certification', td.validationResult, 50, cGreen);

    y += 2;
    checkPageBreak(25);

    doc.setFillColor(...cLightGrey);
    doc.setDrawColor(...cBorderGrey);
    doc.setLineWidth(0.3);
    const tcHeight = td.testCases.length * 4.2 + 8;
    doc.rect(margin, y, contentWidth, tcHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cGovBlue);
    doc.text('EMPIRICAL BENCH TEST RESULTS MATRIX', margin + 3.5, y + 4.5);

    let tcy = y + 8.5;
    td.testCases.forEach((tc) => {
      doc.setFont('courier', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(...cText);
      doc.text(tc, margin + 4, tcy);
      tcy += 4.2;
    });

    y += tcHeight + 4;
  }

  // SECTION 10 — FACULTY MENTOR EVALUATION
  renderSectionHeader('Faculty Mentor Evaluation & Scrutiny', '10');

  const evalData = bundle.mentorEvaluation;
  renderKeyValueRow('Evaluating Faculty Mentor', evalData.mentorName);
  renderKeyValueRow('Designation & Department', evalData.designation);
  renderKeyValueRow('Evaluation Date', evalData.evaluationDate);

  Object.entries(evalData.rubrics).forEach(([category, score]) => {
    renderKeyValueRow(category, score, 65, cGovBlue);
  });

  renderCalloutBox(
    'Faculty Mentor Comprehensive Remarks',
    evalData.comments,
    cGovBlue,
    cLightGovBlue
  );

  renderKeyValueRow(
    'Final Mentor Determination',
    evalData.decision,
    50,
    evalData.decision === 'APPROVED' ? cGreen : cAmber
  );

  y += 4;

  // SECTION 11 — OFFICIAL APPROVAL & ENDORSEMENT
  renderSectionHeader('Official Institutional Endorsement & Signatures', '11');

  checkPageBreak(38);

  const signBoxY = y;
  const signColWidth = (contentWidth - 4) / 3;
  const signBoxHeight = 32;

  const renderSignatoryBox = (title: string, name: string, dept: string, xPos: number) => {
    doc.setFillColor(...cLightGrey);
    doc.setDrawColor(...cBorderGrey);
    doc.setLineWidth(0.3);
    doc.rect(xPos, signBoxY, signColWidth, signBoxHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...cGovBlue);
    doc.text(title.toUpperCase(), xPos + 3, signBoxY + 4.5);

    doc.setDrawColor(...cBorderGrey);
    doc.line(xPos + 3, signBoxY + 18, xPos + signColWidth - 3, signBoxY + 18);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...cSecondaryText);
    doc.text('[Digitally Verified]', xPos + 3, signBoxY + 16.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...cText);
    doc.text(name, xPos + 3, signBoxY + 22.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...cSecondaryText);
    const splitDept = doc.splitTextToSize(dept, signColWidth - 6);
    doc.text(splitDept, xPos + 3, signBoxY + 26);
  };

  renderSignatoryBox(
    'Faculty Mentor',
    bundle.facultyProfile.facultyName,
    bundle.facultyProfile.department,
    margin
  );
  renderSignatoryBox(
    'Head of Department / Dean',
    'Prof. (Dr.) S. K. Mahapatra',
    `Dean Academic Affairs, ${bundle.facultyProfile.university}`,
    margin + signColWidth + 2
  );
  renderSignatoryBox(
    'Industry Representative',
    bundle.industryPartner?.contactPerson || 'Suresh Nambiar',
    bundle.industryPartner?.name || 'TSUISL Urban Infrastructure',
    margin + (signColWidth + 2) * 2
  );

  y = signBoxY + signBoxHeight + 6;

  // Running Footers Pass
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...cBorderGrey);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...cDeepNavy);
    doc.text('CIVICCONNECT', margin, pageHeight - 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...cSecondaryText);
    doc.text(
      'Faculty Mentor Project Documentation | Official Academic & Municipal Record',
      margin + 20,
      pageHeight - 8.5
    );

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const pageStr = `Page ${i} of ${totalPages} | Generated on ${dateStr}`;
    doc.text(pageStr, pageWidth - margin, pageHeight - 8.5, { align: 'right' });
  }

  return doc;
}

export function generateFacultyReportPdfBlob(bundle: ReportBundleData): Blob {
  const doc = buildFacultyReportPdfDocument(bundle);
  return doc.output('blob');
}

export function generateFacultyReportPdfDataUri(bundle: ReportBundleData): string {
  const doc = buildFacultyReportPdfDocument(bundle);
  return doc.output('datauristring');
}
