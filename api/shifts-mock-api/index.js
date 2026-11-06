import Joi from 'joi';
import Boom from 'boom';

import { delay } from './utils'; //[cite: 5]
import { createMockDb } from './db'; //[cite: 6]
import mockShifts from './mockShifts'; //[cite: 4]

const db = createMockDb({ shifts: mockShifts }); //[cite: 3, 4]

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: async () => {
      await delay(500); //[cite: 3, 5]
      return db.shifts.list(); //[cite: 3, 6]
    },
  },
  {
    method: 'GET',
    path: '/{id}',
    handler: async ({ params }) => {
      const shift = await db.shifts.get(params.id); //[cite: 3, 6]
      await delay(200); //[cite: 3, 5]
      if (!shift) throw Boom.notFound(`Shift not found with id ${params.id}`); //[cite: 3]
      return shift;
    },
    config: { validate: { params: { id: Joi.string().required() } } }
  },
  {
    method: 'POST',
    path: '/{id}/book',
    handler: async (request, h) => {
      try {
        const shift = await db.shifts.get(request.params.id);

        if (!shift) {
          throw Boom.notFound(`Shift not found with id ${request.params.id}`);
        } 
        if (shift.booked) {
          throw Boom.badRequest(`Shift ${request.params.id} is already booked`);
        } 
        if (Date.now() >= shift.endTime) {
          throw Boom.badRequest('Shift is already finished');
        }
        if (Date.now() > shift.startTime) {
          throw Boom.badRequest('Shift has already started');
        } 

        const allShifts = await db.shifts.list();
        const overlappingShiftExists = !!allShifts
          .filter(s => s.booked)
          .find(s => s.startTime < shift.endTime && s.endTime > shift.startTime);

        if (overlappingShiftExists) {
          throw Boom.badRequest('Cannot book an overlapping shift');
        }

        await db.shifts.set(request.params.id, { booked: true });
        await delay(500);

        return await db.shifts.get(request.params.id);
      } catch (err) {
        throw err;
      }
    },
  },
  {
    method: 'POST',
    path: '/{id}/cancel',
    handler: async ({ params }) => {
      const shift = await db.shifts.get(params.id);
      if (!shift) throw Boom.notFound(`Shift not found with id ${params.id}`);
      if (!shift.booked) throw Boom.badRequest('Cannot cancel shift that is not booked');

      await db.shifts.set(params.id, { booked: false });
      await delay(500);
      return db.shifts.get(params.id);
    },
    config: { validate: { params: { id: Joi.required() } } }
  }
];

const plugin = {
  name: 'shifts-mock-api',
  version: '1.0.0',
  register(server) {
    server.route(routes); //[cite: 3]
  },
};

export { plugin }; //[cite: 3]