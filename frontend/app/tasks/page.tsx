"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { Input } from "@/components/ui/input";
import { Plus, ChevronLeft, ChevronRight, LogOut, Search } from "lucide-react";
import { API_URL, User, Task } from "@/lib/helper";
import TaskList from "@/components/custom/taskList";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TasksPage() {
  const router = useRouter();

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create task state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Filter, search, and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "TODO" | "IN_PROGRESS" | "INACTIVE"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt_desc" | "createdAt_asc" | "title_asc" | "title_desc"
  >("createdAt_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSignOut = useCallback(() => {
    deleteCookie("token");
    router.push("/");
  }, [router]);

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !token) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          status: "TODO",
        }),
      });

      if (!res.ok) throw new Error("Failed to create task.");
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setNewTitle("");
      setNewDescription("");
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.log(error);
    }
  };

  // Update Task Status
  const handleUpdateStatus = async (task: Task, newStatus: Task["status"]) => {
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status.");
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.log(error);
    }
  };

  // Save Task Edit
  const handleSaveEdit = async (
    id: string,
    title: string,
    description: string,
  ) => {
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes.");
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete task.");
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  // Search & Filter Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && task.status !== "DONE") ||
      (statusFilter === "TODO" && task.status === "TODO") ||
      (statusFilter === "IN_PROGRESS" && task.status === "IN_PROGRESS") ||
      (statusFilter === "INACTIVE" && task.status === "DONE");

    return matchesSearch && matchesFilter;
  });

  // Sorting Logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "createdAt_asc":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "createdAt_desc":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Pagination Logic
  const tasksPerPage = 5;
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage) || 1;

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTasks = sortedTasks.slice(
    (safeCurrentPage - 1) * tasksPerPage,
    safeCurrentPage * tasksPerPage,
  );

  // Auth check & load data
  useEffect(() => {
    const savedToken = getCookie("token");
    if (!savedToken) {
      router.push("/");
      return;
    }

    const loadInitialData = async (authToken: string) => {
      try {
        // Fetch User
        const userRes = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!userRes.ok) {
          if (userRes.status === 401) handleSignOut();
          throw new Error("Failed to load user profile.");
        }
        const userData = await userRes.json();

        // Fetch Tasks
        const tasksRes = await fetch(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks.");
        const tasksData = await tasksRes.json();

        setUser(userData);
        setTasks(tasksData);
        setToken(authToken);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData(savedToken);
  }, [router, handleSignOut]);

  return (
    <div className="flex-1 min-h-screen font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200/50 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              TaskKo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Welcome,{" "}
                <strong className="text-zinc-900 dark:text-white">
                  {user.name || user.email}
                </strong>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Error Notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-455 rounded-xl p-4 text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Add Task Form */}
        <section className="bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Create New Task
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Add details below to track your next task.
            </p>
          </div>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Title
                </label>
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-11 px-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200 w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Add optional notes or description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="h-10 px-6 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl shadow-md font-semibold gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" />
                Add Task
              </Button>
            </div>
          </form>
        </section>

        {/* Filters and Search */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Controls: Status, Sort and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Status Select */}
            <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value: string) => {
                  setStatusFilter(value as any);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-3 w-full sm:w-[145px] bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-sm rounded-xl cursor-pointer">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="INACTIVE">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Sort by:
              </span>
              <Select
                value={sortBy}
                onValueChange={(value: string) => {
                  setSortBy(value as any);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-3 w-full sm:w-[160px] bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-sm rounded-xl cursor-pointer">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="createdAt_desc">
                      Newest Created
                    </SelectItem>
                    <SelectItem value="createdAt_asc">
                      Oldest Created
                    </SelectItem>
                    <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs sm:ml-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Search className="size-4" />
              </span>
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-9 pr-3 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Tasks List */}
        <section className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg
                className="h-8 w-8 animate-spin text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-zinc-500 text-sm">Loading tasks...</span>
            </div>
          ) : (
            <TaskList
              tasks={paginatedTasks}
              token={token}
              onUpdateStatus={handleUpdateStatus}
              onSaveEdit={handleSaveEdit}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <section className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-850 pt-6">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing page{" "}
              <strong className="text-zinc-900 dark:text-white">
                {currentPage}
              </strong>{" "}
              of{" "}
              <strong className="text-zinc-900 dark:text-white">
                {totalPages}
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="gap-1 px-3 border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="gap-1 px-3 border-zinc-250 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
