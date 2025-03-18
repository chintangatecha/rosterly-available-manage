
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ variant = 'primary', size = 'md', children, className, icon, isLoading, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 disabled:pointer-events-none";
    
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-subtle",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-input bg-transparent hover:bg-accent/10 text-foreground",
      ghost: "hover:bg-accent/10 text-foreground"
    };
    
    const sizeStyles = {
      sm: "text-sm py-1 px-3",
      md: "text-base py-2 px-4",
      lg: "text-lg py-3 px-6"
    };
    
    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        whileTap={{ scale: 0.98 }}
        whileHover={{ 
          y: -2,
          transition: { duration: 0.2 }
        }}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export default CustomButton;
