import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Heart, Github, Globe, Shield, Lock, Zap, Keyboard } from 'lucide-react';

interface AboutModalProps {
  collapsed?: boolean;
  isMobile?: boolean;
}

export function AboutModal({ collapsed = false, isMobile = false }: AboutModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showText = !collapsed || isMobile;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={showText ? "default" : "icon"}
          className={showText ? "w-full justify-start gap-2" : "w-full"}
        >
          <Info className="h-5 w-5 shrink-0" />
          {showText && <span>About</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            FinanceHub
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            A modern, secure personal finance management application built with privacy and user experience in mind.
          </p>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Key Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-success shrink-0" />
                <span>End-to-end encryption for all financial data</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-success shrink-0" />
                <span>Real-time updates across all your devices</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-success shrink-0" />
                <span>Budget tracking with smart alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-success shrink-0" />
                <span>Financial goals with progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-success shrink-0" />
                <span>Multi-currency support</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Dashboard</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">1</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">1</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Transactions</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">2</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">2</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Budgets</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">3</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">3</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Goals</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">4</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">4</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Insights</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">5</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">5</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Yearly Summary</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">6</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">6</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Go to Settings</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">7</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">7</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toggle Sidebar</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">Ctrl</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">B</kbd>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">⌘</kbd>
                      <span className="text-muted-foreground">+</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">B</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Open Keyboard Shortcuts</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md">?</kbd>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic pt-2 border-t">
                Windows: Use <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd> • Mac: Use <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘</kbd>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              Built With Love
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                React & TypeScript
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Tailwind CSS
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Supabase Backend
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Shadcn/ui Components
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Web Crypto API
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Recharts
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Version 1.0.0 • Made with <Heart className="h-3 w-3 inline text-destructive" /> by Abhirup Kumar (DevAdvancer)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
