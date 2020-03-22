import React from 'react';
import {scaleLinear} from 'd3-scale';
import sfData from '../../data/sf.json';
//import parseIso from 'date-fns/parseISO';

import css from './index.module.css';

export default () => (
  <div className={css.root}>
    <h1>Confirmed COVID-19 Cases in SF</h1>
    <Chart />
    <p>
      Up to date information at{' '}
      <a href="https://www.sfdph.org/dph/alerts/coronavirus.asp">
        https://www.sfdph.org/dph/alerts/coronavirus.asp
      </a>
      .
    </p>
  </div>
);

function Chart() {
  const containerRef = React.useRef();
  const [size, setSize] = React.useState({width: 0, height: 0});
  React.useLayoutEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        setSize({
          width: container.offsetWidth - 2,
          height: container.offsetHeight - 2,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const minmax = totals.reduce(
    (minmax, day) => {
      return [Math.min(day.total, minmax[0]), Math.max(day.total, minmax[1])];
    },
    [Infinity, -Infinity],
  );

  const paddingY = 20;
  const paddingX = 4;
  const rectWidth = (size.width - paddingX * 2) / totals.length - paddingX;
  const halfRectWidth = rectWidth / 2;
  const innerPadding = paddingX + halfRectWidth;

  const yRange = [size.height - paddingY, 0 + paddingY];

  const scalarY = scaleLinear(minmax, yRange);
  const scalarX = scaleLinear(
    [0, totals.length - 1],
    [innerPadding, size.width - innerPadding],
  );

  const growths = data.map(({growth}) => growth);
  const scalarGrowth = scaleLinear(
    [Math.min(...growths), Math.max(...growths)],
    yRange,
  );

  return (
    <div className={css.container}>
      <div className={css.chart} ref={containerRef}>
        <svg viewBox={`0 0 ${size.width} ${size.height}`}>
          {data.map((day, index) => {
            const y = scalarGrowth(day.growth);
            return (
              <rect
                className={css.rect}
                x={scalarX(index) - halfRectWidth}
                y={y}
                width={rectWidth}
                height={size.height - y}
              />
            );
          })}
        </svg>

        <div className={css.growth}>
          {data.map((day, index) => (
            <span style={{left: scalarX(index), top: scalarGrowth(day.growth)}}>
              {day.growth}
            </span>
          ))}
        </div>

        <svg viewBox={`0 0 ${size.width} ${size.height}`}>
          {totals.map((day, index) => (
            <circle
              className={css.dot}
              cx={scalarX(index)}
              cy={scalarY(day.total)}
              r="5"
            />
          ))}
        </svg>

        <div className={css.totals}>
          {totals.map((day, index) => (
            <span style={{left: scalarX(index), top: scalarY(day.total)}}>
              {day.total}
            </span>
          ))}
        </div>

        <div className={css.legend}>
          <div className={css.legendTotal}>
            <div className={css.legendIcon} />
            Total cases
          </div>
          <div className={css.legendGrowth}>
            <div className={css.legendIcon} />
            New confirmed cases
          </div>
        </div>
      </div>
      <div className={css.dates}>
        {totals.map((day, index) => {
          const prev = totals[index - 1];
          return (
            <span style={{left: scalarX(index)}}>
              {day.date.getMonth() !== prev?.date.getMonth()
                ? day.date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : day.date.getDate()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/*
const totals = [
  {date: '2020-03-04', total: 0},
  {date: '2020-03-05', total: 2},
  {date: '2020-03-06', total: 2},
  {date: '2020-03-07', total: 8},
  {date: '2020-03-08', total: 8},
  {date: '2020-03-09', total: 13},
  {date: '2020-03-10', total: 14},
  {date: '2020-03-11', total: 14},
  {date: '2020-03-12', total: 18},
  {date: '2020-03-13', total: 23},
  {date: '2020-03-14', total: 28},
  {date: '2020-03-15', total: 37},
  {date: '2020-03-16', total: 40},
  {date: '2020-03-17', total: 43},
  {date: '2020-03-18', total: 51},
  {date: '2020-03-19', total: 70},
  {date: '2020-03-20', total: 76},
  {date: '2020-03-21', total: 84},
  {date: '2020-03-22', total: 105},
].map(day => ({
  ...day,
  date: new Date(day.date),
}));
*/
const totals = sfData.map(day => ({
  ...day,
  date: new Date(day.date),
}));

const data = totals.map((day, index) => {
  const prev = totals[index - 1];
  return {...day, growth: day.total - (prev?.total ?? 0)};
});
