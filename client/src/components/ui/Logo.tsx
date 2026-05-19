import { Link } from 'react-router-dom';

interface LogoProps {
  to?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function Logo({ to = '/', className = '', size = 'md' }: LogoProps) {
  const content = (
    <span className={`font-bold tracking-tight text-white ${sizes[size]} ${className}`}>
      Brief<span className="text-brand-400">AI</span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block transition opacity-90 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
