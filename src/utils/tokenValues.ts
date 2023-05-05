import { Numberish, Decimal, DecimalFormat } from 'tempus-decimal';
import {
  COLLATERAL_TOKEN_UI_PRECISION,
  MULTIPLIER_UI_PRECISION,
  R_PRICE_UI_PRECISION,
  R_TOKEN_UI_PRECISION,
  USD_UI_PRECISION,
} from '../constants';
import { Nullable, Token } from '../interfaces';

type TokenValues = {
  amount: Nullable<Decimal>;
  price: Nullable<Decimal>;
  value: Nullable<Decimal>;
  amountFormatted: Nullable<string>;
  amountFormattedMultiplier: Nullable<string>;
  priceFormatted: Nullable<string>;
  priceFormattedIntegral: Nullable<string>;
  valueFormatted: Nullable<string>;
  valueFormattedMultiplier: Nullable<string>;
};

const formatCurrency = (value: Decimal, precision = USD_UI_PRECISION) =>
  DecimalFormat.format(value, {
    style: 'currency',
    currency: '$',
    fractionDigits: precision,
  });

const formatCurrencyMultiplier = (value: Decimal) =>
  DecimalFormat.format(value, {
    style: 'multiplier',
    currency: '$',
    fractionDigits: MULTIPLIER_UI_PRECISION,
    noMultiplierFractionDigits: USD_UI_PRECISION,
  });

export const getTokenValues = (amount: Numberish, price: Nullable<Decimal>, token: Token): TokenValues => {
  if (!amount && amount !== 0) {
    return {
      amount: null,
      price: null,
      value: null,
      amountFormatted: null,
      amountFormattedMultiplier: null,
      priceFormatted: null,
      priceFormattedIntegral: null,
      valueFormatted: null,
      valueFormattedMultiplier: null,
    };
  }

  const tokenAmount = new Decimal(amount);
  const tokenValue = price ? tokenAmount.mul(price) : null;

  switch (token) {
    case 'R':
      return {
        amount: tokenAmount,
        price,
        value: tokenValue,
        amountFormatted: DecimalFormat.format(tokenAmount, { style: 'decimal', fractionDigits: R_TOKEN_UI_PRECISION }),
        amountFormattedMultiplier: DecimalFormat.format(tokenAmount, {
          style: 'multiplier',
          currency: token,
          fractionDigits: MULTIPLIER_UI_PRECISION,
          noMultiplierFractionDigits: R_TOKEN_UI_PRECISION,
        }),
        // only for R price we want to format it in 4 decimal places
        priceFormatted: price ? formatCurrency(price, R_PRICE_UI_PRECISION) : null,
        priceFormattedIntegral: price ? formatCurrency(price, 0) : null,
        valueFormatted: tokenValue ? formatCurrency(tokenValue) : null,
        valueFormattedMultiplier: tokenValue ? formatCurrencyMultiplier(tokenValue) : null,
      };
    case 'ETH':
    case 'stETH':
    case 'wstETH':
      return {
        amount: tokenAmount,
        price,
        value: tokenValue,
        amountFormatted: DecimalFormat.format(tokenAmount, {
          style: 'decimal',
          fractionDigits: COLLATERAL_TOKEN_UI_PRECISION,
        }),
        amountFormattedMultiplier: DecimalFormat.format(tokenAmount, {
          style: 'multiplier',
          currency: token,
          fractionDigits: MULTIPLIER_UI_PRECISION,
          noMultiplierFractionDigits: COLLATERAL_TOKEN_UI_PRECISION,
        }),
        priceFormatted: price ? formatCurrency(price) : null,
        priceFormattedIntegral: price ? formatCurrency(price, 0) : null,
        valueFormatted: tokenValue ? formatCurrency(tokenValue) : null,
        valueFormattedMultiplier: tokenValue ? formatCurrencyMultiplier(tokenValue) : null,
      };
  }
};
