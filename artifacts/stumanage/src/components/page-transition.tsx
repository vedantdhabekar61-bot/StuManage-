import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [pathname] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
