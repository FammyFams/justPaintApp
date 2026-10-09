import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { errorMessage, useSignIn } from '@/data/account';
import { AuthForm } from '@/screens/auth/auth-form';
import { spacing } from '@/theme';

// Signing in closes the modal by itself: the root layout only offers the
// sign-in screens while signed out.
export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordField = useRef<TextInput>(null);
  const signIn = useSignIn();

  const submit = () => {
    if (!signIn.isPending) signIn.mutate({ email: email.trim(), password });
  };

  return (
    <AuthForm title="Welcome back." intro="Sign in to post, heart and comment.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        // "username" so iOS offers the login saved for justpaint.art.
        textContentType="username"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordField.current?.focus()}
      />
      <View>
        <TextField
          ref={passwordField}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <TextLink title="Forgot password?" onPress={() => router.push('/forgot-password')} />
      </View>

      <FormError message={signIn.error && errorMessage(signIn.error)} />

      <Button
        variant="circled"
        title="Sign in"
        loading={signIn.isPending}
        onPress={submit}
        style={styles.submit}
      />

      <View style={styles.switch}>
        <Text variant="subhead">New here?</Text>
        <TextLink title="Create an account" onPress={() => router.replace('/sign-up')} />
      </View>
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  submit: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  switch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacing.xs,
  },
});
