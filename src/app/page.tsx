import React from 'react';

import classNames from 'classnames/bind';
import styles from './page.module.scss';
const cx = classNames.bind(styles);

export default function Page() {
  return (
    <div className={cx('base')}>Hello</div>
  );
}
