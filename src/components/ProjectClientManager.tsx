"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectClientManager() {
  const [projectName, setProjectName] = useState("");
  const [projectRate, setProjectRate] = useState("");
  const [clientName, setClientName] = useState("");
  const { toast } = useToast();
  const {
    projects,
    isError: isProjectError,
    error: projectError,
    addProject,
    isAddingProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const {
    clients,
    isError: isClientError,
    error: clientError,
    addClient,
    isAddingClient,
    deleteClient,
  } = useClients();

  // console.log("Clients:", clients);
  // console.log("Projects:", projects);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectRate) {
      toast({
        title: "Error",
        description: "Project name and rate are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      addProject({
        name: projectName,
        hourlyRate: parseFloat(projectRate),
      });
      setProjectName("");
      setProjectRate("");
      toast({
        title: "Success",
        description: "Project added successfully.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add project.",
        variant: "destructive",
      });
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      toast({
        title: "Error",
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      addClient({ name: clientName });
      setClientName("");
      toast({
        title: "Success",
        description: "Client added successfully.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add client.",
        variant: "destructive",
      });
    }
  };

  if (isProjectError || isClientError) {
    return (
      <div>
        Error:{" "}
        {projectError?.message ||
          clientError?.message ||
          "An unknown error occurred"}
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="space-y-6">
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label htmlFor="project-rate">Rate ($/hr)</Label>
                    <Input
                      id="project-rate"
                      type="number"
                      min="0"
                      step="5"
                      value={projectRate}
                      onChange={(e) => setProjectRate(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isAddingProject}>
                    {isAddingProject ? "Adding..." : "Add Project"}
                  </Button>
                </div>
              </form>

              <div className="grid grid-cols-2 gap-2">
                {projects?.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between px-2 py-1 bg-accent rounded-lg"
                  >
                    <span className="font-medium">{project.name}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={project.hourlyRate}
                        onChange={(e) =>
                          updateProject({
                            id: project.id,
                            hourlyRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-16 h-8"
                        min="0"
                        step="5"
                      />
                      <span className="text-sm text-muted-foreground">
                        $/hr
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {project.name}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <div className="space-y-6">
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <Button type="submit" disabled={isAddingClient}>
                    {isAddingClient ? "Adding..." : "Add Client"}
                  </Button>
                </div>
              </form>

              <div className="grid grid-cols-2 gap-2">
                {clients?.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between px-2 py-1 bg-accent rounded-lg"
                  >
                    <span className="font-medium">{client.name}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{client.name}
                            &quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteClient(client.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
