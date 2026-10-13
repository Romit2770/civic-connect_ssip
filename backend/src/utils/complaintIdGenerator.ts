import { Complaint } from '../models/Complaint';

export async function generateComplaintId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CC-${currentYear}-`;

  // Find the highest number for this year
  const latestComplaint = await Complaint.findOne({
    complaintNumber: new RegExp(`^${prefix}`),
  })
    .sort({ complaintNumber: -1 })
    .select('complaintNumber')
    .lean();

  let nextSeq = 1;
  if (latestComplaint && latestComplaint.complaintNumber) {
    const parts = latestComplaint.complaintNumber.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSeq = seq + 1;
      }
    }
  }

  // Format as CC-2026-000123
  const paddedSeq = String(nextSeq).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}

export function generateTitle(category: string, description: string): string {
  const categoryTitles: Record<string, string> = {
    pothole: 'Road Pothole & Surface Damage',
    garbage: 'Uncollected Garbage / Waste Overflow',
    streetlight: 'Defective Streetlight / Electrical Pole',
    water: 'Drinking Water Pipeline Leakage',
    drainage: 'Blocked Drainage / Sewage Overflow',
    road_damage: 'Severe Road & Footpath Damage',
    public_property: 'Damaged Public Property / Infrastructure',
    fallen_tree: 'Fallen Tree / Dangerous Branch',
    illegal_dumping: 'Illegal Waste Dumping & Debris',
    traffic: 'Traffic Signal & Road Safety Hazard',
    other: 'Civic Grievance',
  };

  const baseTitle = categoryTitles[category] || 'Civic Grievance';
  const cleanSnippet = description
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);

  return `${baseTitle}: ${cleanSnippet}${description.length > 50 ? '...' : ''}`;
}
