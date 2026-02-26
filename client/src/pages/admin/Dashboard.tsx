import { useState } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Activity, Users, Vote, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function AdminDashboard() {
  const candidates = useElectionStore(state => state.candidates);
  const election = useElectionStore(state => state.election);
  const toggleElection = useElectionStore(state => state.toggleElection);
  const securityFlags = useElectionStore(state => state.securityFlags);
  
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  // Colors based on theme but static for chart
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#6366f1'];

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Election Command Center</h1>
          <p className="text-muted-foreground">Monitor live results and system security.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Election Status</span>
            <span className="text-xs text-muted-foreground">{election.isActive ? 'Accepting Votes' : 'Polling Closed'}</span>
          </div>
          <Switch 
            checked={election.isActive} 
            onCheckedChange={(checked) => toggleElection(checked)} 
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
            <Vote className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last hour</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Voters</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Currently verifying identity</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">99.99%</div>
            <p className="text-xs text-muted-foreground mt-1">All nodes operational</p>
          </CardContent>
        </Card>
        <Card className={`glass ${securityFlags.suspiciousActivity ? 'border-destructive' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <ShieldAlert className={`w-4 h-4 ${securityFlags.suspiciousActivity ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${securityFlags.suspiciousActivity ? 'text-destructive' : ''}`}>
              {securityFlags.suspiciousActivity ? '2' : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityFlags.suspiciousActivity ? 'Duplicate IP detected' : 'No anomalies detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle>Live Vote Tally</CardTitle>
            <CardDescription>Real-time mock aggregate of encrypted ballots.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candidates} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    axisLine={false} 
                    tickLine={false} 
                    angle={-45} 
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {candidates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Security Log */}
        <Card className="glass flex flex-col">
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Recent cryptographic events</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {[
                { time: '10:42:15', event: 'Ballot cast', hash: '0x8f...3a2', type: 'info' },
                { time: '10:41:02', event: 'Identity verified', hash: '0x1b...9c4', type: 'info' },
                { time: '10:39:45', event: 'Ballot cast', hash: '0x44...ef1', type: 'info' },
                { time: '10:35:12', event: 'Failed login attempt', hash: 'IP 192.168.1.1', type: 'warning' },
                { time: '10:30:00', event: 'Admin session started', hash: 'admin@gov.org', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="text-muted-foreground text-xs font-mono pt-0.5 w-16">{log.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'warning' ? 'bg-warning' : 'bg-success'}`} />
                      <span className="font-medium">{log.event}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{log.hash}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}