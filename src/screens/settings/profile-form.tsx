import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { BIO_MAX, errorMessage, NAME_MAX, useUpdateProfile, type Me } from '@/data/account';
import { spacing } from '@/theme';

// Your name and bio. The website checks the name (rules, and whether someone
// has it) and says why when it says no.
export function ProfileForm({ me }: { me: Me }) {
  const [displayName, setDisplayName] = useState(me.displayName ?? '');
  const [bio, setBio] = useState(me.bio);
  const save = useUpdateProfile();
  const changed = displayName.trim() !== (me.displayName ?? '') || bio.trim() !== me.bio;

  const submit = () =>
    save.mutate(
      { displayName, bio },
      {
        onSuccess: (profile) => {
          setDisplayName(profile.displayName);
          setBio(profile.bio);
          AccessibilityInfo.announceForAccessibility('saved');
        },
      },
    );

  // Any edit clears the last answer ("saved." or the reason it failed).
  const edit = (set: (text: string) => void) => (text: string) => {
    set(text);
    if (!save.isPending) save.reset();
  };

  return (
    <View style={styles.form}>
      <TextField
        label="display name"
        hint="shown on your paintings"
        value={displayName}
        onChangeText={edit(setDisplayName)}
        maxLength={NAME_MAX}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="nickname"
      />
      <TextField
        label="bio"
        hint={`optional, up to ${BIO_MAX} characters`}
        value={bio}
        onChangeText={edit(setBio)}
        maxLength={BIO_MAX}
        multiline
      />
      <FormError message={save.error && errorMessage(save.error)} />
      {save.isSuccess && <Text variant="subhead">saved.</Text>}
      <Button
        title="save changes"
        disabled={!changed}
        loading={save.isPending}
        onPress={submit}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
