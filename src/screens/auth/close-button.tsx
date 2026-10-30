import { Button } from '@/components/button';

// Closes the whole sign-in modal, from any screen inside it. Plain crimson
// words like every other button, not an icon.
export function CloseButton({ onPress }: { onPress: () => void }) {
  return <Button title="Close" onPress={onPress} />;
}
