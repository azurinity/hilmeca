import React from 'react';
import clsx from 'clsx';
import styles from './OverheadText.module.css';

export interface OverheadTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
}

export function OverheadText({ children, text, className, ...props }: OverheadTextProps) {
  const finalText: string = (
    typeof text === 'string' ? text : typeof children === 'string' ? children : ''
  ).toUpperCase();

  return (
    <p className={clsx(styles.overhead, typeof className === 'string' && className)} {...props}>
      {finalText}
    </p>
  );
}
