import React from 'react';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { ListCard, Notice } from '../ui/Parts';
import { Row } from '../ui/Bits';
import { Icon } from '../ui/Icon';
import { colors } from '../theme';
import { store, toast, useStore, type Env } from '../state/store';
import { ENVS } from '../state/data';

/** Which backend the app talks to. */
export default function Environment() {
  const env = useStore(s => s.env);
  const pick = (e: Env) => {
    store.set({ env: e });
    router.back();
    toast(`Now using ${ENVS[e].label}`);
  };
  return (
    <Screen title="Environment" back="/more">
      <AppText color={colors.muted}>Which server the app talks to. Use Staging for testing; changes there don’t reach real drivers or passengers.</AppText>
      <ListCard>
        {(Object.keys(ENVS) as Env[]).map((e, i, all) => (
          <Row
            key={e}
            lead={<Icon name="server" />}
            title={ENVS[e].label}
            sub={ENVS[e].host}
            trail={env === e ? <Icon name="check" color={colors.green} strokeWidth={3} /> : null}
            onPress={() => pick(e)}
            last={i === all.length - 1}
          />
        ))}
      </ListCard>
      {env === 'PROD' ? <Notice tone="warn">You’re on Production. Approvals, blocks and fare changes affect real users.</Notice> : null}
    </Screen>
  );
}
