import {
  SQRT_NUMBER_CIRCLES,
  MIN_RADIUS,
  MAX_RADIUS,
} from './constants';

const getX = (index) => (index % SQRT_NUMBER_CIRCLES);
const getY = (index) => Math.floor((index / SQRT_NUMBER_CIRCLES));
const getCoordinates = (x, y) => `${x},${y}`;
const getRandom = (min, max) => Math.floor((Math.random() * (max - min + 1) + min));
const getRandomRadius = () => getRandom(MIN_RADIUS, MAX_RADIUS);
const getRandomXY = () => getRandom(0, SQRT_NUMBER_CIRCLES);
const reverseCoordinates = (coordinates) => coordinates.split(',').reverse().join(',');
const getRandomCoordinates = () => getCoordinates(getRandomXY(), getRandomXY());

module.exports = {
  getX,
  getY,
  getCoordinates,
  getRandom,
  getRandomRadius,
};
