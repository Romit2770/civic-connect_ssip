import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint';
import { Ward } from '../models/Ward';

export async function getMapComplaints(req: Request, res: Response) {
  try {
    const { category, status, priority, wardId, departmentId, slaState } = req.query;

    const query: any = {
      'location.coordinates': { $exists: true, $ne: [] },
    };

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (wardId) query.wardId = wardId;
    if (departmentId) query.departmentId = departmentId;
    if (slaState) query.slaState = slaState;

    const complaints = await Complaint.find(query)
      .select('complaintNumber title category status priority slaState location wardId departmentId photos createdAt')
      .populate('departmentId', 'name slug icon')
      .populate('wardId', 'wardNumber name')
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    const geojson = {
      type: 'FeatureCollection',
      features: complaints.map((c) => ({
        type: 'Feature',
        geometry: c.location,
        properties: {
          id: c._id,
          complaintNumber: c.complaintNumber,
          title: c.title,
          category: c.category,
          status: c.status,
          priority: c.priority,
          slaState: c.slaState,
          department: (c.departmentId as any)?.name,
          ward: (c.wardId as any)?.name,
          wardNumber: (c.wardId as any)?.wardNumber,
          photo: c.photos?.[0],
          createdAt: c.createdAt,
        },
      })),
    };

    res.json({ success: true, data: geojson, count: complaints.length });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'MAP_FETCH_FAILED', message: error.message },
    });
  }
}

export async function getMapHotspots(_req: Request, res: Response) {
  try {
    // Spatial grid aggregation (approx 200m grid cell clustering)
    // Round lat/lng to 3 decimal places (~110 meters)
    const hotspots = await Complaint.aggregate([
      {
        $match: {
          status: { $nin: ['resolved', 'closed', 'rejected'] },
          'location.coordinates': { $exists: true },
        },
      },
      {
        $project: {
          category: 1,
          priority: 1,
          gridLng: {
            $divide: [
              { $round: [{ $multiply: [{ $arrayElemAt: ['$location.coordinates', 0] }, 1000] }] },
              1000,
            ],
          },
          gridLat: {
            $divide: [
              { $round: [{ $multiply: [{ $arrayElemAt: ['$location.coordinates', 1] }, 1000] }] },
              1000,
            ],
          },
        },
      },
      {
        $group: {
          _id: { lng: '$gridLng', lat: '$gridLat' },
          count: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] },
          },
          categories: { $addToSet: '$category' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const formatted = hotspots.map((h) => {
      let densityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (h.count >= 6 || h.criticalCount >= 2) densityLevel = 'critical';
      else if (h.count >= 4) densityLevel = 'high';
      else if (h.count >= 2) densityLevel = 'medium';

      return {
        coordinates: [h._id.lng, h._id.lat] as [number, number],
        count: h.count,
        criticalCount: h.criticalCount,
        densityLevel,
        topCategories: h.categories.slice(0, 3),
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'HOTSPOTS_FAILED', message: error.message },
    });
  }
}

export async function getMapWards(_req: Request, res: Response) {
  try {
    const wards = await Ward.find({ isActive: true }).lean();
    const activeComplaintCounts = await Complaint.aggregate([
      {
        $match: {
          status: { $nin: ['resolved', 'closed', 'rejected'] },
        },
      },
      {
        $group: {
          _id: '$wardId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(activeComplaintCounts.map((c) => [c._id ? c._id.toString() : '', c.count]));

    const geojson = {
      type: 'FeatureCollection',
      features: wards.map((w) => ({
        type: 'Feature',
        geometry: w.boundary,
        properties: {
          id: w._id,
          wardNumber: w.wardNumber,
          name: w.name,
          zone: w.zone,
          population: w.population,
          activeComplaints: countMap.get(w._id.toString()) || 0,
          center: w.centerPoint?.coordinates,
        },
      })),
    };

    res.json({ success: true, data: geojson });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'WARDS_MAP_FAILED', message: error.message },
    });
  }
}

export async function geocodeLocation(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&countrycodes=in&limit=6&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CivicConnect-National-Grievance-Platform/1.0 (civicconnect.gov.in)',
      },
    });

    if (!response.ok) {
      return res.json({ success: true, data: [] });
    }

    const data: any = await response.json();
    const suggestions = (Array.isArray(data) ? data : []).map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.address || {},
      type: item.type,
    }));

    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
}

export async function reverseGeocodeLocation(req: Request, res: Response) {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COORDINATES', message: 'Valid lat and lng required.' },
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CivicConnect-National-Grievance-Platform/1.0 (civicconnect.gov.in)',
      },
    });

    if (!response.ok) {
      return res.json({
        success: true,
        data: { address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}` },
      });
    }

    const data: any = await response.json();
    res.json({
      success: true,
      data: {
        displayName: data.display_name || `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        address: data.address || {},
      },
    });
  } catch (error: any) {
    res.json({
      success: true,
      data: { address: 'Captured via Map Location' },
    });
  }
}
