import { Plus, Trash2, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductLinkItem } from "./Types";

interface ProductLinksEditorProps {
  links: ProductLinkItem[];
  onChange: (links: ProductLinkItem[]) => void;
}

export default function ProductLinksEditor({ links, onChange }: ProductLinksEditorProps) {
  const updateLink = (index: number, key: keyof ProductLinkItem, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [key]: value };
    onChange(updatedLinks);
  };

  const addLink = () => onChange([...links, { title: "", url: "" }]);
  const removeLink = (index: number) => onChange(links.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Product Links</h2>
        </div>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Link</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {links.length === 0 && (
        <p className="text-sm text-slate-400">
          No links added yet. Add documentation, demo, or support links for customers.
        </p>
      )}

      <div className="space-y-3">
        {links.map((link, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border sm:border-0 p-3 sm:p-0"
          >
            <Input
              placeholder="Link Title (e.g. Documentation)"
              value={link.title}
              onChange={(e) => updateLink(index, "title", e.target.value)}
              className="sm:w-56"
            />
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Link2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
                className="text-slate-400 hover:text-red-500 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}