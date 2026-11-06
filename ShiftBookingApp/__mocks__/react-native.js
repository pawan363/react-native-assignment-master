module.exports = {
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
  },
  StyleSheet: {
    hairlineWidth: 1,
    create: (styles) => styles,
  },
};
