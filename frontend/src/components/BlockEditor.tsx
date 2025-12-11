import { useState } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  Block,
  BlockType,
  BLOCK_REGISTRY,
  createDefaultBlock,
} from "../types/blocks";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    onChange([...blocks, newBlock]);
    setShowBlockPicker(false);
    setEditingBlockId(newBlock.id);
  };

  const deleteBlock = (blockId: string) => {
    onChange(blocks.filter((b) => b.id !== blockId));
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    onChange(newBlocks);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Box;
  };

  return (
    <div className="space-y-4">
      {/* Blocks list */}
      {blocks.map((block, index) => {
        const blockMeta = BLOCK_REGISTRY.find((b) => b.type === block.type);
        const Icon = getIcon(blockMeta?.icon || "Box");
        const isEditing = editingBlockId === block.id;

        return (
          <div
            key={block.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Block header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {blockMeta?.name || block.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-300"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, "down")}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-300"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                  className="rounded px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                >
                  {isEditing ? "Collapse" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Block content editor */}
            {isEditing && (
              <div className="p-4">
                <BlockContentEditor
                  block={block}
                  onChange={(content) => updateBlock(block.id, { content })}
                />
              </div>
            )}

            {/* Block preview */}
            {!isEditing && (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                <BlockPreview block={block} />
              </div>
            )}
          </div>
        );
      })}

      {/* Add block button */}
      <button
        type="button"
        onClick={() => setShowBlockPicker(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-gray-600 transition-colors hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        <Plus className="h-5 w-5" />
        Add Block
      </button>

      {/* Block picker modal */}
      {showBlockPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
              onClick={() => setShowBlockPicker(false)}
            ></div>
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Choose a Block
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BLOCK_REGISTRY.map((blockMeta) => {
                  const Icon = getIcon(blockMeta.icon);
                  return (
                    <button
                      key={blockMeta.type}
                      type="button"
                      onClick={() => addBlock(blockMeta.type)}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:hover:border-indigo-400 dark:hover:bg-indigo-900/20"
                    >
                      <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {blockMeta.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {blockMeta.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowBlockPicker(false)}
                className="mt-4 w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Block content editor component
function BlockContentEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (content: any) => void;
}) {
  const content = block.content as any;

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Heading
            </label>
            <input
              type="text"
              value={content.heading || ""}
              onChange={(e) =>
                onChange({ ...content, heading: e.target.value })
              }
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subheading
            </label>
            <textarea
              value={content.subheading || ""}
              onChange={(e) =>
                onChange({ ...content, subheading: e.target.value })
              }
              rows={2}
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                CTA Text
              </label>
              <input
                type="text"
                value={content.ctaText || ""}
                onChange={(e) =>
                  onChange({ ...content, ctaText: e.target.value })
                }
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                CTA Link
              </label>
              <input
                type="text"
                value={content.ctaLink || ""}
                onChange={(e) =>
                  onChange({ ...content, ctaLink: e.target.value })
                }
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>
        </div>
      );

    case "wysiwyg":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (WYSIWYG Editor Coming Soon)
          </label>
          <textarea
            value={content.html || ""}
            onChange={(e) => onChange({ ...content, html: e.target.value })}
            rows={10}
            className="block w-full rounded-md border-0 bg-white px-3 py-2 font-mono text-sm text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            placeholder="<p>Your HTML content here...</p>"
          />
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Heading
            </label>
            <input
              type="text"
              value={content.heading || ""}
              onChange={(e) =>
                onChange({ ...content, heading: e.target.value })
              }
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={content.description || ""}
              onChange={(e) =>
                onChange({ ...content, description: e.target.value })
              }
              rows={2}
              className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Button Text
              </label>
              <input
                type="text"
                value={content.buttonText || ""}
                onChange={(e) =>
                  onChange({ ...content, buttonText: e.target.value })
                }
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Button Link
              </label>
              <input
                type="text"
                value={content.buttonLink || ""}
                onChange={(e) =>
                  onChange({ ...content, buttonLink: e.target.value })
                }
                className="block w-full rounded-md border-0 bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Editor for {block.type} block coming soon...
        </div>
      );
  }
}

// Block preview component
function BlockPreview({ block }: { block: Block }) {
  const content = block.content as any;

  switch (block.type) {
    case "hero":
      return (
        <div>
          <div className="font-medium">{content.heading}</div>
          <div className="mt-1 text-xs">{content.subheading}</div>
        </div>
      );

    case "wysiwyg":
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: content.html?.substring(0, 200) + "...",
          }}
        />
      );

    case "cta":
      return (
        <div>
          <div className="font-medium">{content.heading}</div>
          <div className="mt-1 text-xs">{content.description}</div>
        </div>
      );

    default:
      return <div>{block.type} block</div>;
  }
}
