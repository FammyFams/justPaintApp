import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { errorMessage, useMe } from '@/data/account';
import { DESCRIPTION_MAX, TITLE_MAX, usePostPainting } from '@/data/paintings';
import { env } from '@/lib/env';
import { ChallengeOption } from '@/screens/post/challenge-option';
import { PhotoBox } from '@/screens/post/photo-box';
import { pickPhoto, type PickedPhoto } from '@/screens/post/pick-photo';
import { TagPicker } from '@/screens/post/tag-picker';
import { spacing } from '@/theme';

// The website's upload form, for signed-in people. Posting opens the new
// painting; the form starts fresh for the next one.
export function PostForm() {
  const me = useMe();
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [photoProblem, setPhotoProblem] = useState<'no-camera' | 'unreadable' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [challengeDay, setChallengeDay] = useState<number | null>(null);
  const post = usePostPainting();

  // Any change clears the last "couldn't post" message.
  const edit =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      if (post.isError) post.reset();
    };

  const pick = async (from: 'camera' | 'library') => {
    if (post.isError) post.reset();
    setPhotoProblem(null);
    setPreparing(true);
    try {
      const picked = await pickPhoto(from);
      if (picked === 'no-camera') setPhotoProblem('no-camera');
      else if (picked) setPhoto(picked);
    } catch {
      setPhotoProblem('unreadable');
    } finally {
      setPreparing(false);
    }
  };

  const submit = () => {
    if (post.isPending || preparing) return;
    post.mutate(
      { photo, title, description, tags, challengeDay },
      {
        onSuccess: (id) => {
          setPhoto(null);
          setTitle('');
          setDescription('');
          setTags([]);
          setChallengeDay(null);
          post.reset();
          router.push({ pathname: '/painting/[id]', params: { id } });
        },
      },
    );
  };

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.heading}>
            <Text variant="display" accessibilityRole="header">
              post
            </Text>
            <Text tone="muted">what did you paint today?</Text>
            {me.data?.displayName ? (
              <Text variant="subhead">
                posting as{' '}
                <Text variant="subhead" tone="default">
                  {me.data.displayName}
                </Text>
                . it&apos;ll show on your profile.
              </Text>
            ) : null}
          </View>

          <PhotoBox photo={photo} busy={preparing} onPick={pick} />
          {photoProblem === 'no-camera' ? (
            <View>
              <FormError message="the camera is off for justPaint Art. turn it on in settings, or choose a photo instead." />
              <TextLink title="open settings" onPress={() => Linking.openSettings()} />
            </View>
          ) : photoProblem === 'unreadable' ? (
            <FormError message="couldn't open that photo. try another one." />
          ) : null}

          <TextField
            label="title"
            value={title}
            onChangeText={edit(setTitle)}
            placeholder="untitled"
            maxLength={TITLE_MAX}
            returnKeyType="next"
          />
          <TextField
            label="description"
            value={description}
            onChangeText={edit(setDescription)}
            placeholder="materials, process, what you were thinking about"
            multiline
            maxLength={DESCRIPTION_MAX}
          />
          <TagPicker selected={tags} onChange={edit(setTags)} />
          <ChallengeOption day={challengeDay} onChange={edit(setChallengeDay)} />

          <FormError message={post.error && errorMessage(post.error)} />

          <View style={styles.terms}>
            <Text variant="caption">
              posting confirms you&apos;re 13 or older and agree to the terms of use.
            </Text>
            <TextLink
              title="terms of use"
              role="link"
              onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/terms`)}
            />
          </View>

          <Button
            variant="circled"
            title="post painting"
            loading={post.isPending}
            disabled={preparing}
            onPress={submit}
            style={styles.submit}
          />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  terms: {
    gap: 0,
  },
  submit: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
});
