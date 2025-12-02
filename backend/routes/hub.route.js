import express from 'express';
import { 
  listHubs, 
  getHub, 
  addHub, 
  updateHub, 
  removeHub,
  assignDroneToHub,
  unassignDroneFromHub,
  getAvailableDronesForHub,
  getHubStats
} from '../controllers/hub.controller.js';

const hubRouter = express.Router();

// Hub CRUD operations
hubRouter.get('/list', listHubs);
hubRouter.get('/stats', getHubStats);
hubRouter.get('/:hubId', getHub);
hubRouter.post('/add', addHub);
hubRouter.put('/:hubId', updateHub);
hubRouter.delete('/:hubId', removeHub);

// Drone assignment operations
hubRouter.post('/:hubId/assign-drone', assignDroneToHub);
hubRouter.delete('/:hubId/drone/:droneId', unassignDroneFromHub);
hubRouter.get('/:hubId/available-drones', getAvailableDronesForHub);

export default hubRouter;
