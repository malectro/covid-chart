import * as React from 'react';
import {scaleLinear, scaleLog} from 'd3-scale';
import classnames from 'classnames';
import sfData from '../../data/sf.json';
//import parseIso from 'date-fns/parseISO';

import css from './index.module.css';

export default () => {
  return (
    <div className={css.root}>
      <h1>Confirmed COVID-19 Cases in San Francisco</h1>
      <Chart />
      <p>
        Accurate data updated every day 9:00am PT at{' '}
        <a href="https://www.sfdph.org/dph/alerts/coronavirus.asp">
          https://www.sfdph.org/dph/alerts/coronavirus.asp
        </a>
        . Source code at{' '}
        <a href="https://github.com/malectro/covid-chart">github</a>.
      </p>
    </div>
  );
};

function Chart() {
  const containerRef = React.useRef();
  const chartRef = React.useRef();

  const [size, setSize] = React.useState({width: 0, height: 0});
  const [shownData, setShownData] = React.useState(
    new Set(['totals', 'growth', 'deaths']),
  );
  const [scale, setScale] = React.useState('linear');

  React.useLayoutEffect(() => {
    const handleResize = () => {
      const container = chartRef.current;
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

  React.useLayoutEffect(() => {
    containerRef.current.scrollLeft = 1000000;
  }, []);

  const handleLegendClick = type => () => {
    const nextShownData = new Set(shownData);
    if (nextShownData.has(type)) {
      nextShownData.delete(type);
    } else {
      nextShownData.add(type);
    }
    setShownData(nextShownData);
  };

  const minColumnSize = 40;
  const paddingY = 20;
  const paddingX = 4;
  const rectWidth = (size.width - paddingX * 2) / data.length - paddingX;
  const halfRectWidth = rectWidth / 2;
  const innerPadding = paddingX + halfRectWidth;

  const yRange = [size.height - paddingY, 0 + paddingY];

  const scaleFunc = scale === 'linear' ? scaleLinear() : scaleLog().base(2);

  const minmax = data.reduce(
    (minmax, day) => {
      return [
        Math.max(Math.min(day.total, minmax[0]), 1),
        Math.max(day.total, minmax[1]),
      ];
    },
    [Infinity, -Infinity],
  );

  const scalarY = scaleFunc
    .copy()
    .domain(minmax)
    .range(yRange);
  const scalarX = scaleLinear(
    [0, data.length - 1],
    [innerPadding, size.width - innerPadding],
  );

  const growths = data.map(({growth}) => growth);
  const scalarGrowth = scaleFunc
    .copy()
    .domain([Math.max(Math.min(...growths), 1), Math.max(...growths)])
    .range(yRange);

  const getTotal = day => (day.total > 0 ? scalarY(day.total) : yRange[0]);
  const getGrowth = day =>
    day.growth > 0 ? Math.min(scalarGrowth(day.growth), 360) : 360;

  return (
    <div className={css.scrollContainer}>
      <div className={css.container} ref={containerRef}>
        <div
          className={css.chart}
          ref={chartRef}
          style={{minWidth: data.length * minColumnSize}}
        >
          {shownData.has('growth') && (
            <>
              <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                {data.map((day, index) => {
                  const y = getGrowth(day);
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
                {data.map((day, index) => {
                  const prevDay = data[index - 1];
                  return (
                    <span
                      style={{
                        left: scalarX(index),
                        top: getGrowth(day),
                      }}
                    >
                      {day.growth}
                      {
                        <p>
                          {(prevDay
                            ? day.growth / prevDay.total
                            : 0
                          ).toLocaleString(undefined, {style: 'percent'})}
                        </p>
                      }
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {shownData.has('totals') && (
            <>
              <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                {data.map((day, index) => (
                  <circle
                    className={css.dot}
                    cx={scalarX(index)}
                    cy={getTotal(day)}
                    r="5"
                  />
                ))}
              </svg>

              <div className={css.totals}>
                {data.map((day, index) => (
                  <span style={{left: scalarX(index), top: getTotal(day)}}>
                    {day.total}
                  </span>
                ))}
              </div>
            </>
          )}

          {shownData.has('deaths') && (
            <>
              <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                {data.map((day, index) =>
                  day.deaths ? (
                    <circle
                      className={css.dotDeaths}
                      cx={scalarX(index)}
                      cy={scalarY(day.deaths)}
                      r="5"
                    />
                  ) : null,
                )}
              </svg>

              <div className={css.totals}>
                {data.map((day, index) =>
                  day.deaths ? (
                    <span
                      style={{left: scalarX(index), top: scalarY(day.deaths)}}
                    >
                      {day.deaths}
                    </span>
                  ) : null,
                )}
              </div>
            </>
          )}
        </div>
        <div className={css.dates}>
          {data.map((day, index) => {
            const prev = data[index - 1];
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
      <div className={css.legend}>
        <div className={css.legendData}>
          {[
            {
              type: 'totals',
              label: 'Total cases',
            },
            {
              type: 'deaths',
              label: 'Total deaths',
            },
            {
              type: 'growth',
              label: 'New confirmed cases',
            },
          ].map(({type, label}) => (
            <div
              className={classnames(
                css['legend_' + type],
                shownData.has(type) && css.on,
              )}
              key={type}
              onClick={handleLegendClick(type)}
            >
              <div className={css.legendIcon} />
              {label}
            </div>
          ))}
        </div>
        <div className={css.legendData}>
          <label>
            Scale:{' '}
            <select
              value={scale}
              onChange={event => setScale(event.currentTarget.value)}
            >
              <option value="linear">linear</option>
              <option value="log">logarithmic</option>
            </select>
          </label>
        </div>
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

const currentTime = new Date();
const data = totals.map((day, index) => {
  const prev = totals[index - 1];
  return {...day, growth: day.total - (prev?.total ?? 0)};
}).filter(day => 100 * day.date.getUTCMonth() + day.date.getUTCDate() <= currentTime.getMonth() * 100 + currentTime.getDate());
