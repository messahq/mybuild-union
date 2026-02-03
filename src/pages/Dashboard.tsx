import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { useBlueprints } from '@/hooks/useBlueprints';
import { useActivity } from '@/hooks/useActivity';
import { FolderKanban, FileText, Activity, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_COLORS = {
  planning: '#94a3b8',
  in_progress: '#3b82f6',
  on_hold: '#f59e0b',
  completed: '#22c55e',
};

export default function Dashboard() {
  const { projects } = useProjects();
  const { blueprints } = useBlueprints();
  const { activities } = useActivity();

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  
  const statusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: STATUS_COLORS.planning },
    { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, color: STATUS_COLORS.in_progress },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: STATUS_COLORS.on_hold },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: STATUS_COLORS.completed },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-600' },
    { label: 'Active Projects', value: activeProjects, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Blueprints', value: blueprints.length, icon: FileText, color: 'text-purple-600' },
    { label: 'Activities', value: activities.length, icon: Activity, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your construction projects</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No projects yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No activity yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
