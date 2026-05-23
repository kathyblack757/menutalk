import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const CartButton = ({ count, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="fixed right-4 z-40 bg-amber-500 text-white p-[18px] rounded-full shadow-lg shadow-amber-900/50 flex items-center justify-center"
    style={{ bottom: 'clamp(36px, 5vh, 48px)' }}
  >
    <ShoppingCart size={26} />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
        {count}
      </span>
    )}
  </motion.button>
);

export default CartButton;
