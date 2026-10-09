import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { FormError } from '@/components/form-error';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { errorMessage, useSession } from '@/data/account';
import { REPORT_DETAILS_MAX, useSendReport, type ReportReason } from '@/data/reports';
import { ReasonPicker } from '@/screens/report/reason-picker';
import { spacing } from '@/theme';

// The website's /report form for one painting (opened from a ⋯ menu), with
// or without an account. `about` fills in the details, e.g. a reported comment.
export function ReportScreen() {
  const params = useLocalSearchParams<{ painting: string; title?: string; about?: string }>();
  const { session } = useSession();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState(params.about ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [signature, setSignature] = useState('');
  const [goodFaith, setGoodFaith] = useState(false);
  const send = useSendReport();

  // Any change clears the last error.
  const edit =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      if (send.isError) send.reset();
    };

  const submit = () =>
    send.mutate(
      { paintingId: params.painting, reason, details, email, signature, goodFaith },
      { onSuccess: () => AccessibilityInfo.announceForAccessibility('report received') },
    );

  if (send.data !== undefined) {
    return (
      <PaperBackground>
        <View style={styles.content} accessibilityRole="summary">
          <Text variant="display" accessibilityRole="header">
            Thank you
          </Text>
          <Text variant="headline">Report received. Your reference number is #{send.data}.</Text>
          <Text variant="subhead">
            we&apos;ll review it and, if it breaks the rules, remove the post and any identical
            copies within 48 hours. We may email you if we need more information. Keep your
            reference number if you want to follow up.
          </Text>
          <Button title="Done" onPress={() => router.back()} style={styles.left} />
        </View>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text variant="display" accessibilityRole="header">
            Report a post
          </Text>
          {params.title ? <Text variant="subhead">About “{params.title}”.</Text> : null}
        </View>

        <ReasonPicker value={reason} onChange={edit(setReason)} />
        <TextField
          label="Anything we should know"
          hint="optional"
          placeholder="For example: who is in the image, or where else it was posted."
          value={details}
          onChangeText={edit(setDetails)}
          maxLength={REPORT_DETAILS_MAX}
          multiline
        />
        <TextField
          label="Your email"
          hint="so we can reply"
          value={email}
          onChangeText={edit(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Signature"
          hint="type your full name"
          value={signature}
          onChangeText={edit(setSignature)}
          autoComplete="name"
          textContentType="name"
          maxLength={100}
        />
        <Checkbox
          label="I believe in good faith that this post breaks the rules (for an intimate image: that it was shared without the consent of the person shown), and the information in this report is accurate."
          checked={goodFaith}
          onChange={edit(setGoodFaith)}
        />

        <FormError message={send.error && errorMessage(send.error)} />
        <Button variant="circled" title="Send report" loading={send.isPending} onPress={submit} />
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
  },
  left: {
    alignSelf: 'flex-start',
  },
});
