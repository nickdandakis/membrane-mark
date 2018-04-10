import React, { Component } from 'react';
import { config, Spring } from 'react-spring';
import isEqual from 'lodash.isequal';

import {
  SQRT_NUMBER_CIRCLES,
  MIN_RADIUS,
  MAX_RADIUS,
  NUMBER_CIRCLES,
  INDICES,
} from './constants';

import {
  getX,
  getY,
  getCoordinates,
  getRandom,
  getRandomRadius,
} from './utils';

class Mark extends Component {
  static INITIAL_RADII = INDICES.reduce((accumulator, index) => {
    const xIndex = getX(index);
    const yIndex = getY(index);
    const coordinates = getCoordinates(xIndex, yIndex);

    accumulator[coordinates] = 1;

    return accumulator;
  }, {});

  initialState = () => {
    return {
      previousRadii: Mark.INITIAL_RADII,
      radii: INDICES.reduce((accumulator, index) => {
        const { animation } = this.props;

        const xIndex = getX(index);
        const yIndex = getY(index);
        const coordinates = getCoordinates(xIndex, yIndex);

        if (animation === 'RANDOM') {
          accumulator[coordinates] = getRandomRadius();
        } else if (animation && animation.includes('WAVE')) {
          accumulator[coordinates] = getRandom(MIN_RADIUS, MIN_RADIUS + 2);
        } else {
          accumulator[coordinates] = 1;
        }

        return accumulator;
      }, {}),
    };
  };

  state = this.initialState();

  // a random number of circles update their radius by a random amount
  // at a random interval
  randomRadiiInterval = () => {
    const minEngaged = 0;
    const maxEngaged = 8;
    const minInterval = 133;
    const maxInterval = 333;

    const loop = () => {
      this.timeout = setTimeout(() => {
        const updatedRadii = this.state.radii;

        for (let i=0; i < getRandom(minEngaged, maxEngaged); i++) {
          updatedRadii[getRandomCoordinates()] = getRandomRadius();
        }

        this.setState({
          ...this.state,
          previousRadii: this.state.radii,
          radii: updatedRadii,
        });

        loop();
      }, getRandom(minInterval, maxInterval));
    }

    loop();
  }

  waveRadiiInterval = ({ direction = 'LEFT_TO_RIGHT' }) => {
    // animation parameters
    const minTrailAmount = 1;
    const maxTrailAmount = 3;
    const minInterval = 133;
    const maxInterval = 300;
    const minWaitTimeout = 500;
    const maxWaitTimeout = 1000;
    const getRandomWaveRadius = () => getRandom(MAX_RADIUS - 6, MAX_RADIUS);
    const getRandomTrailRadius = () => getRandom(MIN_RADIUS, MIN_RADIUS + 2);

    // logic abstracted to helpers
    let initialX;
    let stepX;
    let shouldStepX;
    let stepTrailX;
    if (direction === 'LEFT_TO_RIGHT' || direction === 'TOP_TO_BOTTOM') {
      initialX = 0;
      stepX = x => (x + 1);
      shouldStepX = (x, trailAmount) => (x < (SQRT_NUMBER_CIRCLES + trailAmount - 1));
      stepTrailX = (x, trailAmount) => (x - trailAmount);
    } else if (direction === 'RIGHT_TO_LEFT' || direction === 'BOTTOM_TO_TOP') {
      initialX = SQRT_NUMBER_CIRCLES - 1;
      stepX = x => (x - 1);
      shouldStepX = (x, trailAmount) => (x > -(trailAmount));
      stepTrailX = (x, trailAmount) => (x + trailAmount);
    }

    // loop state
    let x = initialX;
    let trailAmount = getRandom(minTrailAmount, maxTrailAmount);
    let intervalAmount = getRandom(minInterval, maxInterval);

    // loop like this so that we can control the time between animations
    const loop = () => {
      this.timeout = setTimeout(() => {
        const previousRadii = this.state.radii;
        const radii = previousRadii;

        INDICES.forEach((index) => {
          // update wave
          let waveCoordinates;
          if (direction === 'LEFT_TO_RIGHT' || direction === 'RIGHT_TO_LEFT') {
            waveCoordinates = getCoordinates(x, getY(index));
          } else { // TOP_TO_BOTTOM and BOTTOM_TO_TOP get their coordinates reversed
            waveCoordinates = getCoordinates(getX(index), x);
          }
          radii[waveCoordinates] = getRandomWaveRadius();

          // update trail
          const trailX = stepTrailX(x, trailAmount);
          let trailCoordinates;
          if (direction === 'LEFT_TO_RIGHT' || direction === 'RIGHT_TO_LEFT') {
            trailCoordinates = getCoordinates(trailX, getY(index));
          } else { // TOP_TO_BOTTOM and BOTTOM_TO_TOP get their coordinates reversed
            trailCoordinates = getCoordinates(getX(index), trailX);
          }
          radii[trailCoordinates] = getRandomTrailRadius();
        });

        // update the radii, but also keep a previousRadii for tweening
        this.setState({
          ...this.state,
          previousRadii,
          radii,
        });

        // take x to the next value or reset it upon a condition that ensures
        // trails are cleared
        x = (shouldStepX(x, trailAmount) ? stepX(x) : initialX);

        if (x === initialX) { // end of animation frame
          // update stateful variables and
          // trigger next loop after a random wait
          this.timeout = setTimeout(() => {
            trailAmount = getRandom(minTrailAmount, maxTrailAmount);
            intervalAmount = getRandom(minInterval, maxInterval);

            loop();
          }, getRandom(minWaitTimeout, maxWaitTimeout));
        } else {
          loop();
        }
      }, intervalAmount);
    }

    loop();
  }

