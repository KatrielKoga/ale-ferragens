'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

function Navbar({
  children,
  isMenuOpen,
  setIsMenuOpen,
}: {
  children: React.ReactNode;
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}) {
  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <nav className={` top-0 left-0 right-0 z-50 bg-blue-700`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            <Image
              src="/logo.svg"
              alt="Alê Ferragens"
              width={150}
              height={150}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {children}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden mt-4 pb-4 border-t border-blue-600"
            >
              <div className="flex flex-col space-y-4 pt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  setIsMenuOpen,
}: {
  href: string;
  children: React.ReactNode;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}) {
  return (
    <Link
      href={href}
      className="text-white hover:underline"
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );
}

export function ClientNavbar({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}>
        <NavLink href="/produtos" setIsMenuOpen={setIsMenuOpen}>
          Programa de Pontos
        </NavLink>
        <NavLink href="/pontos" setIsMenuOpen={setIsMenuOpen}>
          Consulta de Pontos
        </NavLink>
      </Navbar>
      <main>{children}</main>
    </>
  );
}

export function AdminNavbar({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}>
        <NavLink href="/admin/usuarios" setIsMenuOpen={setIsMenuOpen}>
          Usuários
        </NavLink>
        <NavLink href="/admin/produtos" setIsMenuOpen={setIsMenuOpen}>
          Produtos para resgate
        </NavLink>
        <NavLink href="/admin/compras" setIsMenuOpen={setIsMenuOpen}>
          Registro de compras
        </NavLink>
        <NavLink href="/admin/resgates" setIsMenuOpen={setIsMenuOpen}>
          Resgates
        </NavLink>
      </Navbar>
      <main>{children}</main>
    </>
  );
}
