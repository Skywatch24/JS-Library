module.exports = {
  get CoreManager() {
    return require('./CoreManager').default;
  },
  get Requests() {
    return require('./Requests').default;
  },
  get Constants() {
    return require('./Constants').default;
  },
};