  diagonalWaveRadiiInterval = ({ direction = 'TOP_LEFT_TO_BOTTOM_RIGHT' }) => {
    // animation parameters
    const minTrailAmount = 1;
    const maxTrailAmount = 3;
    const minInterval = 133;
    const maxInterval = 333;
    const minWaitTimeout = 500;
    const maxWaitTimeout = 1000;
    const getRandomWaveRadius = () => getRandom(MAX_RADIUS - 6, MAX_RADIUS);
    const getRandomTrailRadius = () => getRandom(MIN_RADIUS, MIN_RADIUS + 2);

    // logic abstracted to helpers
    let initialX;
    let stepX;
    let shouldStepX;
    let stepTrailX;
    if (direction === 'TOP_LEFT_TO_BOTTOM_RIGHT' || direction === 'TOP_RIGHT_TO_BOTTOM_LEFT') {
      initialX = 0;
      stepX = x => (x + 1);
      shouldStepX = (x, trailAmount) => (x < (((SQRT_NUMBER_CIRCLES * 2) - 1) + trailAmount - 1));
      stepTrailX = (x, trailAmount) => (x - trailAmount);
    } else if (direction === 'BOTTOM_RIGHT_TO_TOP_LEFT' || direction === 'BOTTOM_LEFT_TO_TOP_RIGHT') {
      initialX = ((SQRT_NUMBER_CIRCLES * 2) - 2);
      stepX = x => (x - 1);
      shouldStepX = (x, trailAmount) => (x > -(trailAmount));
      stepTrailX = (x, trailAmount) => (x + trailAmount);
    }
    let diagonalXYs = [];
    if (direction === 'TOP_LEFT_TO_BOTTOM_RIGHT' || direction === 'BOTTOM_RIGHT_TO_TOP_LEFT') {
      [...Array(SQRT_NUMBER_CIRCLES * 2).keys()].forEach((i) => {
        [...Array(SQRT_NUMBER_CIRCLES).keys()].forEach((j) => {
          [...Array(SQRT_NUMBER_CIRCLES).keys()].forEach((k) => {
            if ((j + k) === i) {
              const coordinates = getCoordinates(j, k);
              diagonalXYs[i] = [
                ...(diagonalXYs[i] || []),
                coordinates,
              ];
            };
          });
        });
      })
    } else if (direction === 'TOP_RIGHT_TO_BOTTOM_LEFT' || direction === 'BOTTOM_LEFT_TO_TOP_RIGHT') {
      [...Array(SQRT_NUMBER_CIRCLES).keys()].forEach((i) => {
        [...Array((i+2)).keys()].slice(1).reverse().forEach((j, k) => {
          const coordinates = getCoordinates((SQRT_NUMBER_CIRCLES - j), k);
          diagonalXYs[i] = [
            ...(diagonalXYs[i] || []),
            coordinates,
          ];
        });
      });
      [...Array(SQRT_NUMBER_CIRCLES).keys()].reverse().slice(1).forEach((i) => {
        const iMirrored = (2 * SQRT_NUMBER_CIRCLES - i - 2);
        diagonalXYs[iMirrored] = [
          ...(diagonalXYs[iMirrored] || []),
          ...diagonalXYs[i].map((coordinates) => reverseCoordinates(coordinates)),
        ];
      });
    }

    // loop state
    let x = initialX;
    let trailAmount = getRandom(minTrailAmount, maxTrailAmount);
    let intervalAmount = getRandom(minInterval, maxInterval);

    // loop like this so that we can control the time between animations
    const loop = () => {
      this.timeout = setTimeout(() => {
        const previousRadii = this.state.radii;
        const radii = previousRadii;
        const trailX = stepTrailX(x, trailAmount);

        // update wave
        (diagonalXYs[x] || []).forEach((waveCoordinates) => {
          radii[waveCoordinates] = getRandomWaveRadius();
        });

        // update trail
        (diagonalXYs[trailX] || []).forEach((trailCoordinates) => {
          radii[trailCoordinates] = getRandomTrailRadius();
        });

        // update the radii, but also keep a previousRadii for tweening
        this.setState({
          ...this.state,
          previousRadii,
          radii,
        });

        // take x to the next value or reset it upon a condition that ensures
        // trails are cleared
        x = (shouldStepX(x, trailAmount) ? stepX(x) : initialX);

        if (x === initialX) { // end of animation frame
          // update stateful variables and
          // trigger next loop after a random wait
          this.timeout = setTimeout(() => {
            trailAmount = getRandom(minTrailAmount, maxTrailAmount);
            intervalAmount = getRandom(minInterval, maxInterval);

            loop();
          }, getRandom(minWaitTimeout, maxWaitTimeout));
        } else {
          loop();
        }
      }, intervalAmount);
    }

    loop();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.animation !== this.props.animation) {
      this.clearAnimation();
      this.startAnimation();
    }

