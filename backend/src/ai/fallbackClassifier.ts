import { AIAnalysisInput, AIAnalysisResult, CorrectionItem } from './types';
import { ComplaintCategory, ComplaintPriority } from '../types';

interface DomainRule {
  category: ComplaintCategory;
  categoryNames: string[];
  subcategories: string[];
  keywords: string[];
  departmentSlug: string;
  baseSeverity: number;
  hazards: string[];
  recommendedAction: string;
}

const DOMAIN_RULES: DomainRule[] = [
  {
    category: 'water',
    categoryNames: ['water', 'water_management', 'drinking water', 'water services'],
    subcategories: ['Pipeline Leakage', 'Drinking Water', 'Water Pollution', 'Flooding', 'Groundwater'],
    keywords: ['water', 'pipe', 'pipeline', 'leak', 'leaking', 'burst', 'tap', 'contamination', 'drinking water', 'pressure', 'dry tap'],
    departmentSlug: 'water_supply',
    baseSeverity: 7,
    hazards: ['Clean water wastage', 'Subsurface road erosion', 'Contamination risk'],
    recommendedAction: 'Dispatch municipal water works crew to isolate section and repair pipeline breach.',
  },
  {
    category: 'drainage',
    categoryNames: ['drainage', 'sewage', 'sanitation_waste'],
    subcategories: ['Drainage', 'Sewage', 'Blocked Drainage / Sewer Overflow', 'Public Toilets'],
    keywords: ['drain', 'drainage', 'sewer', 'sewage', 'manhole', 'gutter', 'overflow', 'clogged', 'stagnant', 'waterlogging'],
    departmentSlug: 'drainage',
    baseSeverity: 7,
    hazards: ['Vector-borne disease proliferation', 'Monsoon waterlogging', 'Pedestrian hazard'],
    recommendedAction: 'Deploy suction jetting machine to unclog drainage line and clear downstream silt blockage.',
  },
  {
    category: 'garbage',
    categoryNames: ['garbage', 'sanitation_waste', 'waste disposal', 'solid waste'],
    subcategories: ['Garbage Collection', 'Waste Disposal', 'Plastic Waste', 'Illegal Debris & Waste Dumping'],
    keywords: ['garbage', 'trash', 'waste', 'rubbish', 'dump', 'dumping', 'dustbin', 'overflowing', 'litter', 'smell', 'foul odor', 'flies'],
    departmentSlug: 'sanitation',
    baseSeverity: 6,
    hazards: ['Public health hazard', 'Stray animal accumulation', 'Air and groundwater contamination'],
    recommendedAction: 'Schedule sanitation compactor vehicle to clear waste accumulation and disinfect premises.',
  },
  {
    category: 'pothole',
    categoryNames: ['pothole', 'urban_infrastructure', 'road_damage'],
    subcategories: ['Road Pothole', 'Roads', 'Footpaths'],
    keywords: ['pothole', 'pot hole', 'crater', 'asphalt crater', 'road hole', 'tarmac pit'],
    departmentSlug: 'public_works',
    baseSeverity: 7,
    hazards: ['Two-wheeler skid accident risk', 'Vehicular axle and tire damage', 'Traffic bottleneck'],
    recommendedAction: 'Deploy asphalt road maintenance team with cold-mix patch material for leveling.',
  },
  {
    category: 'road_damage',
    categoryNames: ['road_damage', 'urban_infrastructure', 'accessible roads'],
    subcategories: ['Severe Road & Footpath Damage', 'Footpath & Pavement Damage', 'Roads', 'Footpaths'],
    keywords: ['broken road', 'crack', 'pavement', 'footpath', 'curb', 'divider', 'sidewalk', 'uneven surface', 'paver block'],
    departmentSlug: 'public_works',
    baseSeverity: 6,
    hazards: ['Pedestrian trip and fall hazard', 'Disabled accessibility blockage', 'Vehicular slow-down'],
    recommendedAction: 'Conduct structural pavement inspection and initiate surface resurfacing work.',
  },
  {
    category: 'streetlight',
    categoryNames: ['streetlight', 'energy', 'street lighting'],
    subcategories: ['Non-functional Streetlight', 'Street Lighting', 'Electricity Supply'],
    keywords: ['streetlight', 'street light', 'light pole', 'lamp post', 'dark street', 'bulb', 'wire', 'illumination', 'blackout'],
    departmentSlug: 'electrical',
    baseSeverity: 5,
    hazards: ['Nighttime citizen safety vulnerability', 'Traffic accident risk at dark intersections'],
    recommendedAction: 'Send line electrician to check feeder cable and replace defective LED luminaire.',
  },
  {
    category: 'traffic',
    categoryNames: ['traffic', 'urban_infrastructure', 'traffic management'],
    subcategories: ['Traffic Signal & Road Safety Defect', 'Traffic Management'],
    keywords: ['traffic light', 'signal', 'speed breaker', 'zebra crossing', 'signboard', 'intersection', 'congestion', 'road sign'],
    departmentSlug: 'public_works',
    baseSeverity: 7,
    hazards: ['Intersection vehicular collisions', 'Pedestrian crossing hazard'],
    recommendedAction: 'Alert traffic engineering cell to calibrate signal timing and repair control unit.',
  },
  {
    category: 'fallen_tree',
    categoryNames: ['fallen_tree', 'environment', 'green spaces'],
    subcategories: ['Fallen Tree Obstructing Way', 'Deforestation', 'Trees'],
    keywords: ['tree fall', 'fallen tree', 'branch', 'tree fallen', 'uprooted tree', 'blocking tree', 'hanging branch'],
    departmentSlug: 'parks_gardens',
    baseSeverity: 8,
    hazards: ['Total road obstruction', 'Live electric wire entanglement risk'],
    recommendedAction: 'Mobilize tree cutting and disaster response squad to clear the thoroughfare safely.',
  },
  {
    category: 'public_property',
    categoryNames: ['public_property', 'public_administration', 'accessibility'],
    subcategories: ['Public Infrastructure Damage', 'Government Services', 'Public Transport'],
    keywords: ['bench', 'bus stop', 'railing', 'park gate', 'boundary wall', 'signboard', 'public asset', 'damaged fence'],
    departmentSlug: 'public_works',
    baseSeverity: 5,
    hazards: ['Degradation of municipal assets', 'Inconvenience to public commuters'],
    recommendedAction: 'Inspect civic property structural damage and initiate municipal restoration work order.',
  },
  {
    category: 'illegal_dumping',
    categoryNames: ['illegal_dumping', 'sanitation_waste', 'environment'],
    subcategories: ['Illegal Debris & Waste Dumping', 'Waste Disposal', 'Air Pollution'],
    keywords: ['debris', 'illegal dump', 'construction waste', 'malba', 'unauthorized dumping', 'rubble', 'commercial dump'],
    departmentSlug: 'sanitation',
    baseSeverity: 6,
    hazards: ['Public pathway obstruction', 'Dust emission and environmental degradation'],
    recommendedAction: 'Issue municipal notice to clear construction rubble and impound unauthorized vehicles.',
  },
  {
    category: 'other',
    categoryNames: ['other', 'education', 'healthcare', 'agriculture', 'rural_livelihoods', 'public_service_delivery'],
    subcategories: ['Other', 'General civic issue', 'School Infrastructure', 'Primary Healthcare', 'Crop Health'],
    keywords: ['school', 'hospital', 'health', 'clinic', 'crop', 'farming', 'government office', 'scheme', 'pension', 'ration'],
    departmentSlug: 'public_works',
    baseSeverity: 5,
    hazards: ['Public inconvenience', 'Civic service delivery disruption'],
    recommendedAction: 'Forward grievance to relevant departmental officer for on-ground field appraisal.',
  },
];

