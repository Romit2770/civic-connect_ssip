import { Ward, IWard } from '../models/Ward';

export async function findWardForCoordinates(
  longitude: number,
  latitude: number
): Promise<IWard | null> {
  try {
    // 1. Point-in-Polygon query via $geoIntersects
    const matchingWard = await Ward.findOne({
      isActive: true,
      boundary: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
    });

    if (matchingWard) {
      return matchingWard;
    }

    // 2. Fallback: Find the nearest ward center point
    const nearestWard = await Ward.findOne({
      isActive: true,
      centerPoint: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 50000, // 50 km search window
        },
      },
    });

    return nearestWard || null;
  } catch (error) {
    console.warn('Ward lookup error:', error);
    // Fallback to first active ward if spatial query encounters index warm-up
    return Ward.findOne({ isActive: true });
  }
}

export async function getAllWards(): Promise<IWard[]> {
  return Ward.find({ isActive: true }).sort({ wardNumber: 1 });
}
