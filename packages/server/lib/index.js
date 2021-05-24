module.exports = {
  get CoreManager() {
    return require('./CoreManager').default;
  },
  get Skywatch() {
    return require('./Server').default;
  },
};
