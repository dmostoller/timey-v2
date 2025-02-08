import { useState } from "react";
import type { Task, Project, Client } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { Separator } from "@/components/ui/separator";
import { ProjectsPieChart } from "./charts/ProjectsPieChart";
import { ClientsBarChart } from "./charts/ClientsBarChart";
import { TaskAreaChart } from "./charts/TaskAreaChart";

interface SummaryProps {
  tasks: Task[];
  projects: Project[];
  clients: Client[];
}

export default function Summary({ tasks, projects, clients }: SummaryProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { timeEntries } = useTimeEntries(
    dateRange.from?.toISOString().split("T")[0],
    dateRange.to?.toISOString().split("T")[0],
  );

  // Filter time entries by selected client and project
  const filteredTimeEntries = timeEntries?.filter((entry) => {
    const task = tasks.find((t) => t.id === entry.taskId);
    if (!task) return false;

    const clientMatch =
      selectedClientId === "all" || task.clientId === selectedClientId;
    const projectMatch =
      selectedProjectId === "all" || task.projectId === selectedProjectId;

    return clientMatch && projectMatch;
  });

  // Calculate totals using filtered entries
  const totalTime =
    filteredTimeEntries?.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0,
    ) || 0;

  const projectSummaries = projects.map((project) => {
    const projectEntries =
      filteredTimeEntries?.filter(
        (entry) =>
          tasks.find((t) => t.id === entry.taskId)?.projectId === project.id,
      ) || [];
    const totalTime = projectEntries.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0,
    );
    const earnings = (totalTime / 3600) * project.hourlyRate;
    return {
      ...project,
      totalTime,
      earnings,
    };
  });

  const clientSummaries = clients.map((client) => {
    const clientEntries =
      filteredTimeEntries?.filter(
        (entry) =>
          tasks.find((t) => t.id === entry.taskId)?.clientId === client.id,
      ) || [];
    const totalTime = clientEntries.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0,
    );
    const earnings = clientEntries.reduce((acc, entry) => {
      const task = tasks.find((t) => t.id === entry.taskId);
      const project = projects.find((p) => p.id === task?.projectId);
      return acc + (entry.duration / 3600) * (project?.hourlyRate || 0);
    }, 0);
    return {
      ...client,
      totalTime,
      earnings,
    };
  });

  const totalEarnings = projectSummaries.reduce(
    (acc, project) => acc + project.earnings,
    0,
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const pieData = projectSummaries
    .filter((p) => p.totalTime > 0)
    .map((project) => ({
      name: project.name,
      value: project.totalTime,
      earnings: project.earnings,
      formattedTime: formatTime(project.totalTime),
      formattedEarnings: formatMoney(project.earnings),
    }));

  const barData = clientSummaries
    .filter((c) => c.totalTime > 0)
    .map((client) => ({
      name: client.name,
      time: client.totalTime / 3600,
      earnings: client.earnings,
    }));

  const areaChartData =
    filteredTimeEntries?.map((entry) => {
      const task = tasks.find((t) => t.id === entry.taskId);
      const project = projects.find((p) => p.id === task?.projectId);
      return {
        date: entry.date,
        project: project?.name || "Unknown",
        duration: entry.duration,
      };
    }) || [];

  return (
    <Card className="mt-4 bg-card text-card-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Summary</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects
                  .filter(
                    (project) =>
                      selectedClientId === "all" ||
                      tasks.some(
                        (t) =>
                          t.projectId === project.id &&
                          t.clientId === selectedClientId,
                      ),
                  )
                  .map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) =>
                    setDateRange({ from: range?.from, to: range?.to })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
              <p className="text-xs text-muted-foreground">
                Total Time Tracked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatMoney(totalEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-2 gap-8">
          <ProjectsPieChart
            data={pieData}
            formatTime={formatTime}
            formatMoney={formatMoney}
          />
          <ClientsBarChart
            data={barData}
            formatTime={formatTime}
            formatMoney={formatMoney}
          />
        </div>
        <Separator className="my-8" />
        <TaskAreaChart data={areaChartData} formatTime={formatTime} />
        <Separator className="my-8" />
        <div className="flex mt-4 gap-8">
          <div className="w-1/2">
            <h3 className="font-semibold mt-4 mb-2">
              Time and Earnings by Project:
            </h3>
            <ul className="space-y-1">
              {projectSummaries.map((project) => (
                <li key={project.id} className="flex justify-between">
                  <span>{project.name}</span>
                  <span className="text-muted-foreground">
                    {formatTime(project.totalTime)} |{" "}
                    {formatMoney(project.earnings)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-1/2">
            <h3 className="font-semibold mt-4 mb-2">
              Time and Earnings by Client:
            </h3>
            <ul className="space-y-1">
              {clientSummaries.map((client) => (
                <li key={client.id} className="flex justify-between">
                  <span>{client.name}</span>
                  <span className="text-muted-foreground">
                    {formatTime(client.totalTime)} |{" "}
                    {formatMoney(client.earnings)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
