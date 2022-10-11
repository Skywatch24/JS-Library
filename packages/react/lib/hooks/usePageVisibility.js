"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePageVisibility = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const usePageVisibility = callback => {
  const [isVisible, setIsVisible] = (0, _react.useState)(!document.hidden);

  const onVisibilityChange = () => {
    setIsVisible(!document.hidden);
    callback();
  };

  (0, _react.useEffect)(() => {
    document.addEventListener('visibilitychange', onVisibilityChange, false);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  });
  return isVisible;
};

exports.usePageVisibility = usePageVisibility;