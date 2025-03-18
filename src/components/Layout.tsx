
import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="text-xl font-medium flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="bg-primary/10 text-primary p-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check">
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
                <path d="m9 16 2 2 4-4" />
              </svg>
            </motion.div>
            <span>RosterSync</span>
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
            <NavLink to="/employee" currentPath={location.pathname}>Employee</NavLink>
            <NavLink to="/manager" currentPath={location.pathname}>Manager</NavLink>
          </nav>
          
          <div className="md:hidden">
            {/* Mobile menu button could go here if needed */}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="bg-secondary/50 py-6 mt-auto">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} RosterSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  currentPath: string;
  children: ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={`relative px-2 py-1 transition-colors ${
        isActive ? 'text-primary' : 'text-foreground hover:text-primary'
      }`}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
};

export default Layout;