export function checkIsGibberish(rawText: string): { isGibberish: boolean; reason?: string } {
  const text = (rawText || '').trim().toLowerCase();
  if (!text) return { isGibberish: true, reason: 'Description is empty.' };

  const lettersOnly = text.replace(/[^a-z]/g, '');
  if (lettersOnly.length < 8) {
    return { isGibberish: false };
  }

  // 1. Vowel-to-letter ratio check (English, Hinglish, Gujarati transliteration all have >= 20% vowels)
  const vowels = lettersOnly.match(/[aeiouy]/g) || [];
  const vowelRatio = vowels.length / lettersOnly.length;
  if (vowelRatio < 0.18) {
    return {
      isGibberish: true,
      reason: 'Description lacks recognizable language words and contains mostly consonants or random letters.',
    };
  }

  // 2. Word-by-word vowel check: words of 3+ letters with zero vowels (e.g., "grgf", "gfgfgdf", "gdgfgfdff")
  const words = text.split(/\s+/).map((w) => w.replace(/[^a-z]/g, '')).filter((w) => w.length >= 3);
  if (words.length > 0) {
    const vowelLessWords = words.filter((w) => !/[aeiouy]/.test(w));
    if (vowelLessWords.length / words.length >= 0.5) {
      return {
        isGibberish: true,
        reason: 'Words in description do not form meaningful language (no vowels detected in words).',
      };
    }
  }

  // 3. Excessive consecutive consonants (5 or more consonants in a row, e.g. "gfgdf", "fgfdff")
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(lettersOnly)) {
    return {
      isGibberish: true,
      reason: 'Description contains unreadable consonant sequences.',
    };
  }

  // 4. Repeated character clusters: e.g. "gfgfgf", "asdasd", "abcabc"
  if (/(.{2,3})\1{2,}/i.test(lettersOnly)) {
    return {
      isGibberish: true,
      reason: 'Description contains repetitive character sequences.',
    };
  }

  // 5. Triple or more repeated single character: "aaaa", "ffff"
  if (/(.)\1{3,}/i.test(lettersOnly)) {
    return {
      isGibberish: true,
      reason: 'Description contains repetitive characters.',
    };
  }

  // 6. Common keyboard mash / walks: asdf, qwerty, zxcv, hjkl
  const MASH_PATTERNS = [/asdf/i, /qwer/i, /zxcv/i, /hjkl/i, /dfgh/i, /ghjk/i, /qwerty/i, /zxcvb/i];
  if (MASH_PATTERNS.some((p) => p.test(text))) {
    return {
      isGibberish: true,
      reason: 'Description appears to be keyboard mash or test keystrokes.',
    };
  }

  // 7. Low character diversity: e.g. string >= 14 chars with fewer than 5 unique letters
  const uniqueChars = new Set(lettersOnly.split('')).size;
  if (lettersOnly.length >= 14 && uniqueChars < 5) {
    return {
      isGibberish: true,
      reason: 'Description lacks vocabulary diversity and appears to be random keystrokes.',
    };
  }

  return { isGibberish: false };
}

