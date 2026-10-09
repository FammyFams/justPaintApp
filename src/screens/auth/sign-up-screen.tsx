import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { errorMessage, useSignUp } from '@/data/account';
import { env } from '@/lib/env';
import { AuthForm } from '@/screens/auth/auth-form';
import { CheckEmail } from '@/screens/auth/check-email';
import { spacing } from '@/theme';

// Same fields and rules as the website's sign-up form. The website (W5) checks
// the name rules, the 13+ and Terms box, and the sign-up limits.
export function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const emailField = useRef<TextInput>(null);
  const passwordField = useRef<TextInput>(null);
  const signUp = useSignUp();

  const submit = () => {
    if (signUp.isPending) return;
    const values = { displayName: displayName.trim(), email: email.trim(), password, agreedToTerms };
    signUp.mutate(values, {
      onSuccess: (needsConfirmation) => {
        if (needsConfirmation) setSentTo(values.email);
      },
    });
  };

  if (sentTo) {
    return (
      <CheckEmail
        message={`We sent a confirmation link to ${sentTo}. open it to finish creating your account, then sign in here.`}
        action={<Button title="Sign in" onPress={() => router.replace('/sign-in')} />}
      />
    );
  }

  return (
    <AuthForm title="Join justpaint." intro="Free. Post your paintings, heart and comment.">
      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        autoComplete="nickname"
        textContentType="nickname"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={30}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailField.current?.focus()}
      />
      <TextField
        ref={emailField}
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
      <TextField
        ref={passwordField}
        label="Password"
        hint="at least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        passwordRules="minlength: 8;"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={72}
        returnKeyType="done"
      />

      <View>
        <Checkbox
          label="I'm 13 or older and agree to the terms of use and privacy policy."
          checked={agreedToTerms}
          onChange={setAgreedToTerms}
        />
        <View style={styles.links}>
          <TextLink
            title="Terms of use"
            role="link"
            onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/terms`)}
          />
          <TextLink
            title="Privacy policy"
            role="link"
            onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/privacy`)}
          />
        </View>
      </View>

      <FormError message={signUp.error && errorMessage(signUp.error)} />

      <Button
        variant="circled"
        title="Create account"
        loading={signUp.isPending}
        onPress={submit}
        style={styles.submit}
      />

      <View style={styles.switch}>
        <Text variant="subhead">Already painting here?</Text>
        <TextLink title="Sign in" onPress={() => router.replace('/sign-in')} />
      </View>
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    // Lines up with the checkbox label.
    paddingLeft: 24 + spacing.sm + spacing.xs,
  },
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
