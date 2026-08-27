import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'special' | 'premium' | 'outline' | 'ghost' | 'white';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled,
    ...props
}) => {
    // Sizing mapping
    const sizeClasses = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm font-medium',
        lg: 'px-8 py-4 text-base font-bold',
    };

    // Styling variants mapping
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        special: 'btn-special',
        premium: 'btn-premium',
        outline: 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 rounded-xl',
        white: 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-sm transition-all duration-200 rounded-xl',
        ghost: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 rounded-xl',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;
