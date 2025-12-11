import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Note: flexible button component, I'm manually handling classes without cva dependency for now as I forgot to install it, 
// OR I can just write standard Tailwind classes. Let's stick to simple props to avoid extra deps if not needed, 
// BUT `class-variance-authority` is standard. 
// Actually, I didn't install `class-variance-authority` in the previous step.
// I will just use clsx/tailwind-merge for simple variants to safe time/complexity or install it.
// Let's quickly double check the user didn't ask for it, but it's cleaner. 
// I'll implement a simple version without cva to save an install step, 
// as I want to keep momentum.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        // Base styles
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

        // Variants
        const variants = {
            primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
            secondary: "bg-pink-100 text-pink-900 hover:bg-pink-200",
            outline: "border border-input hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
        };

        // Sizes
        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 py-2",
            lg: "h-14 px-8 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
