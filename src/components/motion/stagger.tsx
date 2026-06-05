'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
};

/** Contenedor que escalona (stagger) la entrada de sus StaggerItem hijos. */
export function StaggerList({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Ítem animado dentro de un StaggerList (fade + slide up). */
export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
