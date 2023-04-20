import { memo, useCallback, useState } from 'react';
import { ButtonWrapper, TokenLogo } from 'tempus-ui';
import { Icon, Typography } from '../shared';

import './ProtocolStats.scss';

const ProtocolStats = () => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const onToggleExpanded = useCallback(() => setExpanded(expanded => !expanded), []);

  return (
    <div className="raft__protocol-stats">
      <div className="raft__protocol-stats__header">
        <Typography variant="subtitle">Protocol stats</Typography>
        <ButtonWrapper onClick={onToggleExpanded}>
          <Icon variant={expanded ? 'chevron-up' : 'chevron-down'} />
        </ButtonWrapper>
      </div>
      <div className={`raft__protocol-stats__body ${expanded ? 'raft__protocol-stats-expanded' : ''}`}>
        <div className="raft__protocol-stats__stat-token">
          <div className="raft__protocol-stats__stat">
            <TokenLogo type="token-stETH" />
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Total supply
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                1.62M stETH
              </Typography>
            </div>
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Total value
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                $300.2M
              </Typography>
            </div>
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Price
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                $1800.00
              </Typography>
            </div>
          </div>
          <div className="raft__protocol-stats__stat">
            <TokenLogo type="token-R" />
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Total supply
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                215.2M R
              </Typography>
            </div>
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Total value
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                $215.2M
              </Typography>
            </div>
            <div className="raft__protocol-stats__stat__separator" />
            <div className="raft__protocol-stats__stat__data">
              <Typography
                className="raft__protocol-stats__stat__data__title"
                variant="body-tertiary"
                color="text-secondary"
              >
                Price
              </Typography>
              <Typography className="raft__protocol-stats__stat__data__value" variant="body-tertiary" weight="medium">
                $1.00
              </Typography>
            </div>
          </div>
        </div>
        <div className="raft__protocol-stats__stat">
          <div className="raft__protocol-stats__stat__data">
            <Typography variant="body-primary">Protocol collateralization ratio</Typography>
            <Typography variant="body-tertiary" weight="medium">
              262%
            </Typography>
          </div>
          <div className="raft__protocol-stats__stat__data">
            <Typography variant="body-primary">Open positions</Typography>
            <Typography variant="body-tertiary" weight="medium">
              50,000
            </Typography>
          </div>
          <div className="raft__protocol-stats__stat__data">
            <Typography variant="body-primary">Borrowing fee</Typography>
            <Typography variant="body-tertiary" weight="medium">
              0.00%
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProtocolStats);
