import { FinalLogo } from "@/components/FinalLogo";
import { Button } from "@/components/ui/Button";
import { Search, Menu } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <FinalLogo size="small" />
            </Link>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-zinc-900/50 border border-zinc-700 hover:border-cyan-500/50 rounded-lg px-4 py-2 w-64 transition-colors focus-within:border-cyan-500 focus-within:bg-zinc-900">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search markets"
                className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">How it works</Button>

            {/* Connect Wallet / Auth */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'authenticated' ? false : mounted; // Wait, original logic: ready = mounted && authStatus !== 'loading'. 
                // Let's stick to standard RainbowKit logic.
                const isReady = mounted && authenticationStatus !== 'loading';
                const connected =
                  isReady &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!isReady && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={openConnectModal}>Log in</Button>
                            <Button variant="primary" size="sm" onClick={openConnectModal}>Sign Up</Button>
                          </div>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button variant="danger" size="sm" onClick={openChainModal}>
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex gap-2">
                          <Link href="/portfolio">
                            <Button variant="ghost" size="sm">Portfolio</Button>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={openAccountModal}>
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            <button className="md:hidden text-zinc-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}