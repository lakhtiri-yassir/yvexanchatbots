"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreVertical, Trash2, Download, Check } from "lucide-react";
import {
  getUserThemes,
  applyThemeToBot,
  deleteTheme,
} from "@/app/chatbot/[id]/design/actions";
import { SavedTheme } from "@/lib/design/schema";
import { exportDesignToFile } from "@/lib/design/export";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ThemeLibraryProps {
  chatbotId: string;
  onThemeApplied?: () => void;
}

export function ThemeLibrary({ chatbotId, onThemeApplied }: ThemeLibraryProps) {
  const [themes, setThemes] = useState<SavedTheme[]>([]);
  const [filteredThemes, setFilteredThemes] = useState<SavedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    filterThemes();
  }, [searchQuery, themes]);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const result = await getUserThemes();
      if (result.success) {
        setThemes(result.themes);
      } else {
        toast.error("Failed to load themes");
      }
    } catch (error) {
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  const filterThemes = () => {
    if (!searchQuery.trim()) {
      setFilteredThemes(themes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = themes.filter((theme) => {
      const nameMatch = theme.theme_name.toLowerCase().includes(query);
      const descMatch = theme.description?.toLowerCase().includes(query);
      const tagsMatch = theme.tags?.some((tag) =>
        tag.toLowerCase().includes(query),
      );
      return nameMatch || descMatch || tagsMatch;
    });

    setFilteredThemes(filtered);
  };

  const handleApplyTheme = async (themeId: string) => {
    setApplyingTheme(themeId);
    try {
      const result = await applyThemeToBot(chatbotId, themeId);
      if (result.success) {
        toast.success("Theme applied successfully!");
        onThemeApplied?.();
      } else {
        toast.error(result.error || "Failed to apply theme");
      }
    } catch (error) {
      toast.error("Failed to apply theme");
    } finally {
      setApplyingTheme(null);
    }
  };

  const handleExportTheme = (theme: SavedTheme) => {
    const exportData = {
      metadata: {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        themeName: theme.theme_name,
        description: theme.description || undefined,
        tags: theme.tags || undefined,
      },
      design: theme.design_config,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${theme.theme_name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Theme exported!");
  };

  const handleDeleteTheme = async () => {
    if (!themeToDelete) return;

    try {
      const result = await deleteTheme(themeToDelete);
      if (result.success) {
        toast.success("Theme deleted successfully");
        setThemes(themes.filter((t) => t.id !== themeToDelete));
      } else {
        toast.error(result.error || "Failed to delete theme");
      }
    } catch (error) {
      toast.error("Failed to delete theme");
    } finally {
      setDeleteDialogOpen(false);
      setThemeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search themes by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Theme Count */}
      <p className="text-sm text-gray-600">
        {filteredThemes.length}{" "}
        {filteredThemes.length === 1 ? "theme" : "themes"} found
      </p>

      {/* Themes Grid */}
      {filteredThemes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-center">
              {themes.length === 0
                ? "No saved themes yet. Export a design to create your first theme!"
                : "No themes match your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredThemes.map((theme) => (
            <Card key={theme.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {theme.theme_name}
                    </CardTitle>
                    {theme.description && (
                      <CardDescription className="mt-1">
                        {theme.description}
                      </CardDescription>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleExportTheme(theme)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setThemeToDelete(theme.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tags */}
                {theme.tags && theme.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {theme.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(theme.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {theme.times_applied > 0 && (
                    <span>
                      Used {theme.times_applied}{" "}
                      {theme.times_applied === 1 ? "time" : "times"}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => handleApplyTheme(theme.id)}
                  disabled={applyingTheme === theme.id}
                  className="w-full"
                >
                  {applyingTheme === theme.id ? (
                    <>Applying...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Apply Theme
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this theme? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTheme}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
