import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Tag, Search, icons } from 'lucide-react';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  user_id: string | null;
}

// Popular icons for categories
const CATEGORY_ICONS = [
  'wallet', 'credit-card', 'shopping-bag', 'shopping-cart', 'utensils', 'coffee',
  'car', 'fuel', 'plane', 'home', 'building', 'zap', 'smartphone', 'wifi',
  'heart', 'stethoscope', 'dumbbell', 'book', 'book-open', 'briefcase',
  'gift', 'star', 'award', 'target', 'trending-up', 'pie-chart', 'calculator',
  'shield', 'film', 'music', 'palette', 'camera', 'gamepad-2', 'baby',
  'paw-print', 'sparkles', 'wrench', 'clock', 'file-text', 'pencil',
  'laptop', 'monitor', 'headphones', 'shirt', 'scissors', 'more-horizontal'
];

// Popular colors
const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#FBBF24', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#64748B'
];

// Dynamic icon component
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const iconName = name.split('-').map((part, i) => 
    i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
  ).join('') as keyof typeof icons;
  
  const IconComponent = icons[iconName] || icons['Tag'];
  return <IconComponent className={className} />;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('#3B82F6');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setName('');
    setIcon('tag');
    setColor('#3B82F6');
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ name: name.trim(), icon, color })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            icon,
            color,
            user_id: user.id,
            is_default: false,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      
      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon || 'tag');
    setColor(category.color || '#3B82F6');
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userCategories = filteredCategories.filter(cat => !cat.is_default);
  const defaultCategories = filteredCategories.filter(cat => cat.is_default);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground">Manage your expense and income categories</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Coffee & Snacks"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    <div className="grid grid-cols-8 gap-2">
                      {CATEGORY_ICONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setIcon(iconName)}
                          className={cn(
                            "p-2 rounded-md hover:bg-accent transition-colors",
                            icon === iconName && "bg-primary text-primary-foreground hover:bg-primary"
                          )}
                        >
                          <DynamicIcon name={iconName} className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-9 gap-2">
                    {CATEGORY_COLORS.map((colorValue) => (
                      <button
                        key={colorValue}
                        type="button"
                        onClick={() => setColor(colorValue)}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all",
                          color === colorValue && "ring-2 ring-offset-2 ring-primary"
                        )}
                        style={{ backgroundColor: colorValue }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: color }}
                    >
                      <DynamicIcon name={icon} className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{name || 'Category Name'}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="space-y-8">
            {/* User Categories */}
            {userCategories.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Your Categories
                </h2>
                <div className="rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="hidden sm:table-cell">Icon</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                style={{ backgroundColor: category.color || '#6B7280' }}
                              >
                                <DynamicIcon name={category.icon || 'tag'} className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{category.icon || 'tag'}</code>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(category)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Default Categories */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                Default Categories
                <Badge variant="secondary">System</Badge>
              </h2>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Icon</TableHead>
                      <TableHead className="text-right">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaultCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            >
                              <DynamicIcon name={category.icon || 'tag'} className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{category.icon || 'tag'}</code>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">Default</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No categories found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try a different search term' : 'Create your first custom category'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              Transactions using this category will keep their existing category reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