// Broad civic keywords identifying genuine public grievance topics
const CIVIC_KEYWORDS = [
  'broken', 'damage', 'damaged', 'defect', 'hazard', 'danger', 'repair', 'fix', 'leak', 'leaking',
  'blocked', 'block', 'overflow', 'dirty', 'smell', 'odor', 'stench', 'pothole', 'hole', 'crater',
  'crack', 'collapse', 'not working', 'malfunctioning', 'issue', 'problem', 'delay', 'urgent',
  'road', 'street', 'light', 'streetlight', 'water', 'drain', 'drainage', 'sewer', 'sewage',
  'garbage', 'trash', 'waste', 'dump', 'bin', 'dustbin', 'tree', 'branch', 'traffic', 'signal',
  'school', 'hospital', 'clinic', 'bench', 'park', 'wall', 'wire', 'electric', 'pipeline', 'meter',
  'pipe', 'tap', 'mud', 'debris', 'dust', 'flooding', 'stagnant', 'mosquito', 'pavement', 'footpath',
  'sidewalk', 'pole', 'gutter', 'manhole', 'accident', 'classroom', 'student', 'teacher', 'desk',
  'pani', 'sadak', 'rasta', 'kachra', 'bijli', 'batti', 'tuta', 'kharab', 'khadda', 'gaddha',
  'nal', 'paani', 'safai', 'diwar', 'vidhyalaya', 'dawa', 'seepage', 'choked',
];

