import { FC } from 'react';
import { InnerIconProps, withIcon } from 'tempus-ui';

const ArrowRight: FC<InnerIconProps> = ({ size }) => {
  const color = 'var(--arrowRightColor, #707b7e)';

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default withIcon(ArrowRight);
