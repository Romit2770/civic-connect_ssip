import { jsPDF } from 'jspdf';

export interface MunicipalityReportData {
  reportId: string;
  reportType: string;
  period: string;
  generatedDate: string;
  preparedBy: string;
  municipalityName: string;
  district: string;
  state: string;
  summary: {
    totalChallenges: number;
    verifiedChallenges: number;
    pendingValidation: number;
    activeProjects: number;
    completedProjects: number;
    participatingUniversities: number;
    industryPartners: number;
    citizensBenefited: string;
  };
  challenges?: Array<{
    id: string;
    problem: string;
    category: string;
    ward: string;
    priority: string;
    status: string;
    projectStatus: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    university: string;
    industry: string;
    ward: string;
    progress: number;
    status: string;
  }>;
  wardDistribution?: Array<{
    ward: string;
    total: number;
    verified: number;
    resolved: number;
  }>;
}

export function generateMunicipalityPdfReport(data: MunicipalityReportData): jsPDF {
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

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 16;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top Tricolor stripe
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
    doc.text('CIVICCONNECT — MUNICIPAL & URBAN LOCAL BODY INNOVATION PLATFORM', margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Government of India • Ministry of Housing & Urban Affairs', pageWidth - margin, 12, { align: 'right' });

    // Header divider line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 13.5, pageWidth - margin, 13.5);

    // Footer divider line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `CivicConnect Official Municipal Report • ${data.municipalityName}, ${data.state} • Confidential ULB Record`,
      margin,
      pageHeight - 8
    );
    const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // 1. Draw First Page Header
  drawHeaderFooter();
  y = 20;

  // Title Block
  doc.setFillColor(19, 48, 84); // Institutional Navy
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MUNICIPALITY CIVIC CHALLENGE & OPERATIONS REPORT', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(254, 240, 138); // Soft Gold/Amber
  doc.text(`${data.municipalityName} (${data.district}, ${data.state}) • ULB Code: GUJ-ANAND-024`, margin + 6, y + 14);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(7.5);
  doc.text(`Reporting Period: ${data.period} | Generated: ${new Date(data.generatedDate).toLocaleString('en-IN')}`, margin + 6, y + 19);

  y += 26;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Report ID: ${data.reportId}`, margin + 4, y + 5);
  doc.text(`Report Type: ${data.reportType}`, margin + 65, y + 5);
  doc.text(`Prepared By: ${data.preparedBy}`, margin + 125, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Jurisdiction: 14 Municipal Wards`, margin + 4, y + 10);
  doc.text(`Beneficiaries: ${data.summary.citizensBenefited}`, margin + 65, y + 10);
  doc.text(`Statutory Status: Verified Administrative Audit`, margin + 125, y + 10);

  y += 18;

  // 1. EXECUTIVE SUMMARY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('1. Executive Summary', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const execSummary = `This statutory operational report presents the quarterly civic issue triage, geographical distribution, and collaborative research resolution status for ${data.municipalityName}. During the reporting period, the municipality logged ${data.summary.totalChallenges} civic challenges reported by citizens. A total of ${data.summary.verifiedChallenges} challenges have been officially verified by municipal engineers and assigned to ${data.summary.participatingUniversities} participating universities and ${data.summary.industryPartners} corporate partners for technical resolution. Currently, ${data.summary.activeProjects} civic innovation projects are actively deployed on the ground, with ${data.summary.completedProjects} historical projects resolved with verified public impact benefiting over ${data.summary.citizensBenefited} verified residents.`;
  const splitExec = doc.splitTextToSize(execSummary, contentWidth);
  doc.text(splitExec, margin, y);
  y += splitExec.length * 3.8 + 3;

  // KPI Metric Cards (6 cards in 2 rows)
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 13;

  const kpis = [
    { label: 'TOTAL CHALLENGES', val: String(data.summary.totalChallenges), sub: 'Reported in Jurisdiction' },
    { label: 'PENDING VALIDATION', val: String(data.summary.pendingValidation), sub: 'Awaiting Municipal Review' },
    { label: 'ACTIVE PROJECTS', val: String(data.summary.activeProjects), sub: 'Under Implementation' },
    { label: 'COMPLETED PROJECTS', val: String(data.summary.completedProjects), sub: 'Resolved & Commissioned' },
    { label: 'UNIVERSITY PARTNERS', val: String(data.summary.participatingUniversities), sub: 'Engineering HEIs' },
    { label: 'INDUSTRY PARTNERS', val: String(data.summary.industryPartners), sub: 'CSR & Tech Sponsors' },
  ];

  for (let i = 0; i < kpis.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cardX = margin + col * (cardWidth + 4);
    const cardY = y + row * (cardHeight + 3);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpis[i].label, cardX + 3, cardY + 4);

    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpis[i].val, cardX + 3, cardY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpis[i].sub, cardX + 3, cardY + 12);
  }
  y += (cardHeight + 3) * 2 + 5;

  // 2. CHALLENGE OVERVIEW & RECENT LOGS
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('2. Challenge Overview & Triage Queue', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('ID', margin + 2, y + 4.2);
  doc.text('PROBLEM STATEMENT', margin + 22, y + 4.2);
  doc.text('CATEGORY', margin + 92, y + 4.2);
  doc.text('WARD', margin + 128, y + 4.2);
  doc.text('PRIORITY', margin + 148, y + 4.2);
  doc.text('STATUS', margin + 166, y + 4.2);
  y += 6;

  const sampleChallenges = data.challenges || [
    { id: 'CH-2026-089', problem: 'Overflowing Drainage Network & Surcharge', category: 'Water & Sanitation', ward: 'Ward 12', priority: 'HIGH', status: 'Verified', projectStatus: 'Assigned' },
    { id: 'CH-2026-092', problem: 'Market Waste Accumulation & Stray Cattle', category: 'Solid Waste Management', ward: 'Ward 8', priority: 'HIGH', status: 'In Progress', projectStatus: 'In Progress' },
    { id: 'CH-2026-104', problem: 'Arterial Road Sub-base Failure & Potholes', category: 'Roads & Infrastructure', ward: 'Ward 4', priority: 'CRITICAL', status: 'Verified', projectStatus: 'In Progress' },
    { id: 'CH-2026-042', problem: 'Smart Streetlight Grid Phase Imbalance', category: 'Street Lighting', ward: 'Ward 5', priority: 'MEDIUM', status: 'Resolved', projectStatus: 'Completed' },
    { id: 'CH-2026-115', problem: 'Potable Water Contamination & Odor', category: 'Public Health', ward: 'Ward 2', priority: 'CRITICAL', status: 'Pending', projectStatus: 'Unassigned' },
  ];

  sampleChallenges.forEach((item, idx) => {
    checkPageBreak(8);
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 58, 138);
    doc.text(item.id, margin + 2, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(doc.splitTextToSize(item.problem, 68)[0] || item.problem, margin + 22, y + 4.2);

    doc.text(item.category, margin + 92, y + 4.2);
    doc.text(item.ward, margin + 128, y + 4.2);

    if (item.priority === 'CRITICAL') doc.setTextColor(185, 28, 28);
    else if (item.priority === 'HIGH') doc.setTextColor(194, 65, 12);
    else doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(item.priority, margin + 148, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(item.status, margin + 166, y + 4.2);

    y += 6;
  });
  y += 5;

  // 3. CATEGORY & WARD-WISE DISTRIBUTION
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('3. Category & Ward-wise Geospatial Breakdown', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Anand Municipality comprises 14 administrative wards. Challenges are geographically categorized:', margin, y);
  y += 5;

  const categories = [
    { name: 'Water & Sanitation', share: '28%', issues: '68 Reported', state: '52 Resolved (76%)' },
    { name: 'Roads & Infrastructure', share: '22%', issues: '54 Reported', state: '38 Resolved (70%)' },
    { name: 'Solid Waste Management', share: '19%', issues: '46 Reported', state: '36 Resolved (78%)' },
    { name: 'Street Lighting & Grid', share: '13%', issues: '32 Reported', state: '28 Resolved (88%)' },
    { name: 'Drainage & Stormwater', share: '10%', issues: '25 Reported', state: '17 Resolved (68%)' },
  ];

  categories.forEach((cat) => {
    checkPageBreak(5);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, 42, 4.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(cat.name, margin + 2, y + 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Share: ${cat.share} | ${cat.issues} | Resolution Status: ${cat.state}`, margin + 46, y + 3.2);
    y += 5;
  });
  y += 4;

  // 4. ACTIVE PROJECTS & UNIVERSITY-INDUSTRY COLLABORATION
  checkPageBreak(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('4. Innovation Projects & Industry-University Partnerships', margin, y);
  y += 5;

  const sampleProjects = data.projects || [
    { id: 'PRJ-ANAND-014', name: 'Smart Ultrasonic Trunk Sewer Flow & Silt Warning', university: 'BVM Engineering College', industry: 'Elecon Engineering Ltd.', ward: 'Ward 12', progress: 68, status: 'Active' },
    { id: 'PRJ-ANAND-018', name: 'Smart Waste Compactor & Bio-Digestion Station', university: 'Charusat University (DEPSTAR)', industry: 'Amul (GCMMF)', ward: 'Ward 8', progress: 42, status: 'Delayed' },
    { id: 'PRJ-ANAND-021', name: 'Polymer Cold Mix Bituminous Wet Pothole Patching', university: 'GCET Engineering College', industry: 'Larsen & Toubro Ltd.', ward: 'Ward 4', progress: 55, status: 'Active' },
    { id: 'PRJ-ANAND-008', name: 'Automated Streetlight Grid Phase Balancer', university: 'BVM Engineering College', industry: 'Tata Consultancy Services', ward: 'Ward 5', progress: 100, status: 'Completed' },
  ];

  // Project Table Header
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('PROJECT ID', margin + 2, y + 3.8);
  doc.text('PROJECT TITLE', margin + 28, y + 3.8);
  doc.text('UNIVERSITY HEI', margin + 98, y + 3.8);
  doc.text('CSR / INDUSTRY', margin + 138, y + 3.8);
  doc.text('PROGRESS', margin + 170, y + 3.8);
  y += 5.5;

  sampleProjects.forEach((prj, idx) => {
    checkPageBreak(6);
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text(prj.id, margin + 2, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(doc.splitTextToSize(prj.name, 68)[0] || prj.name, margin + 28, y + 3.8);

    doc.text(doc.splitTextToSize(prj.university, 38)[0] || prj.university, margin + 98, y + 3.8);
    doc.text(doc.splitTextToSize(prj.industry, 30)[0] || prj.industry, margin + 138, y + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(prj.progress === 100 ? 22 : 30, prj.progress === 100 ? 101 : 58, prj.progress === 100 ? 52 : 138);
    doc.text(`${prj.progress}% (${prj.status})`, margin + 170, y + 3.8);

    y += 5.5;
  });
  y += 6;

  // 5. CITIZEN IMPACT & VERIFIABLE OUTCOMES
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('5. Citizen Beneficiaries & Physical Infrastructure Impact', margin, y);
  y += 4;

  const impacts = [
    '• 1,42,500 verified residents directly benefited from rehabilitated water networks and cleared drainage corridors.',
    '• 46 km road network restored with rapid cold mix polymer asphalt, with zero reported reopenings over 6 months.',
    '• 420 metric tonnes of organic market waste diverted from open dumping to anaerobic bio-digestion at APMC Yard.',
    '• 99.8% nocturnal streetlight uptime restored on the critical student corridor connecting Anand and Vallabh Vidyanagar.',
    '• Estimated ₹34,50,000 public capital saved by leveraging university R&D prototyping versus commercial procurement.',
  ];

  impacts.forEach((imp) => {
    checkPageBreak(5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(imp, margin + 2, y);
    y += 4.2;
  });
  y += 4;

  // 6. RECOMMENDATIONS & STATUTORY SIGN-OFF
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(19, 48, 84);
  doc.text('6. Administrative Recommendations & Municipal Directives', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const recText = '1. Expedite supplier delivery of high-torque shredder motor for the Ward 8 APMC bio-compactor pilot.\n2. Extend LoRaWAN ultrasonic water level nodes into Wards 1, 4 and 11 prior to pre-monsoon desilting operations.\n3. Institutionalize formal quarterly review with BVM, Charusat, and GCET research deans under ULB auspices.';
  const splitRec = doc.splitTextToSize(recText, contentWidth);
  doc.text(splitRec, margin, y);
  y += splitRec.length * 3.8 + 6;

  // Signature Block
  checkPageBreak(25);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + 65, y);
  doc.line(pageWidth - margin - 65, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Shri Jayeshbhai Trivedi, GAS', margin, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Officer & Administrative Head', margin, y + 7.5);
  doc.text('Anand Municipality (Urban Local Body), Gujarat', margin, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Municipal Operations & IT Cell', pageWidth - margin - 65, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('CivicConnect Digital Command Hub', pageWidth - margin - 65, y + 7.5);
  doc.text('National Informatics Centre (NIC) Validated', pageWidth - margin - 65, y + 11);

  return doc;
}
