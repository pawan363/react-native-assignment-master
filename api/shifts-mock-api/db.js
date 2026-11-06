const createMockDb = (initialValues = {}) => {
  const state = {
    shifts: initialValues.shifts || [],
  };

const createDbMethods = dataSet => ({
    list: async () => state.shifts, // Reference state.shifts
    get: async (id) => state.shifts.find(d => d.id === id), // Reference state.shifts
    set: async (id, data) => {
      // Update state.shifts directly
      state.shifts = state.shifts.map(d => d.id === id ? Object.assign(d, data) : d);
      return true;
    },
  })

  return {
    shifts: createDbMethods(state.shifts),
  };
};

export { createMockDb };
