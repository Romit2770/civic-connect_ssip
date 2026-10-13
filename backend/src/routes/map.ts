import { Router } from 'express';
import {
  getMapComplaints,
  getMapHotspots,
  getMapWards,
  geocodeLocation,
  reverseGeocodeLocation,
} from '../controllers/mapController';

const router = Router();

router.get('/complaints', getMapComplaints);
router.get('/hotspots', getMapHotspots);
router.get('/wards', getMapWards);
router.get('/geocode', geocodeLocation);
router.get('/reverse-geocode', reverseGeocodeLocation);

export default router;