    if (!this.props.animation && !isEqual(this.props.radii, this.state.radii)) {
      this.clearAnimation();

      this.setState({
        ...this.state,
        previousRadii: this.state.radii,
        radii: this.props.radii,
      });
    }
  }

  componentDidMount() {
    this.startAnimation();
  }

  componentWillUnmount() {
    this.clearAnimation();
  }

  startAnimation = () => {
    const { animation } = this.props;

    switch (animation) {
      case 'RANDOM':
        this.randomRadiiInterval();
        break;
      case 'LEFT_TO_RIGHT_WAVE':
        this.waveRadiiInterval({
          direction: 'LEFT_TO_RIGHT',
        });
        break;
      case 'RIGHT_TO_LEFT_WAVE':
        this.waveRadiiInterval({
          direction: 'RIGHT_TO_LEFT',
        });
        break;
      case 'TOP_TO_BOTTOM_WAVE':
        this.waveRadiiInterval({
          direction: 'TOP_TO_BOTTOM',
        });
        break;
      case 'BOTTOM_TO_TOP_WAVE':
        this.waveRadiiInterval({
          direction: 'BOTTOM_TO_TOP',
        });
        break;
      case 'TOP_LEFT_TO_BOTTOM_RIGHT_WAVE':
        this.diagonalWaveRadiiInterval({
          direction: 'TOP_LEFT_TO_BOTTOM_RIGHT',
        });
        break;
      case 'BOTTOM_RIGHT_TO_TOP_LEFT_WAVE':
        this.diagonalWaveRadiiInterval({
          direction: 'BOTTOM_RIGHT_TO_TOP_LEFT',
        });
        break;
      case 'TOP_RIGHT_TO_BOTTOM_LEFT_WAVE':
        this.diagonalWaveRadiiInterval({
          direction: 'TOP_RIGHT_TO_BOTTOM_LEFT',
        });
        break;
      case 'BOTTOM_LEFT_TO_TOP_RIGHT_WAVE':
        this.diagonalWaveRadiiInterval({
          direction: 'BOTTOM_LEFT_TO_TOP_RIGHT',
        });
        break;
      default:
        break;
    }
  }

  clearAnimation = () => {
    this.setState(this.initialState());

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    const {
      fill = "white",
      size = 160,
      onClick,
      onContextMenu,
    } = this.props;
    const { previousRadii, radii } = this.state;

    const circles = [];
    for (let index = 0; index < NUMBER_CIRCLES; index++) {
      const x = getX(index);
      const y = getY(index);
      const coordinates = getCoordinates(x, y);
      const previousRadius = previousRadii[coordinates];
      const radius = radii[coordinates];

      const circle = (
        <Spring
          from={{ r: previousRadius }}
          to={{ r: radius }}
          key={coordinates}
          config={config.slow}
        >
          { styles => (
            <circle
              cx={
                (x * MAX_RADIUS) + (MAX_RADIUS * x) + MAX_RADIUS
              }
              cy={
                (y * MAX_RADIUS) + (MAX_RADIUS * y) + MAX_RADIUS
              }
              fill={fill}
              r={styles.r}
            />
          )}
        </Spring>
      );

      circles.push(circle);
    }

    const hitAreas = [];
    for (let index = 0; index < NUMBER_CIRCLES; index++) {
      const x = getX(index);
      const y = getY(index);
      const coordinates = getCoordinates(x, y);
      const previousRadius = previousRadii[coordinates];
      const radius = radii[coordinates];

      const hitArea = (
        <rect
          key={coordinates}
          x={
            (x * MAX_RADIUS) + (MAX_RADIUS * x)
          }
          y={
            (y * MAX_RADIUS) + (MAX_RADIUS * y)
          }
          width={MAX_RADIUS * 2}
          height={MAX_RADIUS * 2}
          fill="rgba(0,0,0,0)"
          onClick={
            (event) => onClick({
              event,
              index,
              x,
              y,
              coordinates,
              radius,
            })
          }
          onContextMenu={
            (event) => onContextMenu({
              event,
              index,
              x,
              y,
              coordinates,
              radius,
            })
          }
        />
      );

      hitAreas.push(hitArea);
    }

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${MAX_RADIUS * 2 * SQRT_NUMBER_CIRCLES} ${MAX_RADIUS * 2 * SQRT_NUMBER_CIRCLES}`}
      >
        { circles }
        { hitAreas }
      </svg>
    );
  }
}

export default Mark;
