import React from 'react';

const NavItemSkeleton = () => (
  <li>
    <div className="px-4 py-2 flex gap-2 items-center rounded-md w-full min-w-max animate-pulse">
      <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
      <div className="h-6 bg-gray-200 rounded-md w-24"></div>
    </div>
  </li>
);

const SidebarSkeleton = () => {
  return (
    <>
      {/* Mobile menu toggle button skeleton */}
      <div className="sm:hidden fixed top-4 right-10 z-50 h-12 w-12 bg-white shadow-xl rounded-lg animate-pulse" />

      {/* Desktop sidebar skeleton */}
      <section className="bg-indigo-50 px-6 py-16 w-80 flex-col justify-between hidden sm:flex">
        <nav>
          <ul className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map(item => (
              <NavItemSkeleton key={item} />
            ))}
          </ul>
        </nav>
        {/* Logout button skeleton */}
        <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse" />
      </section>

      {/* Mobile sidebar skeleton */}
      <div className="fixed z-30 flex inset-0 w-full h-full bg-black/50 transition-opacity duration-300 sm:hidden opacity-0 pointer-events-none">
        <div className="fixed top-0 left-0 bg-indigo-50 w-max px-4 py-8 pt-16 h-full flex flex-col justify-between -translate-x-full">
          <nav>
            <ul className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map(item => (
                <NavItemSkeleton key={item} />
              ))}
            </ul>
          </nav>
          {/* Logout button skeleton */}
          <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse" />
        </div>
      </div>
    </>
  );
};

export default SidebarSkeleton;
