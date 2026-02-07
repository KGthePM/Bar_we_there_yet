import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

interface SignUpFormProps {
  onSuccess?: () => void;
  isLinking?: boolean;
}

export function SignUpForm({ onSuccess, isLinking = false }: SignUpFormProps) {
  const { signUp, linkAccount } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let result;
    if (isLinking) {
      result = await linkAccount(email, password);
    } else {
      result = await signUp(email, password, displayName);
    }

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLinking && (
        <Input
          label="Display Name"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        minLength={6}
        required
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        {isLinking ? 'Link Account' : 'Create Account'}
      </Button>

      {!isLinking && (
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Log in
          </Link>
        </p>
      )}
    </form>
  );
}
