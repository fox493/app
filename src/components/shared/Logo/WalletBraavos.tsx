import { FC } from 'react';
import { InnerLogoProps } from './LogoProps';
import withLogo from './withLogo';

const ArgentLogo: FC<InnerLogoProps> = ({ size }) => (
  <svg
    className="raft__logo raft__logo-wallet-braavos"
    width={size}
    height={size}
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5877 1.98665C13.6247 2.04829 13.5757 2.12449 13.5028 2.12449C12.0278 2.12449 10.8288 3.27195 10.8006 4.69781C10.2955 4.60515 9.7722 4.59819 9.2552 4.68378C9.21949 3.26443 8.02346 2.12449 6.55328 2.12449C6.48039 2.12449 6.43134 2.04824 6.46842 1.98655C7.18243 0.798379 8.50919 0 10.028 0C11.5469 0 12.8737 0.798427 13.5877 1.98665ZM18.597 10.996C18.8098 11.0593 19.0124 10.8754 18.9525 10.665C17.8072 6.64109 13.3477 5.00918 10.0078 5.00918C6.66339 5.00918 2.10436 6.69178 1.07499 10.675C1.02103 10.8838 1.22286 11.0614 1.43246 10.9982L9.82559 8.47123C9.91831 8.4433 10.0174 8.4431 10.1103 8.47075L18.597 10.996ZM1.19289 11.4924L9.83077 8.91835C9.92296 8.8909 10.0213 8.89085 10.1136 8.91816L18.8046 11.4937C19.5143 11.704 20 12.3464 20 13.0747V20.6631C19.9671 22.5154 18.2736 24 16.3891 24H13.259C12.9496 24 12.699 23.7541 12.699 23.4501V20.7895C12.699 19.7419 13.3301 18.7937 14.3065 18.374C15.6154 17.8114 17.1639 17.0505 17.4551 15.5235C17.5492 15.0306 17.2221 14.5552 16.7218 14.4575C15.4567 14.2104 14.0541 14.3059 12.8682 14.8271C11.5217 15.4188 11.1695 16.403 11.0391 17.725L10.8811 19.149C10.8328 19.5842 10.4175 19.9177 9.97215 19.9177C9.51138 19.9177 9.1659 19.5729 9.11598 19.1226L8.96087 17.725C8.84915 16.5927 8.64671 15.4928 7.45542 14.9693C6.09656 14.3721 4.73097 14.1738 3.27822 14.4575C2.77793 14.5552 2.45084 15.0306 2.54484 15.5235C2.83865 17.0638 4.37494 17.8073 5.69349 18.374C6.66993 18.7937 7.30095 19.7419 7.30095 20.7895V23.4496C7.30095 23.7536 7.05049 24 6.74106 24H3.6109C1.72639 24 0.0329113 22.5154 0 20.6631V13.0728C0 12.3453 0.484426 11.7036 1.19289 11.4924Z"
      fill="url(#paint0_linear_8758_218631)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_8758_218631"
        x1="9.80391"
        y1="-1.296"
        x2="18.3005"
        y2="24.2049"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F5D45E" />
        <stop offset="1" stopColor="#FF9600" />
      </linearGradient>
    </defs>
  </svg>
);

export default withLogo(ArgentLogo);