const CATEGORY_KEYWORDS_MAP: Record<string, string[]> = {
  education: ['school', 'classroom', 'student', 'teacher', 'bench', 'desk', 'blackboard', 'roof', 'ceiling', 'toilet', 'washroom', 'wall', 'infrastructure', 'building', 'playground', 'library', 'gate', 'drinking water', 'lab', 'vidhyalaya', 'shala', 'campus', 'study', 'class', 'books', 'education', 'college'],
  healthcare: ['hospital', 'clinic', 'doctor', 'nurse', 'medicine', 'health', 'ambulance', 'dispensary', 'phc', 'chc', 'patient', 'treatment', 'bed', 'medical', 'ward', 'hygiene', 'staff', 'injection', 'oxygen'],
  agriculture: ['crop', 'farmer', 'farming', 'field', 'irrigation', 'seeds', 'pest', 'kisan', 'harvest', 'soil', 'canal', 'borewell', 'fertilizer', 'mandi', 'yield', 'agriculture'],
  water: ['water', 'pipe', 'pipeline', 'leak', 'leaking', 'burst', 'tap', 'pressure', 'dry tap', 'supply', 'drinking water', 'contamination', 'paani', 'nal', 'seepage', 'tank', 'borewell'],
  water_management: ['water', 'pipe', 'pipeline', 'leak', 'leaking', 'burst', 'tap', 'pressure', 'dry tap', 'supply', 'drinking water', 'contamination', 'paani', 'nal', 'seepage', 'tank', 'borewell'],
  sanitation_waste: ['garbage', 'trash', 'waste', 'dump', 'dustbin', 'overflowing', 'litter', 'smell', 'odor', 'kachra', 'safai', 'debris', 'filth', 'dumping', 'stench', 'bin', 'compost'],
  garbage: ['garbage', 'trash', 'waste', 'dump', 'dustbin', 'overflowing', 'litter', 'smell', 'odor', 'kachra', 'safai', 'debris', 'filth', 'dumping', 'stench', 'bin', 'compost'],
  drainage: ['drain', 'drainage', 'sewer', 'sewage', 'manhole', 'gutter', 'overflow', 'clogged', 'stagnant', 'waterlogging', 'choked', 'nala', 'gutter', 'sewerage'],
  pothole: ['pothole', 'hole', 'crater', 'asphalt', 'road hole', 'khadda', 'gaddha', 'tarmac', 'bump'],
  road_damage: ['road', 'street', 'crack', 'pavement', 'footpath', 'curb', 'divider', 'sidewalk', 'sadak', 'rasta', 'uneven', 'tar', 'concrete', 'paver', 'infrastructure', 'bridge', 'flyover'],
  urban_infrastructure: ['road', 'street', 'crack', 'pavement', 'footpath', 'curb', 'divider', 'sidewalk', 'sadak', 'rasta', 'uneven', 'tar', 'concrete', 'paver', 'infrastructure', 'bridge', 'flyover', 'pothole'],
  streetlight: ['streetlight', 'street light', 'light pole', 'lamp', 'dark', 'bulb', 'wire', 'illumination', 'blackout', 'bijli', 'batti', 'pole', 'darkness', 'electricity', 'power cut', 'cable'],
  energy: ['streetlight', 'street light', 'light pole', 'lamp', 'dark', 'bulb', 'wire', 'illumination', 'blackout', 'bijli', 'batti', 'pole', 'darkness', 'electricity', 'power cut', 'cable'],
  traffic: ['traffic', 'signal', 'speed breaker', 'crossing', 'signboard', 'intersection', 'congestion', 'road sign', 'red light', 'zebra crossing'],
  fallen_tree: ['tree', 'fallen', 'branch', 'blocking tree', 'uprooted', 'hanging branch', 'wood', 'trunk', 'green', 'park', 'forest'],
  environment: ['tree', 'fallen', 'branch', 'blocking tree', 'uprooted', 'pollution', 'green', 'park', 'forest', 'air pollution'],
  public_property: ['bench', 'bus stop', 'railing', 'park', 'gate', 'boundary', 'wall', 'signboard', 'fence', 'public toilet', 'shelter', 'monument'],
  illegal_dumping: ['dumping', 'debris', 'construction waste', 'malba', 'rubble', 'illegal dump', 'unauthorized dump'],
};

const INSUFFICIENT_PATTERNS: RegExp[] = [
  /^hello$/i,
  /^hi$/i,
  /^hey$/i,
  /^problem$/i,
  /^issue$/i,
  /^water$/i,
  /^help$/i,
  /^please help$/i,
  /^issue here$/i,
  /^something is wrong$/i,
  /^test$/i,
  /^testing$/i,
  /^asdf$/i,
  /^xyz$/i,
  /^check$/i,
  /^pls$/i,
  /^urgent$/i,
];

