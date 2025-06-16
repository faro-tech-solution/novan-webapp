import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'حداقل ۸ کاراکتر',
    validator: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'حداقل یک حرف بزرگ',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'حداقل یک حرف کوچک',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'حداقل یک عدد',
    validator: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'حداقل یک کاراکتر خاص',
    validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

export const PasswordStrengthMeter = ({ password, onStrengthChange }: PasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [metRequirements, setMetRequirements] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const requirementsMet = requirements.reduce((acc, req) => {
      acc[req.id] = req.validator(password);
      return acc;
    }, {} as Record<string, boolean>);

    setMetRequirements(requirementsMet);

    const strengthScore = Object.values(requirementsMet).filter(Boolean).length;
    const strengthPercentage = (strengthScore / requirements.length) * 100;
    setStrength(strengthPercentage);

    if (onStrengthChange) {
      onStrengthChange(strengthPercentage === 100);
    }
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={strength} className={`h-2 ${getStrengthColor()}`} />
        <div className="flex justify-between text-sm">
          <span>قدرت رمز عبور</span>
          <span>{Math.round(strength)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">نیازمندی‌های رمز عبور:</p>
        <ul className="space-y-2">
          {requirements.map((req) => (
            <li key={req.id} className="flex items-center space-x-2 space-x-reverse text-sm">
              {metRequirements[req.id] ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={metRequirements[req.id] ? 'text-green-600' : 'text-red-600'}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 