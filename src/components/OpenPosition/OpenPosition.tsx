import { useCallback, useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalFormat } from '@tempusfinance/decimal';
import { Link, TokenLogo } from 'tempus-ui';
import { v4 as uuid } from 'uuid';
import { useConnectWallet } from '@web3-onboard/react';
import {
  CollateralToken,
  ERC20PermitSignatureStruct,
  MIN_COLLATERAL_RATIO,
  R_TOKEN,
  Token,
  TOKENS,
  TOKENS_WITH_PERMIT,
} from '@raft-fi/sdk';
import {
  useWallet,
  useBorrow,
  useTokenPrices,
  useTokenBalances,
  useNetwork,
  useTokenAllowances,
  useTokenWhitelists,
  useApprove,
  useWhitelistDelegate,
  TokenWhitelistMap,
  TokenAllowanceMap,
  useCollateralBorrowingRate,
  useProtocolStats,
} from '../../hooks';
import {
  COLLATERAL_TOKEN_UI_PRECISION,
  DISPLAY_BASE_TOKEN,
  HEALTHY_RATIO,
  HEALTHY_RATIO_BUFFER,
  INPUT_PREVIEW_DIGITS,
  MIN_BORROW_AMOUNT,
  R_TOKEN_UI_PRECISION,
  SUPPORTED_COLLATERAL_TOKENS,
} from '../../constants';
import { getCollateralRatioLevel, getCollateralRatioLabel, getTokenValues, isCollateralToken } from '../../utils';
import { Button, CurrencyInput, Typography, Icon, Loading, TooltipWrapper, Tooltip, ValueLabel } from '../shared';
import { Nullable } from '../../interfaces';

import './OpenPosition.scss';

type TokenApprovedMap = {
  [token in Token]: Nullable<boolean>;
};

type TokenSignatureMap = {
  [token in Token]: Nullable<ERC20PermitSignatureStruct>;
};

const DEFAULT_MAP = TOKENS.reduce(
  (map, token) => ({
    ...map,
    [token]: null,
  }),
  {},
);

