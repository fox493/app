import { FC } from 'react';
import { InnerLogoProps } from './LogoProps';
import withLogo from './withLogo';

const TokenWBTC: FC<InnerLogoProps> = ({ size }) => (
  <svg
    className="raft__logo raft__logo-token-WBTC"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16Z"
      fill="white"
    />
    <path
      d="M26.0926 6.71581L25.2139 7.59445C27.3105 9.8872 28.4732 12.8816 28.4732 15.9884C28.4732 19.0952 27.3105 22.0895 25.2139 24.3823L26.0926 25.2609C28.4242 22.7319 29.7187 19.418 29.7187 15.9781C29.7187 12.5383 28.4242 9.22438 26.0926 6.69531V6.71581Z"
      fill="#5A5564"
    />
    <path
      d="M7.61488 6.79185C9.90763 4.69527 12.902 3.53261 16.0088 3.53261C19.1156 3.53261 22.11 4.69527 24.4027 6.79185L25.2814 5.91321C22.7523 3.5816 19.4384 2.28711 15.9985 2.28711C12.5587 2.28711 9.24481 3.5816 6.71574 5.91321L7.61488 6.79185Z"
      fill="#5A5564"
    />
    <path
      d="M6.79185 24.3911C4.69776 22.0989 3.53663 19.1063 3.53663 16.0016C3.53663 12.8968 4.69776 9.90428 6.79185 7.61204L5.91321 6.7334C3.5816 9.26247 2.28711 12.5764 2.28711 16.0162C2.28711 19.4561 3.5816 22.7699 5.91321 25.299L6.79185 24.3911Z"
      fill="#5A5564"
    />
    <path
      d="M24.391 25.2021C22.0983 27.2987 19.1039 28.4614 15.9971 28.4614C12.8903 28.4614 9.89592 27.2987 7.60317 25.2021L6.72453 26.0808C9.2536 28.4124 12.5675 29.7069 16.0073 29.7069C19.4472 29.7069 22.7611 28.4124 25.2901 26.0808L24.391 25.2021Z"
      fill="#5A5564"
    />
    <path
      d="M21.5471 13.0684C21.3714 11.235 19.7898 10.6199 17.7895 10.4325V7.90788H16.2431V10.3856C15.836 10.3856 15.4201 10.3856 15.0071 10.3856V7.90788H13.4724V10.4501H10.3357V12.1048C10.3357 12.1048 11.4779 12.0843 11.4604 12.1048C11.6663 12.0822 11.873 12.1404 12.0369 12.2671C12.2008 12.3939 12.3091 12.5793 12.339 12.7843V19.7431C12.3346 19.8154 12.3157 19.8861 12.2835 19.951C12.2513 20.0159 12.2065 20.0737 12.1515 20.1209C12.0977 20.1691 12.0346 20.2058 11.9662 20.229C11.8977 20.2522 11.8253 20.2612 11.7532 20.2557C11.7737 20.2732 10.6286 20.2557 10.6286 20.2557L10.3357 22.1037H13.4431V24.6869H14.9895V22.1418H16.2255V24.6752H17.7748V22.1213C20.3873 21.9632 22.209 21.3188 22.4375 18.8733C22.622 16.9051 21.6965 16.0265 20.2174 15.6721C21.1166 15.2299 21.6731 14.4098 21.5471 13.0684ZM19.3798 18.5687C19.3798 20.49 16.0878 20.2703 15.0393 20.2703V16.8612C16.0878 16.8641 19.3798 16.5625 19.3798 18.5687ZM18.6623 13.7655C18.6623 15.5227 15.915 15.3089 15.0423 15.3089V12.2103C15.915 12.2103 18.6623 11.935 18.6623 13.7655Z"
      fill="#F09242"
    />
    <path
      d="M15.9971 32C12.8328 31.9994 9.73979 31.0606 7.10906 29.3023C4.47832 27.544 2.42801 25.0451 1.21737 22.1216C0.00673517 19.1981 -0.309871 15.9813 0.307586 12.8778C0.925042 9.77442 2.44883 6.92376 4.6863 4.6863C6.92376 2.44883 9.77442 0.925042 12.8778 0.307586C15.9813 -0.309871 19.1981 0.00673517 22.1216 1.21737C25.0451 2.42801 27.544 4.47832 29.3023 7.10906C31.0606 9.73979 31.9994 12.8328 32 15.9971C32.0004 18.0987 31.5867 20.1798 30.7826 22.1216C29.9785 24.0633 28.7998 25.8276 27.3137 27.3137C25.8276 28.7998 24.0633 29.9785 22.1216 30.7826C20.1798 31.5867 18.0987 32.0004 15.9971 32ZM15.9971 1.24767C13.0818 1.24999 10.2327 2.1165 7.8098 3.73769C5.38691 5.35888 3.49901 7.66197 2.38473 10.3559C1.27045 13.0498 0.97981 16.0135 1.54954 18.8726C2.11927 21.7316 3.5238 24.3576 5.5856 26.4185C7.6474 28.4795 10.2739 29.883 13.1332 30.4516C15.9924 31.0202 18.9561 30.7284 21.6495 29.613C24.343 28.4977 26.6453 26.6089 28.2656 24.1853C29.8858 21.7618 30.7512 18.9123 30.7523 15.9971C30.7531 14.0594 30.3719 12.1407 29.6306 10.3505C28.8893 8.56025 27.8024 6.93372 26.432 5.56388C25.0616 4.19404 23.4346 3.10776 21.6441 2.36715C19.8536 1.62654 17.9347 1.24613 15.9971 1.24767Z"
      fill="#282138"
    />
  </svg>
);

export default withLogo(TokenWBTC);
