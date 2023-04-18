import { FC } from 'react';
import { InnerLogoProps } from './LogoProps';
import withLogo from './withLogo';

const TokenYFI: FC<InnerLogoProps> = ({ size }) => (
  <svg
    className="raft__logo raft__logo-token-YFI"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 0C31.044 0 40 8.956 40 20C40 31.044 31.044 40 20 40C8.956 40 0 31.044 0 20C0 8.956 8.956 0 20 0Z"
      fill="#006AE3"
    />
    <path d="M19.176 28.432V11.792H20.988V28.432H19.176Z" fill="white" />
    <path
      d="M28.4004 17.3359L22.8044 18.8199L21.5564 13.0119L23.2204 12.6359L23.8764 15.3879C23.8764 15.3879 25.3884 12.9079 23.3724 10.3399C22.1844 9.01985 21.6204 8.96385 20.2884 8.75585C19.1164 8.58785 16.3924 8.98385 15.5804 12.1639C15.2364 14.2119 15.6244 15.7279 18.2644 17.7119L18.1164 19.9199C18.1164 19.9199 15.1684 17.8439 14.4084 16.3879C13.8204 15.2359 12.8124 12.9599 14.6324 9.79185C15.6124 8.20785 17.5444 6.68785 20.9484 6.84785C22.6604 6.91985 26.8404 9.01185 26.1924 13.8999C26.0804 14.8159 25.6044 16.0359 25.6044 16.0359L27.9004 15.5239L28.4004 17.3359Z"
      fill="white"
    />
    <path
      d="M25.2034 30.3561C24.1794 31.9121 22.2074 33.3801 18.8114 33.1321C17.0994 33.0161 12.9794 30.8121 13.7554 25.9441C13.8914 25.0321 14.3994 23.8281 14.3994 23.8281L12.0914 24.2761L11.6394 22.4561L17.2754 21.1201L18.3714 26.9601L16.6954 27.2921L16.1114 24.5201C16.1114 24.5201 14.5354 26.9561 16.4794 29.5801C17.6314 30.9321 18.1914 31.0001 19.5234 31.2441C20.6874 31.4441 23.4234 31.1161 24.3194 27.9601C24.7154 25.9241 24.3674 24.3961 21.7834 22.3401L21.9914 20.1361C21.9914 20.1361 24.8834 22.2881 25.6034 23.7641C26.1554 24.9361 27.1034 27.2401 25.2034 30.3561Z"
      fill="white"
    />
  </svg>
);

export default withLogo(TokenYFI);