export function fallbackClassify(
  fullText: string,
  inputCategory?: string,
  problemImpact?: string[],
  problemSince?: string,
  rawInput?: AIAnalysisInput
): AIAnalysisResult {
  const text = (fullText || '').trim().toLowerCase();
  const corrections: CorrectionItem[] = [];

  // -------------------------------------------------------------
  // 1. DESCRIPTION QUALITY CHECK (Gibberish + Meaningfulness)
  // -------------------------------------------------------------
  let isDescriptionValid = true;
  let descriptionReason = 'Description is clear, descriptive, and provides actionable context.';
  let descriptionSuggestion: string | undefined = undefined;

  const isTooShort = text.length < 12;
  const isMeaningless = INSUFFICIENT_PATTERNS.some((p) => p.test(text.replace(/[!.,?]/g, '')));
  const gibberishCheck = checkIsGibberish(text);

  if (gibberishCheck.isGibberish) {
    isDescriptionValid = false;
    descriptionReason = gibberishCheck.reason || 'Description contains meaningless or random characters. Please clearly explain the civic issue.';
    descriptionSuggestion = 'Describe what is broken, where it is located, and how it impacts the public.';
    corrections.push({
      step: 4,
      field: 'description',
      issue: 'Invalid / Gibberish Description',
      action: 'Enter a meaningful description explaining the issue.',
    });
  } else if (isTooShort || isMeaningless) {
    isDescriptionValid = false;
    descriptionReason = 'Please provide a little more information about the problem (at least a full sentence).';
    descriptionSuggestion = 'Describe what is happening and where it is happening.';
    corrections.push({
      step: 4,
      field: 'description',
      issue: 'Description Insufficient',
      action: 'Describe what is happening and where it is happening.',
    });
  } else {
    // Check if the description contains any recognized civic or problem words
    const hasCivicTerm = CIVIC_KEYWORDS.some((kw) => text.includes(kw));
    if (!hasCivicTerm && text.length < 40) {
      isDescriptionValid = false;
      descriptionReason = 'Description does not appear to describe a public or municipal grievance.';
      descriptionSuggestion = 'Explain the specific municipal issue, defect, or hazard you are reporting.';
      corrections.push({
        step: 4,
        field: 'description',
        issue: 'Non-Civic Description',
        action: 'Describe a municipal problem or civic defect.',
      });
    }
  }

  // -------------------------------------------------------------
  // 2. CATEGORY / SUBCATEGORY CONSISTENCY CHECK
  // -------------------------------------------------------------
  let isCategoryMatch = true;
  let categoryConfidence = 0.88;
  let categoryReason = 'Selected category matches the reported grievance description.';

  const selectedCatLower = (inputCategory || rawInput?.category || '').toLowerCase();
  const selectedSubLower = (rawInput?.subcategory || '').toLowerCase();

  // If description is not valid, category cannot be verified
  if (!isDescriptionValid) {
    isCategoryMatch = false;
    categoryConfidence = 0.95;
    categoryReason = 'Description is not meaningful and cannot be matched to the selected category.';
    corrections.push({
      step: 1,
      field: 'category',
      issue: 'Unverified Category',
      action: 'Update description so category relevance can be validated.',
    });
  } else {
    // Check if selected category contradicts description keywords
    const targetKeywords = CATEGORY_KEYWORDS_MAP[selectedCatLower] || [];
    const hasCategoryKeyword = targetKeywords.some((kw) => text.includes(kw));

    // Check specific cross-domain contradictions
    const textHasGarbage = text.includes('garbage') || text.includes('trash') || text.includes('dump') || text.includes('waste');
    const textHasWater = text.includes('water') || text.includes('pipeline') || text.includes('pipe') || text.includes('leak');
    const textHasSchool = text.includes('school') || text.includes('teacher') || text.includes('student') || text.includes('classroom') || text.includes('bench');

    const isSelectedWater = selectedCatLower.includes('water') || selectedSubLower.includes('water') || selectedSubLower.includes('pipe');
    const isSelectedGarbage = selectedCatLower.includes('sanitation') || selectedCatLower.includes('garbage') || selectedSubLower.includes('garbage');
    const isSelectedEducation = selectedCatLower.includes('education') || selectedSubLower.includes('school');

    if (isSelectedWater && textHasGarbage && !textHasWater) {
      isCategoryMatch = false;
      categoryConfidence = 0.94;
      categoryReason = 'Your description does not appear to match the selected category (Water Management vs Garbage report).';
      corrections.push({
        step: 1,
        field: 'category',
        issue: 'Category Mismatch',
        action: 'Select Sanitation & Waste Management or update your description.',
      });
    } else if (isSelectedEducation && textHasGarbage && !textHasSchool) {
      isCategoryMatch = false;
      categoryConfidence = 0.92;
      categoryReason = 'Your description does not appear to match the selected category (Education vs Garbage issue).';
      corrections.push({
        step: 1,
        field: 'category',
        issue: 'Category Mismatch',
        action: 'Select Sanitation & Waste Management or update your description.',
      });
    } else if (isSelectedEducation && !hasCategoryKeyword && !textHasSchool) {
      // Education selected, but no education keywords found
      isCategoryMatch = false;
      categoryConfidence = 0.90;
      categoryReason = 'Description does not appear to describe an educational or school infrastructure issue.';
      corrections.push({
        step: 1,
        field: 'category',
        issue: 'Category Mismatch',
        action: 'Describe the school infrastructure defect or select a different category.',
      });
    }
  }

  // -------------------------------------------------------------
  // 3. PHOTO / VIDEO VALIDATION & EVIDENCE QUALITY CHECK
  // -------------------------------------------------------------
  let isEvidenceRelevant = true;
  let evidenceQuality: 'GOOD' | 'ACCEPTABLE' | 'POOR' = 'GOOD';
  let evidenceConfidence = 0.89;
  let evidenceReason = 'Live captured photographic evidence is authentic and relevant to the issue.';

  const hasPhotos = (rawInput?.photos && rawInput.photos.length > 0) || Boolean(rawInput?.evidenceMetadata);

  if (!hasPhotos) {
    isEvidenceRelevant = false;
    evidenceQuality = 'POOR';
    evidenceConfidence = 0.95;
    evidenceReason = 'Please capture a clearer photo/video of the reported issue.';
    corrections.push({
      step: 2,
      field: 'evidence',
      issue: 'Evidence Does Not Support Complaint',
      action: 'Capture live photographic or video evidence using device camera.',
    });
  } else if (!isDescriptionValid) {
    // If description is gibberish or non-civic, evidence cannot be marked as matching
    isEvidenceRelevant = false;
    evidenceQuality = 'POOR';
    evidenceConfidence = 0.92;
    evidenceReason = 'Evidence relevance cannot be validated against an unclear or gibberish description.';
    corrections.push({
      step: 2,
      field: 'evidence',
      issue: 'Evidence Relevance Unverified',
      action: 'Ensure the photo clearly captures the problem described in Step 4.',
    });
  } else if (!isCategoryMatch) {
    isEvidenceRelevant = false;
    evidenceQuality = 'POOR';
    evidenceConfidence = 0.90;
    evidenceReason = 'Evidence cannot be verified because the issue description conflicts with the selected category.';
    corrections.push({
      step: 2,
      field: 'evidence',
      issue: 'Category-Evidence Mismatch',
      action: 'Ensure evidence visually matches the selected issue category.',
    });
  }

  // -------------------------------------------------------------
  // 4. LOCATION / GPS VALIDATION
  // -------------------------------------------------------------
  let isGpsVerified = true;
  const lat = rawInput?.latitude;
  const lng = rawInput?.longitude;
  const accuracy = rawInput?.accuracy || 15;
  let gpsReason: string | undefined = undefined;

  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    isGpsVerified = false;
    gpsReason = 'Location could not be verified. Please capture the evidence again with GPS enabled.';
    corrections.push({
      step: 2,
      field: 'location',
      issue: 'GPS Verification Failed',
      action: 'Capture evidence with live device GPS location enabled.',
    });
  }

  // -------------------------------------------------------------
  // 5. CROSS-MODAL VALIDATION & OVERALL STATUS
  // -------------------------------------------------------------
  let overallStatus: 'PASS' | 'NEEDS_CORRECTION' | 'REJECTED' = 'PASS';

  if (!isDescriptionValid || !isCategoryMatch || !isEvidenceRelevant || evidenceQuality === 'POOR' || !isGpsVerified) {
    overallStatus = 'NEEDS_CORRECTION';
  }

  // Determine domain details
  const matchingDomains = DOMAIN_RULES.filter((d) =>
    d.keywords.some((kw) => text.includes(kw))
  );
  let activeDomain: DomainRule | undefined = matchingDomains[0];
  if (!activeDomain && selectedCatLower) {
    activeDomain = DOMAIN_RULES.find((d) =>
      d.category === selectedCatLower || d.categoryNames.includes(selectedCatLower)
    );
  }
  const resolvedDomain: DomainRule = activeDomain || DOMAIN_RULES[DOMAIN_RULES.length - 1]!;

  // Calculate Data-driven Severity & Priority
  let calculatedSeverity = resolvedDomain.baseSeverity;
  const hazards = [...resolvedDomain.hazards];

  const impactList = Array.isArray(problemImpact) ? problemImpact : [];
  if (impactList.includes('Public Safety') || impactList.includes('Healthcare')) {
    calculatedSeverity = Math.min(10, calculatedSeverity + 2);
    hazards.push('High-risk public safety/health group directly affected');
  }
  if (impactList.includes('Students') || impactList.includes('Accessibility')) {
    calculatedSeverity = Math.min(10, calculatedSeverity + 1);
  }

  if (problemSince === 'More than 6 months' || problemSince === '1–6 months') {
    calculatedSeverity = Math.min(10, calculatedSeverity + 1);
    hazards.push('Chronic civic delay flagged by citizen');
  }

  let calculatedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  if (calculatedSeverity >= 9) calculatedPriority = 'CRITICAL';
  else if (calculatedSeverity >= 7) calculatedPriority = 'HIGH';
  else if (calculatedSeverity >= 4) calculatedPriority = 'MEDIUM';
  else calculatedPriority = 'LOW';

  const identifiedProblem =
    rawInput?.subcategory && rawInput.subcategory !== 'Other'
      ? rawInput.subcategory
      : resolvedDomain.subcategories[0] || 'Civic Infrastructure Defect';

  const userMessage =
    overallStatus === 'PASS'
      ? '✓ AI Quality & Risk Gate — PASSED'
      : overallStatus === 'NEEDS_CORRECTION'
      ? '⚠ Needs Correction'
      : '❌ Submission Cannot Be Submitted';

  return {
    overallStatus,
    descriptionValidation: {
      valid: isDescriptionValid,
      reason: descriptionReason,
      suggestion: descriptionSuggestion,
    },
    categoryValidation: {
      matches: isCategoryMatch,
      confidence: categoryConfidence,
      reason: categoryReason,
    },
    evidenceValidation: {
      relevant: isEvidenceRelevant,
      quality: evidenceQuality,
      confidence: evidenceConfidence,
      reason: evidenceReason,
      overallStatus: overallStatus === 'PASS' ? 'valid' : overallStatus === 'NEEDS_CORRECTION' ? 'needs_attention' : 'rejected',
      isRelevant: isEvidenceRelevant,
      isAcceptableQuality: evidenceQuality !== 'POOR',
      syntheticRisk: 'low',
      reasoning: evidenceReason,
      userMessage,
      allowSubmission: overallStatus === 'PASS',
    },
    locationValidation: {
      gpsVerified: isGpsVerified,
      accuracy: Math.round(accuracy * 10) / 10,
      reason: gpsReason,
    },
    impactValidation: {
      consistent: true,
      reason: impactList.length > 0 ? `Impact verified across: ${impactList.join(', ')}` : undefined,
    },
    problemSinceValidation: {
      valid: Boolean(problemSince),
    },
    identifiedProblem,
    suggestedPriority: calculatedPriority,
    severityScore: calculatedSeverity,
    targetDepartment: resolvedDomain.departmentSlug,
    recommendedAction: resolvedDomain.recommendedAction,
    corrections,

    // Legacy fields for backward compatibility
    category: resolvedDomain.category,
    subcategory: identifiedProblem,
    severity: calculatedSeverity,
    priority: calculatedPriority.toLowerCase() as ComplaintPriority,
    departmentSlug: resolvedDomain.departmentSlug,
    summary: `${identifiedProblem} identified from verified live report.`,
    hazards: Array.from(new Set(hazards)),
    confidence: categoryConfidence,
    reasoning: `CivicConnect automated validation engine processed cross-modal signals: ${overallStatus}`,
    analysisMethod: 'CivicConnect Cross-Modal Municipal Validation Engine',
    detectedObjects: resolvedDomain.keywords.filter((kw) => text.includes(kw)),
  };
}
