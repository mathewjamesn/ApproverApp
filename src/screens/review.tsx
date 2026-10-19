import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, Notice } from '../ui/Parts';
import { Icon, IconName } from '../ui/Icon';
import { Initials, KVGrid, Pill } from '../ui/Bits';
import { Sheet } from '../ui/Chrome';
import { colors } from '../theme';
import { checkedCount, firstPending, setCheck, store, toast, useStore } from '../state/store';
import { APPLICANTS, initials, REASONS, STEP_LABEL, STEPS, type Applicant, type Step } from '../state/data';

/**
 * Verify one driver in three checks (profile, licence, vehicle). Each check is approved or
 * rejected with a reason; the driver is then approved, or sent back to re-upload what was rejected.
 */
export default function Review() {
  const params = useLocalSearchParams<{ id?: string; step?: Step }>();
  const pending = useStore(s => s.pending);
  const review = useStore(s => s.review);
  const a = APPLICANTS.find(x => x.id === (params.id ?? 'd1'));
  const [step, setStep] = useState<Step>(params.step ?? 'profile');
  const [doc, setDoc] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (!a || !pending.includes(a.id)) {
    return (
      <Screen title="Review" back="/approvals">
        <Notice tone="green">This driver has already been reviewed.</Notice>
        <Button label="Back to approvals" onPress={() => router.replace('/approvals')} />
      </Screen>
    );
  }

  const rv = review[a.id];
  const cur = rv[step];
  const done = checkedCount(rv) === 3;
  const allOk = STEPS.every(k => rv[k].s === 'APPROVED');
  const section = sectionFor(a, step);

  const next = (after: typeof rv) => {
    const p = STEPS.find(k => after[k].s === 'PENDING');
    if (p) setStep(p);
  };

  const approveStep = () => {
    setCheck(a.id, step, 'APPROVED');
    next(store.get().review[a.id]);
  };

  const rejectStep = () => {
    if (!reason.trim()) return;
    setCheck(a.id, step, 'REJECTED', reason.trim());
    setRejecting(false);
    setReason('');
    next(store.get().review[a.id]);
  };

  const finish = () => {
    Alert.alert(
      allOk ? `Approve ${a.name}?` : `Send ${a.name} back?`,
      allOk ? 'They get a notification and can go online right away.' : 'They’re asked to re-upload the rejected items, with your reasons.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: allOk ? 'Approve driver' : 'Send back',
          style: allOk ? 'default' : 'destructive',
          onPress: () => {
            const s = store.get();
            const left = s.pending.filter(id => id !== a.id);
            const reasons = STEPS.map(k => rv[k].r).filter(Boolean).join(' ');
            store.set({ pending: left, rejected: allOk ? s.rejected : [{ name: a.name, phone: a.phone, city: a.city, when: 'Today', reason: reasons }, ...s.rejected] });
            toast(allOk ? `${a.name} approved` : `${a.name} sent back`);
            const nx = APPLICANTS.find(x => left.includes(x.id));
            if (nx) router.replace({ pathname: '/review', params: { id: nx.id, step: firstPending(s.review[nx.id]) ?? 'profile' } });
            else router.replace('/approvals');
          },
        },
      ],
    );
  };

  return (
    <Screen
      title={a.name}
      back="/approvals"
      right={<View style={{ marginRight: 8 }}><Pill label={`${checkedCount(rv)}/3`} tone={done ? 'good' : 'mute'} /></View>}
      footer={
        done ? (
          <Button label={allOk ? 'Approve driver' : 'Send back for changes'} variant={allOk ? 'green' : 'primary'} icon={allOk ? 'check' : 'reset'} height={60} onPress={finish} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Reject" variant="outline" color={colors.red} icon="x" style={{ flex: 1, borderColor: colors.red }} height={56} onPress={() => { setReason(cur.r); setRejecting(true); }} />
            <Button label={`Approve ${STEP_LABEL[step].toLowerCase()}`} variant="green" icon="check" style={{ flex: 1.4 }} height={56} onPress={approveStep} />
          </View>
        )
      }>
      <Card style={styles.who}>
        <Initials text={initials(a.name)} size={54} tone="dark" />
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{a.name}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>{`+91 ${a.phone} · ${a.city}`}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>{`Applied ${a.applied}`}</AppText>
        </View>
      </Card>

      <View style={styles.steps} accessibilityRole="tablist">
        {STEPS.map((k, i) => {
          const st = rv[k].s;
          const on = k === step;
          return (
            <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`${STEP_LABEL[k]}, ${st.toLowerCase()}`} onPress={() => setStep(k)} style={[styles.step, on ? styles.stepOn : null]}>
              <View style={[styles.stepDot, st === 'APPROVED' ? { backgroundColor: colors.green } : st === 'REJECTED' ? { backgroundColor: colors.red } : null]}>
                {st === 'PENDING' ? (
                  <AppText style={{ fontSize: 12, fontWeight: '800' }}>{i + 1}</AppText>
                ) : (
                  <Icon name={st === 'APPROVED' ? 'check' : 'x'} size={14} color={colors.white} strokeWidth={3} />
                )}
              </View>
              <AppText color={on ? colors.ink : colors.muted} style={{ fontSize: 14, fontWeight: '800' }}>
                {STEP_LABEL[k]}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {section.flag ? <Notice tone="warn">{section.flag}</Notice> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {section.docs.map(([label, icon]) => (
          <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Open ${label}`} onPress={() => setDoc(label)} style={styles.doc}>
            <Icon name={icon} size={28} color={colors.muted} />
            <AppText style={{ fontSize: 13, fontWeight: '700' }}>{label}</AppText>
            <AppText variant="small" color={colors.muted}>
              Tap to view
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      <Card>
        <KVGrid items={section.kv} />
      </Card>

      {cur.s === 'REJECTED' ? <Notice tone="red">{`Rejected: ${cur.r}`}</Notice> : cur.s === 'APPROVED' ? <Notice tone="green">Approved</Notice> : null}

      <Sheet visible={!!doc} onClose={() => setDoc(null)} title={doc ?? ''}>
        <View style={styles.bigDoc}>
          <Icon name="img" size={44} color={colors.muted} />
          <AppText color={colors.muted}>Full-size photo · pinch to zoom</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Rotate" variant="outline" icon="rotate" style={{ flex: 1 }} onPress={() => toast('Rotated')} />
          <Button label="Replace" variant="outline" icon="upload" style={{ flex: 1 }} onPress={() => toast('Replace opens the camera or gallery')} />
        </View>
        <Button label="Done" onPress={() => setDoc(null)} />
      </Sheet>

      <Sheet visible={rejecting} onClose={() => setRejecting(false)} title={`Reject ${STEP_LABEL[step].toLowerCase()}`}>
        <AppText color={colors.muted}>The driver sees this reason and is asked to upload again.</AppText>
        <View style={styles.reasons}>
          {REASONS[step].map(r => (
            <Pressable key={r} accessibilityRole="button" onPress={() => setReason(`${r}. `)} style={styles.reason}>
              <AppText style={{ fontSize: 14, fontWeight: '700' }}>{r}</AppText>
            </Pressable>
          ))}
        </View>
        <View style={{ gap: 6 }}>
          <AppText variant="label" color={colors.muted}>
            Reason
          </AppText>
          <TextInput value={reason} onChangeText={setReason} multiline placeholder="Describe what to fix" placeholderTextColor="#8A8A8A" style={styles.area} accessibilityLabel="Reason" />
        </View>
        <Button label={`Reject ${STEP_LABEL[step].toLowerCase()}`} variant="danger" disabled={!reason.trim()} onPress={rejectStep} />
      </Sheet>
    </Screen>
  );
}

function sectionFor(a: Applicant, step: Step): { docs: [string, IconName][]; kv: [string, string][]; flag?: string } {
  if (step === 'profile') {
    return {
      docs: [['Profile photo', 'user']],
      kv: [['Full name', a.name], ['Date of birth', a.dob], ['Email', a.email || '—'], ['State', a.state]],
    };
  }
  if (step === 'licence') {
    return {
      docs: [['Licence front', 'doc'], ['Licence back', 'doc']],
      kv: [['Licence number', a.lic], ['Expiry', a.licExp]],
      flag: a.licDays < 45 ? `Licence expires in ${a.licDays} days (${a.licExp}).` : undefined,
    };
  }
  return {
    docs: [['Vehicle photo', 'img'], ['RC book', 'doc'], ['Insurance', 'doc']],
    kv: [['Plate', a.plate], ['Vehicle', a.vname], ['Make', a.make], ['Category', a.type], ['Year · colour', `${a.year} · ${a.colour}`], ['Insurance till', a.ins], ['Permit till', a.permit]],
    flag: a.insDays < 45 ? `Insurance expires in ${a.insDays} days (${a.ins}).` : undefined,
  };
}

const styles = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  steps: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, minHeight: 64, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 2, borderColor: colors.white },
  stepOn: { borderColor: colors.ink },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  doc: { width: 150, height: 104, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bigDoc: { height: 220, borderRadius: 16, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center', gap: 8 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reason: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: colors.line, justifyContent: 'center' },
  area: { minHeight: 96, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, padding: 12, fontSize: 16, color: colors.ink, textAlignVertical: 'top' },
});
