import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard, Command } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['⌘', '1'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['⌘', '2'], description: 'Go to Transactions', category: 'Navigation' },
  { keys: ['⌘', '3'], description: 'Go to Budgets', category: 'Navigation' },
  { keys: ['⌘', '4'], description: 'Go to Goals', category: 'Navigation' },
  { keys: ['⌘', '5'], description: 'Go to Insights', category: 'Navigation' },
  { keys: ['⌘', '6'], description: 'Go to Yearly Summary', category: 'Navigation' },
  { keys: ['⌘', '7'], description: 'Go to Settings', category: 'Navigation' },
  // Sidebar
  { keys: ['⌘', 'B'], description: 'Toggle sidebar', category: 'Sidebar' },
  // General
  { keys: ['?'], description: 'Open keyboard shortcuts', category: 'General' },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for ? key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
      // Also close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded-md min-w-[24px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">?</kbd> anywhere to open this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
