import React, { useMemo, useSyncExternalStore } from 'react';
import { Temporal } from 'temporal-polyfill';


import classNames from 'classnames/bind';
import styles from './Controls.module.scss';
const cx = classNames.bind(styles);


function startOfWeek(date: Temporal.PlainDate) {
  return date.subtract({ days: date.dayOfWeek - 1 });
}

const minDate = startOfWeek(Temporal.PlainDate.from({ year: 2024, month: 10, day: 15 }));
function useMaxDate() {
  const stableDate = useMemo(() => startOfWeek(Temporal.Now.plainDateISO()), []);
  return useSyncExternalStore(() => () => {}, () => stableDate, () => stableDate);
}


export default function Controls({
  untilDate: passedUntilDate,
  onUntilDateChange,
}: {
  untilDate: Temporal.ZonedDateTime | undefined,
  onUntilDateChange: (d: Temporal.ZonedDateTime) => void;
}) {
  const maxDate = useMaxDate();
  const weeksDuration = minDate.until(maxDate, { smallestUnit: 'weeks', largestUnit: 'weeks' }).weeks;

  const untilDate = passedUntilDate ?? maxDate;
  const untilWeeks = minDate.until(untilDate, { smallestUnit: 'weeks', largestUnit: 'weeks' }).weeks;


  return (
    <div className={cx('base')}>
      <input
        type="range"
        min={0}
        max={weeksDuration}
        step={1}

        value={untilWeeks}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10);
          if (!Number.isNaN(newValue)) {
            onUntilDateChange(minDate.add({ weeks: newValue }).toZonedDateTime('America/New_York'));
          }
        }}
      />
    </div>
  );
}
