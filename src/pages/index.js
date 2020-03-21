import React from 'react';
import {scaleLinear} from 'd3-scale';

import css from './index.module.css';

export default () => (
  <div className={css.root}>
    <h1>Confirmed COVID-19 Cases in SF</h1>
    <Chart />
  </div>
);

function Chart() {
  const containerRef = React.useRef();
  const [size, setSize] = React.useState({width: 0, height: 0});
  React.useEffect(() => {
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

  const padding = 20;

  const yRange = [size.height - padding, 0 + padding];

  const scalarY = scaleLinear(minmax, yRange);
  const scalarX = scaleLinear(
    [0, totals.length - 1],
    [padding, size.width - padding],
  );

  const growths = data.map(({growth}) => growth);
  const scalarGrowth = scaleLinear(
    [Math.min(...growths), Math.max(...growths)],
    yRange,
  );
  const rectWidth = size.width / totals.length - 4;
  const halfRectWidth = rectWidth / 2;

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
      </div>

    </div>
      <div className={css.dates}>
        {totals.map((day, index) => (
          <span style={{left: scalarX(index)}}>
            {new Date(day.date).getDate()}
          </span>
        ))}
      </div>
    </div>
  );
}

const totals = [
  {date: '2020-3-4', total: 0},
  {date: '2020-3-5', total: 2},
  {date: '2020-3-6', total: 2},
  {date: '2020-3-7', total: 8},
  {date: '2020-3-8', total: 8},
  {date: '2020-3-9', total: 13},
  {date: '2020-3-10', total: 14},
  {date: '2020-3-11', total: 14},
  {date: '2020-3-12', total: 18},
  {date: '2020-3-13', total: 23},
  {date: '2020-3-14', total: 28},
  {date: '2020-3-15', total: 37},
  {date: '2020-3-16', total: 40},
  {date: '2020-3-17', total: 43},
  {date: '2020-3-18', total: 51},
  {date: '2020-3-19', total: 70},
  {date: '2020-3-20', total: 76},
  {date: '2020-3-21', total: 84},
];

const data = totals.map((day, index) => {
  const prev = totals[index - 1];
  return {...day, growth: day.total - (prev?.total ?? 0)};
});
