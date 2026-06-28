"use client";

import TaskContainer from "./taskContainer";
import { Task } from "@/lib/helper";

interface TaskListProps {
  tasks: Task[];
  token: string | null;
  onUpdateStatus: (task: Task, newStatus: Task["status"]) => Promise<void>;
  onSaveEdit: (id: string, title: string, description: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TaskList({
  tasks,
  token,
  onUpdateStatus,
  onSaveEdit,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl bg-white/30 dark:bg-zinc-900/10">
        <p className="text-zinc-500 dark:text-zinc-400">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskContainer
          key={task.id}
          task={task}
          token={token}
          onUpdateStatus={onUpdateStatus}
          onSaveEdit={onSaveEdit}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
