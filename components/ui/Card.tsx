import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-xl border bg-white/50 backdrop-blur-sm shadow-xl text-card-foreground",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

export { Card };
