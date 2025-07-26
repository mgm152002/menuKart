'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { destroyCookie } from 'nookies';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    destroyCookie(null, 'jwtToken', { path: '/' });
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800/70 backdrop-blur-sm p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/adminmenu">
                  Menu
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/adminorders">
                  Current Orders
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/admincomplete">
                  Completed Orders
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/adminfeedback">
                  Feedback
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-black text-white hover:bg-gray-900`}>
                <Link href="/qr">
                  Generate QR
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button onClick={handleLogout} className="bg-black text-white hover:bg-gray-900 border-black">
          Logout
        </Button>
      </div>
    </nav>
  );
}
