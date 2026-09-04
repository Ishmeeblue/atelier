import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b border-line bg-cream px-8 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/Atelier Logo.png" 
            alt="Atelier Logo" 
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105" 
          />
          <span className="font-display text-2xl font-semibold text-ink tracking-wide">
            ATELIER
          </span>
        </Link>

        <nav className="flex items-center gap-8 font-body text-sm font-medium tracking-wide">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'text-wine underline underline-offset-8 decoration-wine decoration-2 font-semibold'
                : 'text-inksoft transition-colors hover:text-ink'
            }
          >
            Closet
          </NavLink>
          <NavLink
            to="/outfits"
            className={({ isActive }) =>
              isActive
                ? 'text-wine underline underline-offset-8 decoration-wine decoration-2 font-semibold'
                : 'text-inksoft transition-colors hover:text-ink'
            }
          >
            Outfits
          </NavLink>
        </nav>
      </div>
    </header>
  );
}