const OpenPosition = () => {
  const [, connect] = useConnectWallet();
  const { isWrongNetwork } = useNetwork();

  const protocolStats = useProtocolStats();
  const tokenPriceMap = useTokenPrices();
  const tokenBalanceMap = useTokenBalances();
  const tokenAllowanceMap = useTokenAllowances();
  const tokenWhitelistMap = useTokenWhitelists();
  const wallet = useWallet();
  const borrowingRate = useCollateralBorrowingRate();
  const { borrow, borrowStatus } = useBorrow();
  const { approve, approveStatus } = useApprove();
  const { whitelistDelegate, whitelistDelegateStatus } = useWhitelistDelegate();

  const [tokenWhitelistMapWhenLoaded, setTokenWhitelistMapWhenLoaded] = useState<TokenWhitelistMap>(
    DEFAULT_MAP as TokenWhitelistMap,
  );
  const [tokenAllowanceMapWhenLoaded, setTokenAllowanceMapWhenLoaded] = useState<TokenAllowanceMap>(
    DEFAULT_MAP as TokenAllowanceMap,
  );
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<CollateralToken>('stETH');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [actionButtonState, setActionButtonState] = useState<string>('default');
  const [maxButtonDisabled, setMaxButtonDisabled] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [hasWhitelistProceeded, setHasWhitelistProceeded] = useState<boolean>(false);
  const [hasApprovalProceeded, setHasApprovalProceeded] = useState<TokenApprovedMap>(DEFAULT_MAP as TokenApprovedMap);
  const [tokenSignatureMap, setTokenSignatureMap] = useState<TokenSignatureMap>(DEFAULT_MAP as TokenSignatureMap);

  const collateralTokenValues = useMemo(
    () => getTokenValues(collateralAmount, tokenPriceMap[selectedCollateralToken], selectedCollateralToken),
    [collateralAmount, selectedCollateralToken, tokenPriceMap],
  );

  const borrowAmountDecimal = useMemo(() => {
    return Decimal.parse(borrowAmount, 0);
  }, [borrowAmount]);

  const borrowTokenValues = useMemo(
    () => getTokenValues(borrowAmount, tokenPriceMap[R_TOKEN], R_TOKEN),
    [borrowAmount, tokenPriceMap],
  );
  const baseTokenValues = useMemo(
    () => getTokenValues(borrowAmount, tokenPriceMap[DISPLAY_BASE_TOKEN], R_TOKEN),
    [borrowAmount, tokenPriceMap],
  );
  const selectedCollateralTokenBalanceValues = useMemo(
    () =>
      getTokenValues(
        tokenBalanceMap[selectedCollateralToken],
        tokenPriceMap[selectedCollateralToken],
        selectedCollateralToken,
      ),
    [selectedCollateralToken, tokenBalanceMap, tokenPriceMap],
  );
  const selectedCollateralTokenAllowance = useMemo(
    () => tokenAllowanceMap[selectedCollateralToken],
    [selectedCollateralToken, tokenAllowanceMap],
  );
  const selectedCollateralTokenWhitelist = useMemo(
    () => tokenWhitelistMap[selectedCollateralToken],
    [selectedCollateralToken, tokenWhitelistMap],
  );

  // store the whitelist status at the loaded time
  useEffect(() => {
    const map = Object.entries(tokenWhitelistMap).reduce((map, [token, whitelisted]) => {
      if (tokenWhitelistMapWhenLoaded[token] === null) {
        map[token] = whitelisted;
      }
      return map;
    }, {} as TokenWhitelistMap);

    if (!Object.entries(map).every(([token, whitelisted]) => tokenWhitelistMapWhenLoaded[token] === whitelisted)) {
      setTokenWhitelistMapWhenLoaded(map);
    }
  }, [tokenWhitelistMap, tokenWhitelistMapWhenLoaded]);

  // store the allowance status at the loaded time
  useEffect(() => {
    const map = Object.entries(tokenAllowanceMap).reduce((map, [token, allowance]) => {
      if (tokenAllowanceMapWhenLoaded[token] === null) {
        map[token] = allowance;
      }
      return map;
    }, {} as TokenAllowanceMap);

    if (
      !Object.entries(map).every(
        ([token, allowance]) =>
          (tokenAllowanceMapWhenLoaded[token] === null && tokenAllowanceMap[token] === null) ||
          tokenAllowanceMapWhenLoaded[token]?.eq(allowance),
      )
    ) {
      setTokenAllowanceMapWhenLoaded(map);
    }
  }, [tokenAllowanceMap, tokenAllowanceMapWhenLoaded]);

  /**
   * Fill in collateral and debt input fields automatically if they are empty.
   * Debt is set to 3k (minimum) and collateral is set to that collateral ratio is around 220% or a bit more.
   */
  useEffect(() => {
    if (!hasChanged) {
      const collateralBalance = tokenBalanceMap[selectedCollateralToken];
      const collateralPrice = tokenPriceMap[selectedCollateralToken];
      const rTokenPrice = tokenPriceMap[R_TOKEN];

      if (!collateralPrice || collateralPrice.isZero() || !rTokenPrice) {
        return;
      }

      // Borrow amount is always set to min amount
      const borrowAmount = new Decimal(MIN_BORROW_AMOUNT);
      const borrowAmountValue = rTokenPrice.mul(borrowAmount);

      // Calculate minimum collateral amount so that resulting collateral ratio is at least 220%
      const collateralAmount = borrowAmountValue.mul(HEALTHY_RATIO + HEALTHY_RATIO_BUFFER).div(collateralPrice);

      // TODO - Add ceil() function to decimal library
      const truncatedCollateral = new Decimal(collateralAmount.toTruncated(COLLATERAL_TOKEN_UI_PRECISION));
      const collateralAmountCeiled = truncatedCollateral.lt(collateralAmount)
        ? truncatedCollateral.add(`${'0.'.padEnd(COLLATERAL_TOKEN_UI_PRECISION + 1, '0')}1`)
        : truncatedCollateral;

      // Only fill in calculated values if user has enough collateral
      if (collateralBalance && collateralBalance.gte(collateralAmountCeiled)) {
        setCollateralAmount(collateralAmountCeiled.toString());
        setBorrowAmount(borrowAmount.toString());
        // If wallet is connected and user does not have enough collateral, rest inputs to empty state
      } else if (wallet) {
        setCollateralAmount('');
        setBorrowAmount('');
      }
      // If wallet is not connected just set input values to calculated ones without checking balance
      else if (!wallet) {
        setCollateralAmount(collateralAmountCeiled.toString());
        setBorrowAmount(borrowAmount.toString());
      }
    }
  }, [
    hasChanged,
    selectedCollateralToken,
    selectedCollateralTokenBalanceValues.amount,
    selectedCollateralTokenBalanceValues.price,
    tokenBalanceMap,
    tokenPriceMap,
    wallet,
  ]);

  const baseTokenAmount = useMemo(() => {
    if (!collateralTokenValues.amount || !collateralTokenValues.value) {
      return Decimal.ZERO;
    }

    switch (selectedCollateralToken) {
      case 'ETH':
      case 'stETH':
      default:
        return collateralTokenValues.amount;
      case 'wstETH':
        if (!collateralTokenValues.price || !baseTokenValues.price || baseTokenValues.price.isZero()) {
          return null;
        }

        return collateralTokenValues.value.div(baseTokenValues.price);
    }
  }, [
    baseTokenValues.price,
    collateralTokenValues.amount,
    collateralTokenValues.price,
    collateralTokenValues.value,
    selectedCollateralToken,
  ]);
  const baseTokenAmountFormatted = useMemo(
    () =>
      DecimalFormat.format(baseTokenAmount ?? Decimal.ZERO, {
        style: 'currency',
        currency: DISPLAY_BASE_TOKEN,
        fractionDigits: COLLATERAL_TOKEN_UI_PRECISION,
        lessThanFormat: true,
      }),
    [baseTokenAmount],
  );

  const collateralizationRatio = useMemo(() => {
    if (collateralTokenValues.value === null || borrowTokenValues.value === null || borrowTokenValues.value.isZero()) {
      return null;
    }

    const borrowAmountDecimal = new Decimal(borrowAmount || 0);
    if (borrowAmountDecimal.lt(MIN_BORROW_AMOUNT)) {
      return null;
    }

    return collateralTokenValues.value.div(borrowTokenValues.value);
  }, [borrowAmount, borrowTokenValues.value, collateralTokenValues.value]);
  const collateralizationRatioFormatted = useMemo(
    () =>
      collateralizationRatio
        ? DecimalFormat.format(collateralizationRatio, { style: 'percentage', fractionDigits: 2, pad: true })
        : 'N/A',
    [collateralizationRatio],
  );

  const collateralAmountWithEllipse = useMemo(() => {
    if (!collateralTokenValues.amount) {
      return null;
    }

    const original = collateralTokenValues.amount.toString();
    const truncated = collateralTokenValues.amount.toTruncated(INPUT_PREVIEW_DIGITS);

    return original === truncated ? original : `${truncated}...`;
  }, [collateralTokenValues.amount]);
  const borrowAmountWithEllipse = useMemo(() => {
    if (!borrowTokenValues.amount) {
      return null;
    }

    const original = borrowTokenValues.amount.toString();
    const truncated = borrowTokenValues.amount.toTruncated(INPUT_PREVIEW_DIGITS);

    return original === truncated ? original : `${truncated}...`;
  }, [borrowTokenValues.amount]);

  const collateralRatioLevel = useMemo(() => getCollateralRatioLevel(collateralizationRatio), [collateralizationRatio]);
  const collateralRatioLabel = useMemo(() => getCollateralRatioLabel(collateralizationRatio), [collateralizationRatio]);

  const rTokenBalance = useMemo(() => tokenBalanceMap[R_TOKEN], [tokenBalanceMap]);
  const rTokenBalanceFormatted = useMemo(() => {
    if (!rTokenBalance) {
      return '';
    }

    return DecimalFormat.format(rTokenBalance, {
      style: 'currency',
      currency: R_TOKEN,
      fractionDigits: R_TOKEN_UI_PRECISION,
      lessThanFormat: true,
    });
  }, [rTokenBalance]);

  const minBorrowFormatted = useMemo(() => DecimalFormat.format(MIN_BORROW_AMOUNT, { style: 'decimal' }), []);

  const walletConnected = useMemo(() => Boolean(wallet), [wallet]);

  const hasInputFilled = useMemo(
    () => collateralTokenValues.amount && borrowTokenValues.amount,
    [borrowTokenValues.amount, collateralTokenValues.amount],
  );
  const hasEnoughCollateralTokenBalance = useMemo(
    () =>
      !walletConnected ||
      !collateralTokenValues.amount ||
      Boolean(
        selectedCollateralTokenBalanceValues.amount &&
          collateralTokenValues.amount.lte(selectedCollateralTokenBalanceValues.amount),
      ),
    [collateralTokenValues.amount, selectedCollateralTokenBalanceValues, walletConnected],
  );
  const hasMinBorrow = useMemo(
    () => !borrowTokenValues.amount || borrowTokenValues.amount.gte(MIN_BORROW_AMOUNT),
    [borrowTokenValues.amount],
  );
  const hasMinRatio = useMemo(
    () => !collateralizationRatio || collateralizationRatio.gte(MIN_COLLATERAL_RATIO),
    [collateralizationRatio],
  );

  const isOverMaxBorrow = useMemo(() => {
    if (!protocolStats?.debtSupply) {
      return true;
    }

    const totalDebt = protocolStats.debtSupply;

    const maxBorrowAmount = totalDebt.div(10);
    if (borrowAmountDecimal.gt(maxBorrowAmount)) {
      return true;
    }
    return false;
  }, [borrowAmountDecimal, protocolStats?.debtSupply]);

  const canBorrow = useMemo(
    () =>
      hasInputFilled &&
      hasEnoughCollateralTokenBalance &&
      hasMinBorrow &&
      hasMinRatio &&
      !isWrongNetwork &&
      !isOverMaxBorrow,
    [hasEnoughCollateralTokenBalance, hasInputFilled, hasMinBorrow, hasMinRatio, isWrongNetwork, isOverMaxBorrow],
  );

  const hasWhitelisted = useMemo(() => Boolean(selectedCollateralTokenWhitelist), [selectedCollateralTokenWhitelist]);
  const hasEnoughCollateralAllowance = useMemo(
    () => Boolean(selectedCollateralTokenAllowance?.gte(collateralTokenValues.amount ?? Decimal.ZERO)),
    [collateralTokenValues.amount, selectedCollateralTokenAllowance],
  );
  const hasCollateralPermitSignature = useMemo(
    () => Boolean(tokenSignatureMap[selectedCollateralToken]),
    [selectedCollateralToken, tokenSignatureMap],
  );

  // steps that user need to execute when component loaded
  const executionSteps = useMemo(() => {
    // if whitelist map not yet ready,
    // or allowance map not yet ready,
    // or wrong network,
    // return 1
    if (
      tokenWhitelistMapWhenLoaded[selectedCollateralToken] === null ||
      tokenAllowanceMapWhenLoaded[selectedCollateralToken] === null ||
      isWrongNetwork
    ) {
      return 1;
    }

    let whitelistStep = 0;

    if (TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token with permit, whitelistStep = 0
      whitelistStep = 0;
    } else if (hasWhitelistProceeded) {
      // user has proceeded whitelist, whitelistStep = 1
      whitelistStep = 1;
    } else if (!tokenWhitelistMapWhenLoaded[selectedCollateralToken]) {
      // not whitelisted on load, whitelistStep = 1
      whitelistStep = 1;
    }

    let collateralApprovalStep = 0;

    if (TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token with permit, collateralApprovalStep = 0
      collateralApprovalStep = 0;
    } else if (hasApprovalProceeded[selectedCollateralToken]) {
      // user has proceeded approve, collateralApprovalStep = 1
      collateralApprovalStep = 1;
    } else if (tokenAllowanceMapWhenLoaded[selectedCollateralToken]?.lt(collateralTokenValues.amount ?? Decimal.ZERO)) {
      // not enough allowance on load, collateralApprovalStep = 1
      collateralApprovalStep = 1;
    }

    let collateralPermitStep = 0;

    if (!TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token not with permit, collateralPermitStep = 0
      collateralPermitStep = 0;
    } else if (tokenSignatureMap[selectedCollateralToken]) {
      // user has proceeded approve, collateralPermitStep = 1
      collateralPermitStep = 1;
    } else if (collateralTokenValues.amount?.gt(0)) {
      // input > 0, collateralPermitStep = 1
      collateralPermitStep = 1;
    }

    const executionStep = 1;

    return whitelistStep + collateralApprovalStep + collateralPermitStep + executionStep;
  }, [
    collateralTokenValues.amount,
    hasApprovalProceeded,
    hasWhitelistProceeded,
    isWrongNetwork,
    selectedCollateralToken,
    tokenAllowanceMapWhenLoaded,
    tokenSignatureMap,
    tokenWhitelistMapWhenLoaded,
  ]);
  // steps that user has proceeded since component loaded
  const executedSteps = useMemo(() => {
    if (isWrongNetwork) {
      return 1;
    }

    let whitelistStep = 0;

    if (TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token with permit, whitelistStep = 0
      whitelistStep = 0;
    } else if (hasWhitelistProceeded && hasWhitelisted) {
      // user has proceeded whitelist and still have whitelisted, whitelistStep = 1
      whitelistStep = 1;
    }

    let collateralApprovalStep = 0;

    if (TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token with permit, collateralApprovalStep = 0
      collateralApprovalStep = 0;
    } else if (hasApprovalProceeded[selectedCollateralToken] && hasEnoughCollateralAllowance) {
      // user has proceeded approve and still have enough allowance, collateralApprovalStep = 1
      collateralApprovalStep = 1;
    }

    let collateralPermitStep = 0;

    if (!TOKENS_WITH_PERMIT.has(selectedCollateralToken)) {
      // token not with permit, collateralPermitStep = 0
      collateralPermitStep = 0;
    } else if (tokenSignatureMap[selectedCollateralToken]) {
      // user has proceeded approve, collateralPermitStep = 1
      collateralPermitStep = 1;
    }

    const executionStep = 1;

    return whitelistStep + collateralApprovalStep + collateralPermitStep + executionStep;
  }, [
    hasApprovalProceeded,
    hasEnoughCollateralAllowance,
    hasWhitelistProceeded,
    hasWhitelisted,
    isWrongNetwork,
    selectedCollateralToken,
    tokenSignatureMap,
  ]);

  const collateralErrorMsg = useMemo(() => {
    if (!hasEnoughCollateralTokenBalance) {
      return 'Insufficient funds';
    }
  }, [hasEnoughCollateralTokenBalance]);

  const debtErrorMsg = useMemo(() => {
    if (!hasMinBorrow) {
      return `You need to generate at least ${minBorrowFormatted} R`;
    }

    if (!hasMinRatio) {
      return 'Collateralization ratio is below the minimum threshold';
    }

    if (isOverMaxBorrow) {
      return 'Amount exceeds maximum debt allowed per Position';
    }
  }, [hasMinBorrow, hasMinRatio, isOverMaxBorrow, minBorrowFormatted]);

  const buttonLabel = useMemo(() => {
    if (!walletConnected) {
      return 'Connect wallet';
    }

    // data not yet loaded will set executionSteps = 1, always show "Execution"
    if (executionSteps === 1) {
      return borrowStatus?.pending ? 'Executing' : 'Execute';
    }

    if (!hasWhitelisted) {
      return whitelistDelegateStatus?.pending
        ? `Whitelisting stETH (${executedSteps}/${executionSteps})`
        : `Whitelist stETH (${executedSteps}/${executionSteps})`;
    }

    if (!hasEnoughCollateralAllowance && !hasCollateralPermitSignature) {
      return approveStatus?.pending
        ? `Approving ${selectedCollateralToken} (${executedSteps}/${executionSteps})`
        : `Approve ${selectedCollateralToken} (${executedSteps}/${executionSteps})`;
    }

    return borrowStatus?.pending
      ? `Executing (${executedSteps}/${executionSteps})`
      : `Execute (${executedSteps}/${executionSteps})`;
  }, [
    walletConnected,
    hasWhitelisted,
    hasEnoughCollateralAllowance,
    hasCollateralPermitSignature,
    borrowStatus?.pending,
    executedSteps,
    executionSteps,
    whitelistDelegateStatus?.pending,
    approveStatus?.pending,
    selectedCollateralToken,
  ]);

  const buttonDisabled = useMemo(
    () => actionButtonState === 'loading' || (walletConnected && !canBorrow),
    [canBorrow, actionButtonState, walletConnected],
  );

  const onConnectWallet = useCallback(() => {
    connect();
  }, [connect]);

  const onAction = useCallback(() => {
    if (!canBorrow) {
      return;
    }

    if (!hasWhitelisted) {
      whitelistDelegate({ token: selectedCollateralToken, txnId: uuid() });
      return;
    }

    if (hasCollateralPermitSignature) {
      borrow({
        collateralChange: new Decimal(collateralAmount),
        debtChange: new Decimal(borrowAmount),
        collateralToken: selectedCollateralToken,
        currentUserCollateral: Decimal.ZERO,
        currentUserDebt: Decimal.ZERO,
        txnId: uuid(),
        options: {
          collateralPermitSignature: tokenSignatureMap[selectedCollateralToken] ?? undefined,
        },
      });
    } else {
      const action = hasEnoughCollateralAllowance ? borrow : approve;

      action({
        collateralChange: new Decimal(collateralAmount),
        debtChange: new Decimal(borrowAmount),
        collateralToken: selectedCollateralToken,
        currentUserCollateral: Decimal.ZERO,
        currentUserDebt: Decimal.ZERO,
        txnId: uuid(),
      });
    }
  }, [
    approve,
    borrow,
    borrowAmount,
    canBorrow,
    collateralAmount,
    hasCollateralPermitSignature,
    hasEnoughCollateralAllowance,
    hasWhitelisted,
    selectedCollateralToken,
    tokenSignatureMap,
    whitelistDelegate,
  ]);

  const handleCollateralTokenChange = useCallback((token: string) => {
    if (isCollateralToken(token)) {
      setMaxButtonDisabled(false);
      setSelectedCollateralToken(token);
      setHasChanged(true);
    }
  }, []);

  const handleCollateralTokenBlur = useCallback(() => {
    // if borrow input is not empty, do nth
    if (borrowTokenValues.amount) {
      return;
    }

    // if borrow input is null, borrowTokenValues.price will be null, so use the price map here
    const borrowTokenPrice = tokenPriceMap[R_TOKEN];

    if (!collateralTokenValues.value || !borrowTokenPrice || borrowTokenPrice.isZero() || !HEALTHY_RATIO) {
      return;
    }

    const defaultBorrowAmount = collateralTokenValues.value
      .div(borrowTokenPrice)
      .div(HEALTHY_RATIO + HEALTHY_RATIO_BUFFER)
      .toString();
    setBorrowAmount(defaultBorrowAmount);
    setHasChanged(true);
  }, [borrowTokenValues.amount, collateralTokenValues.value, tokenPriceMap]);

  const handleBorrowTokenBlur = useCallback(() => {
    // if collateral input is not empty, do nth
    if (collateralTokenValues.amount) {
      return;
    }

    // if collateral input is null, collateralTokenValues.price will be null, so use the price map here
    const collateralTokenPrice = tokenPriceMap[selectedCollateralToken];

    if (!borrowTokenValues.value || !collateralTokenPrice || collateralTokenPrice.isZero()) {
      return;
    }

    const defaultCollateralAmount = borrowTokenValues.value
      .mul(HEALTHY_RATIO + HEALTHY_RATIO_BUFFER)
      .div(collateralTokenPrice)
      .toString();
    setCollateralAmount(defaultCollateralAmount);
    setHasChanged(true);
  }, [borrowTokenValues.value, collateralTokenValues.amount, selectedCollateralToken, tokenPriceMap]);

  /**
   * Update action button state based on current approve/borrow request status
   */
  useEffect(() => {
    if (!whitelistDelegateStatus && !approveStatus && !borrowStatus) {
      return;
    }

    if (whitelistDelegateStatus?.success) {
      setHasWhitelistProceeded(true);
    }

    if (approveStatus?.success) {
      const approvedCollateralToken = approveStatus.request.collateralToken;
      if (approveStatus.collateralPermit) {
        if (tokenSignatureMap[approvedCollateralToken] !== approveStatus.collateralPermit) {
          setTokenSignatureMap({
            ...tokenSignatureMap,
            [approvedCollateralToken]: approveStatus.collateralPermit,
          });
        }
      } else {
        if (!hasApprovalProceeded[approvedCollateralToken]) {
          setHasApprovalProceeded({
            ...hasApprovalProceeded,
            [approvedCollateralToken]: true,
          });
        }
      }
    }

    if (whitelistDelegateStatus?.pending || approveStatus?.pending || borrowStatus?.pending) {
      setActionButtonState('loading');
    } else if (whitelistDelegateStatus?.success || approveStatus?.success || borrowStatus?.success) {
      setActionButtonState('success');
    } else {
      setActionButtonState('default');
    }
  }, [approveStatus, borrowStatus, hasApprovalProceeded, tokenSignatureMap, whitelistDelegateStatus]);

  const collateralInputFiatValue = useMemo(() => {
    if (!collateralTokenValues.valueFormatted || Decimal.parse(collateralAmount, 0).isZero()) {
      return '';
    }

    return `~${collateralTokenValues.valueFormatted}`;
  }, [collateralTokenValues.valueFormatted, collateralAmount]);

  const borrowInputFiatValue = useMemo(() => {
    if (!borrowTokenValues.valueFormatted || Decimal.parse(borrowAmount, 0).isZero()) {
      return '';
    }

    return `~${borrowTokenValues.valueFormatted}`;
  }, [borrowTokenValues.valueFormatted, borrowAmount]);

  const borrowingFeeAmount = useMemo(() => {
    if (!borrowingRate) {
      return null;
    }

    return Decimal.parse(borrowAmount, 0).mul(borrowingRate);
  }, [borrowAmount, borrowingRate]);

  const borrowingFeeAmountFormatted = useMemo(() => {
    if (!borrowingFeeAmount) {
      return null;
    }

    const borrowingFeeAmountFormatted = DecimalFormat.format(borrowingFeeAmount, {
      style: 'currency',
      currency: R_TOKEN,
      fractionDigits: R_TOKEN_UI_PRECISION,
      lessThanFormat: true,
      pad: true,
    });

    if (borrowingFeeAmount.gte(0.01)) {
      return `~${borrowingFeeAmountFormatted}`;
    } else {
      return borrowingFeeAmountFormatted;
    }
  }, [borrowingFeeAmount]);

  const handleMaxButtonClick = useCallback(() => {
    if (
      selectedCollateralTokenBalanceValues.amount &&
      selectedCollateralTokenBalanceValues.value &&
      selectedCollateralTokenBalanceValues.amount.gt(0)
    ) {
      setMaxButtonDisabled(true);
      setCollateralAmount(selectedCollateralTokenBalanceValues.amount.toString());
      setHasChanged(true);

      const borrowTokenPrice = tokenPriceMap[R_TOKEN];

      if (borrowTokenPrice && !borrowTokenPrice.isZero()) {
        const defaultBorrowAmount = selectedCollateralTokenBalanceValues.value
          .div(borrowTokenPrice)
          .div(HEALTHY_RATIO + HEALTHY_RATIO_BUFFER)
          .toTruncated(2);
        setBorrowAmount(defaultBorrowAmount);
        setHasChanged(true);
      }
    }
  }, [selectedCollateralTokenBalanceValues, tokenPriceMap]);

  const handleCollateralValueUpdate = useCallback((amount: string) => {
    setMaxButtonDisabled(false);
    setCollateralAmount(amount);
    setHasChanged(true);
  }, []);

  const handleBorrowValueUpdate = useCallback((amount: string) => {
    setMaxButtonDisabled(false);
    setBorrowAmount(amount);
    setHasChanged(true);
  }, []);

  return (
    <div className="raft__openPosition">
      <div className="raft__openPosition__header">
        <Typography variant="heading2">Open Position</Typography>
        {walletConnected && (
          <Button
            variant="secondary"
            text="Auto safe borrow"
            disabled={maxButtonDisabled}
            onClick={handleMaxButtonClick}
          />
        )}
      </div>
      <div className="raft__openPosition__input">
        <CurrencyInput
          label="YOU DEPOSIT"
          precision={18}
          fiatValue={collateralInputFiatValue}
          selectedToken={selectedCollateralToken}
          tokens={SUPPORTED_COLLATERAL_TOKENS}
          value={collateralAmount}
          previewValue={collateralAmountWithEllipse ?? undefined}
          maxAmount={selectedCollateralTokenBalanceValues.amount}
          maxAmountFormatted={selectedCollateralTokenBalanceValues.amountFormatted ?? undefined}
          onTokenUpdate={handleCollateralTokenChange}
          onValueUpdate={handleCollateralValueUpdate}
          onBlur={handleCollateralTokenBlur}
          error={!hasEnoughCollateralTokenBalance || !hasMinRatio}
          errorMsg={collateralErrorMsg}
        />
        <CurrencyInput
          label="YOU GENERATE"
          precision={18}
          fiatValue={borrowInputFiatValue}
          selectedToken={R_TOKEN}
          tokens={[R_TOKEN]}
          value={borrowAmount}
          previewValue={borrowAmountWithEllipse ?? undefined}
          maxAmount={rTokenBalance}
          maxAmountFormatted={rTokenBalanceFormatted ?? undefined}
          onValueUpdate={handleBorrowValueUpdate}
          onBlur={handleBorrowTokenBlur}
          error={!hasMinBorrow || !hasMinRatio || isOverMaxBorrow}
          errorMsg={debtErrorMsg}
        />
      </div>
      <div className="raft__openPosition__data">
        <div className="raft__openPosition__data__position">
          <div className="raft__openPosition__data__position__title">
            <Typography variant="overline">POSITION AFTER</Typography>
            <TooltipWrapper
              tooltipContent={
                <Tooltip className="raft__openPosition__infoTooltip">
                  <Typography variant="body2">
                    Summary of your position after the transaction is executed.{' '}
                    <Link href="https://docs.raft.fi/how-it-works/borrowing">
                      Docs <Icon variant="external-link" size={10} />
                    </Link>
                  </Typography>
                </Tooltip>
              }
              placement="top"
            >
              <Icon variant="info" size="tiny" />
            </TooltipWrapper>
          </div>
          <ul className="raft__openPosition__data__position__data">
            <li className="raft__openPosition__data__position__data__deposit">
              <TokenLogo type={`token-${DISPLAY_BASE_TOKEN}`} size={20} />
              <ValueLabel value={baseTokenAmountFormatted} valueSize="body" tickerSize="caption" />
              {collateralTokenValues.valueFormatted && (
                <Typography
                  className="raft__openPosition__data__position__data__deposit__value"
                  variant="body"
                  weight="medium"
                  color="text-secondary"
                >
                  (
                  <ValueLabel
                    value={collateralTokenValues.valueFormatted}
                    tickerSize="caption"
                    valueSize="body"
                    color="text-secondary"
                  />
                  )
                </Typography>
              )}
            </li>
            <li className="raft__openPosition__data__position__data__debt">
              <TokenLogo type={`token-${R_TOKEN}`} size={20} />
              <ValueLabel
                value={borrowTokenValues.amountFormatted ?? `0.00 ${R_TOKEN}`}
                valueSize="body"
                tickerSize="caption"
              />
            </li>
            <li className="raft__openPosition__data__position__data__ratio">
              {!collateralizationRatio || collateralizationRatio.isZero() ? (
                <>
                  <div className="raft__openPosition__data__position__data__ratio__empty-status" />
                  <Typography variant="body" weight="medium">
                    N/A
                  </Typography>
                </>
              ) : (
                <>
                  <Icon variant="arrow-up" size="tiny" />
                  <div
                    className={`raft__openPosition__data__position__data__ratio__status status-risk-${collateralRatioLevel}`}
                  />
                  <ValueLabel value={collateralizationRatioFormatted} valueSize="body" tickerSize="caption" />
                  <Typography variant="body" weight="medium" color="text-secondary">
                    ({collateralRatioLabel})
                  </Typography>
                </>
              )}
            </li>
          </ul>
        </div>
        <div className="raft__openPosition__data__others">
          <div className="raft__openPosition__data__protocol-fee__title">
            <Typography variant="overline">PROTOCOL FEES</Typography>
            <TooltipWrapper
              tooltipContent={
                <Tooltip className="raft__openPosition__infoTooltip">
                  <Typography variant="body2">
                    Borrowing fees associated with your transaction. Read the docs for more information.{' '}
                    <Link href="https://docs.raft.fi/how-it-works/borrowing">
                      Docs <Icon variant="external-link" size={10} />
                    </Link>
                  </Typography>
                </Tooltip>
              }
              placement="top"
            >
              <Icon variant="info" size="tiny" />
            </TooltipWrapper>
          </div>
          <div className="raft__openPosition__data__protocol-fee__value">
            <ValueLabel
              value={borrowingFeeAmountFormatted ?? `0.00 ${R_TOKEN}`}
              valueSize="body"
              tickerSize="caption"
            />
          </div>
        </div>
      </div>
      <div className="raft__openPosition__action">
        <Button
          variant="primary"
          size="large"
          onClick={walletConnected ? onAction : onConnectWallet}
          disabled={buttonDisabled}
        >
          {actionButtonState === 'loading' && <Loading />}
          <Typography variant="button-label" color="text-primary-inverted">
            {buttonLabel}
          </Typography>
        </Button>
      </div>
    </div>
  );
};
export default OpenPosition;
