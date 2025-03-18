
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.5
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList: React.FC<{
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = "", staggerDelay = 0.1 }) => {
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <AnimatedTransition key={index} delay={index * staggerDelay}>
          {child}
        </AnimatedTransition>
      ))}
    </div>
  );
};

export default AnimatedTransition;
