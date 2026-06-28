"use client";

import { useState } from "react";
import { Task } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskContainerProps {
  task: Task;
  token: string | null;
  onUpdateStatus: (task: Task, newStatus: Task["status"]) => Promise<void>;
  onSaveEdit: (id: string, title: string, description: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TaskContainer({
  task,
  onUpdateStatus,
  onSaveEdit,
  onDeleteTask,
}: TaskContainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(task.title);
  const [editingDescription, setEditingDescription] = useState(
    task.description || "",
  );

  const handleSave = async () => {
    if (!editingTitle.trim()) return;
    await onSaveEdit(task.id, editingTitle.trim(), editingDescription.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingTitle(task.title);
    setEditingDescription(task.description || "");
    setIsEditing(false);
  };

  const taskDate = new Date(task.createdAt);

  const isDone = task.status === "DONE";

  return (
    <div
      className={`flex flex-col gap-4 p-6 rounded-2xl border bg-white dark:bg-zinc-900/60 shadow-sm transition-all duration-300 ${
        isDone
          ? "border-zinc-200/30 dark:border-zinc-900/40 opacity-70"
          : "border-zinc-200/50 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-md"
      }`}
    >
      {/* Task details */}
      <div className="min-w-0 w-full">
        <div className="flex-1 min-w-0 space-y-1">
          {isEditing ? (
            <div className="space-y-3 w-full">
              <div>
                <Input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="h-10 text-base bg-zinc-50 dark:bg-zinc-950 border-zinc-250 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 w-full"
                  placeholder="Task title..."
                  required
                />
                {editingTitle.trim() === "" && (
                  <p className="text-xs text-red-500 mt-1">
                    Title is required.
                  </p>
                )}
              </div>
              <textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                rows={3}
                placeholder="Description (optional)..."
                className="w-full text-sm rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 resize-none placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <h3
                  className={`font-semibold text-lg wrap-break-word ${isDone ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-white"}`}
                >
                  {task.title}
                </h3>
                <span className="text-zinc-400 text-xs">
                  {taskDate.toLocaleDateString("en-US")}
                </span>
              </div>
              {task.description && (
                <p
                  className={`text-sm wrap-break-word ${isDone ? "text-zinc-400/80 dark:text-zinc-655" : "text-zinc-500 dark:text-zinc-400"}`}
                >
                  {task.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Actions */}
      <div className="flex justify-between w-full ">
        <div>
          <Select
            value={task.status}
            onValueChange={(value: string) => {
              onUpdateStatus(task, value as Task["status"]);
            }}
          >
            <SelectTrigger
              className={`text-xs font-semibold px-3 py-1.5 h-auto rounded-full border cursor-pointer outline-none transition-all duration-200 ${
                task.status === "DONE"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : task.status === "IN_PROGRESS"
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-655 dark:text-zinc-300"
              }`}
            >
              <SelectValue placeholder="Select Task Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 mr-1 select-none">
                Are you sure?
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await onDeleteTask(task.id);
                  setShowDeleteConfirm(false);
                }}
                className="cursor-pointer px-3 h-9 text-xs font-semibold"
              >
                Yes, Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-zinc-600 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer px-3 h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
            </div>
          ) : isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!editingTitle.trim()}
                className="text-emerald-600 border-emerald-250 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer gap-1.5 px-3 h-9 text-xs font-semibold"
              >
                <Check className="size-4" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer gap-1.5 px-3 h-9 text-xs font-semibold"
              >
                <X className="size-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setShowDeleteConfirm(false);
                }}
                className="text-zinc-600 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer gap-1.5 px-3 h-9 text-xs font-semibold"
              >
                <Edit2 className="size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="hover:text-red-655 hover:bg-red-500/10 cursor-pointer gap-1.5 px-3 h-9 text-xs font-semibold"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
