"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Project, Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddTaskFormProps {
  onAddTask: (name: string, projectId?: string, clientId?: string) => void;
  projects: Project[];
  clients: Client[];
}

export default function AddTaskForm({
  onAddTask,
  projects,
  clients,
}: AddTaskFormProps) {
  const [taskName, setTaskName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [selectedClientId, setSelectedClientId] = useState<
    string | undefined
  >();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      onAddTask(taskName.trim(), selectedProjectId, selectedClientId);
      setTaskName("");
      setSelectedProjectId(undefined);
      setSelectedClientId(undefined);
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : "Failed to add task";
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2 mb-6">
          <Input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />
          <div className="flex space-x-2">
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
