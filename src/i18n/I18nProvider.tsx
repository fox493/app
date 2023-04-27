import { FC, PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './';

const I18nProvider: FC<PropsWithChildren> = ({ children }) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

export default I18nProvider;
