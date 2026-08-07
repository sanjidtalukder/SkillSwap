"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, GripVertical, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api-client";

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" },
];

export function TasksTab({ project, user }: { project: any, user: any }) {
  const [tasks, setTasks] = useState(project.tasks || []);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map((t: any) => t.id === taskId ? { ...t, status: columnId } : t));

    try {
      const res = await fetchWithAuth(`/api/workspace/${project.id}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: columnId })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      toast.error("Could not move task");
      setTasks(previousTasks); // Revert
    }
  };

  const handleCreateTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await fetchWithAuth(`/api/workspace/${project.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title: newTaskTitle, status: columnId, priority: "MEDIUM" })
      });
      
      const data = await res.json();
      if (data.success) {
        setTasks([data.data, ...tasks]);
        setNewTaskTitle("");
        setIsAddingTask(null);
      }
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border/40 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage your project workflow</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter((t: any) => t.status === column.id);
          
          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80 flex flex-col max-h-full bg-muted/20 rounded-xl border border-border/40"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-3 border-b border-border/40 flex justify-between items-center bg-card rounded-t-xl">
                <span className="font-semibold text-sm">{column.label}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[150px]">
                {columnTasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-card border border-border/60 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm leading-tight text-foreground">{task.title}</p>
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <div className="flex gap-2">
                        <Badge variant={task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "warning" : "secondary"} className="text-[9px] px-1.5 py-0">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.deadline && <Calendar className="w-3.5 h-3.5 text-muted-foreground" />}
                        {task.assignee && (
                           <Avatar src={task.assignee.profile?.photo} alt={task.assignee.profile?.fullName} className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAddingTask === column.id ? (
                  <div className="bg-card border border-primary/50 rounded-lg p-2 shadow-sm mt-2">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Task title..." 
                      className="w-full bg-transparent text-sm border-none focus:outline-none mb-2"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateTask(column.id)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setIsAddingTask(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-xs px-2" onClick={() => handleCreateTask(column.id)}>Add</Button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingTask(column.id)}
                    className="w-full py-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-transparent border-dashed hover:border-border/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
