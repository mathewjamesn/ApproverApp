import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from '../nav';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, ListCard, TextField } from '../ui/Parts';
import { Icon } from '../ui/Icon';
import { Initials, Pill, Row, Seg } from '../ui/Bits';
import { TabScreen } from '../ui/Chrome';
import { colors } from '../theme';
import { checkedCount, firstPending, useStore } from '../state/store';
import { APPLICANTS, initials } from '../state/data';

type Tab = 'pending' | 'rejected' | 'find';

/** Drivers waiting for verification, the ones sent back, and search by mobile number. */
export default function Approvals() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'pending');
  const [mobile, setMobile] = useState('9847012390');
  const pending = useStore(s => s.pending);
  const review = useStore(s => s.review);
  const rejected = useStore(s => s.rejected);
  const waiting = APPLICANTS.filter(a => pending.includes(a.id));

  return (
    <TabScreen tab="approvals" title="Approvals">
      <AppText color={colors.muted} style={{ marginTop: -8 }}>
        {waiting.length ? `${waiting.length} drivers waiting · oldest 2 days` : 'Nobody waiting right now'}
      </AppText>
      <Seg<Tab>
        value={tab}
        onChange={setTab}
        options={[
          ['pending', `Waiting (${waiting.length})`],
          ['rejected', 'Sent back'],
          ['find', 'Find driver'],
        ]}
      />

      {tab === 'pending' ? (
        waiting.length ? (
          <ListCard>
            {waiting.map((a, i) => {
              const rv = review[a.id];
              const n = checkedCount(rv);
              const expiring = a.licDays < 45 || a.insDays < 45;
              return (
                <Row
                  key={a.id}
                  lead={<Initials text={initials(a.name)} />}
                  title={a.name}
                  sub={`${a.type} · ${a.city} · ${a.applied}`}
                  trail={
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Pill label={`${n}/3 checked`} tone={n === 3 ? 'good' : n ? 'info' : 'mute'} />
                      {expiring ? <Pill label="Expiry" tone="warn" icon="alert" /> : null}
                    </View>
                  }
                  onPress={() => router.push({ pathname: '/review', params: { id: a.id, step: firstPending(rv) ?? 'profile' } })}
                  last={i === waiting.length - 1}
                />
              );
            })}
          </ListCard>
        ) : (
          <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 32 }}>
            <Icon name="check" size={30} color={colors.green} strokeWidth={3} />
            <AppText variant="heading">All caught up</AppText>
            <AppText color={colors.muted} style={{ textAlign: 'center' }}>
              New applications appear here as soon as a driver uploads all documents.
            </AppText>
          </Card>
        )
      ) : null}

      {tab === 'rejected' ? (
        <ListCard>
          {rejected.map((r, i) => (
            <Row key={r.name + r.when} lead={<Initials text={initials(r.name)} tone="bad" />} title={`${r.name} · ${r.when}`} sub={r.reason} last={i === rejected.length - 1} />
          ))}
        </ListCard>
      ) : null}

      {tab === 'find' ? (
        <Card style={{ gap: 14 }}>
          <TextField label="Driver mobile number" prefix="+91" value={mobile} keyboardType="number-pad" maxLength={10} onChangeText={v => setMobile(v.replace(/\D/g, ''))} />
          <Button label="Search" icon="search" disabled={mobile.length !== 10} onPress={() => router.push('/driver')} />
          <AppText variant="small" color={colors.muted}>
            Prototype: any 10-digit number opens Anil Kumar’s profile.
          </AppText>
        </Card>
      ) : null}
    </TabScreen>
  );
}
