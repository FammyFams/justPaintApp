import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { TextField } from '@/components/text-field';
import { errorMessage, useResetPassword } from '@/data/account';
import { AuthForm } from '@/screens/auth/auth-form';
import { CheckEmail } from '@/screens/auth/check-email';
import { spacing } from '@/theme';

// The email's link opens the website's reset page; they pick the new password
// there and sign in here with it.
export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const reset = useResetPassword();

  const submit = () => {
    if (reset.isPending) return;
    const address = email.trim();
    reset.mutate(address, { onSuccess: () => setSentTo(address) });
  };

  const backToSignIn = () => (router.canGoBack() ? router.back() : router.replace('/sign-in'));

  if (sentTo) {
    return (
      <CheckEmail
        message={`if there's an account for ${sentTo}, we sent it a link to pick a new password. it can take a few minutes, so check your spam folder too. the link opens justpaint.art: pick the new password there, then sign in here.`}
        action={<Button title="back to sign in" onPress={backToSignIn} />}
      />
    );
  }

  return (
    <AuthForm
      title="forgot your password?"
      intro="enter the email you signed up with and we'll send you a link to pick a new one."
    >
      <TextField
        label="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={submit}
      />

      <FormError message={reset.error && errorMessage(reset.error)} />

      <Button
        variant="circled"
        title="send reset link"
        loading={reset.isPending}
        onPress={submit}
        style={styles.submit}
      />
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  submit: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
});
