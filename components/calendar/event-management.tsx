'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalendarGroups } from '@/lib/hooks/use-calendar';
import { useWalletManagedGroups } from '@/lib/hooks/use-wallet-groups';
import { CONTRACTS } from '@/lib/wallet/config';

export function EventManagement() {
  const { data: managedGroups, isLoading } = useWalletManagedGroups();
  const { data: groupsData } = useCalendarGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [groupId, setGroupId] = useState('');
  const [timezone, setTimezone] = useState('');
  const [recurs, setRecurs] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [intervalCount, setIntervalCount] = useState(1);

  if (isLoading) return null;
  if (!managedGroups?.length) return null;

  const contractDeployed = !!CONTRACTS.calendar;
  const managedGroupDetails = groupsData?.groups.filter((gr) =>
    managedGroups.includes(gr.group.id),
  );

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full border-fd-border text-fd-accent-foreground hover:bg-fd-accent/40"
        onClick={() => setIsOpen(true)}
      >
        + Register Event
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-fd-border bg-fd-secondary/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-fd-foreground">
          Register Event
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-fd-muted-foreground hover:text-fd-foreground"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="event-title" className="text-xs text-fd-muted-foreground">
            Title
          </Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="border-fd-border bg-fd-background/60 text-fd-foreground placeholder:text-fd-muted-foreground/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-desc" className="text-xs text-fd-muted-foreground">
            Description
          </Label>
          <Textarea
            id="event-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
            rows={2}
            className="border-fd-border bg-fd-background/60 text-fd-foreground placeholder:text-fd-muted-foreground/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-start" className="text-xs text-fd-muted-foreground">
              Start
            </Label>
            <Input
              id="event-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border-fd-border bg-fd-background/60 text-fd-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-end" className="text-xs text-fd-muted-foreground">
              End
            </Label>
            <Input
              id="event-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-fd-border bg-fd-background/60 text-fd-foreground"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-location" className="text-xs text-fd-muted-foreground">
            Location
          </Label>
          <Input
            id="event-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Discord #dev-call"
            className="border-fd-border bg-fd-background/60 text-fd-foreground placeholder:text-fd-muted-foreground/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-tz" className="text-xs text-fd-muted-foreground">
            Timezone
          </Label>
          <Input
            id="event-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g. America/New_York"
            className="border-fd-border bg-fd-background/60 text-fd-foreground placeholder:text-fd-muted-foreground/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-fd-muted-foreground">Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger className="border-fd-border bg-fd-background/60 text-fd-foreground">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent className="border-fd-border bg-fd-popover">
              {managedGroupDetails?.map((gr) => (
                <SelectItem key={gr.group.id} value={gr.group.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: gr.group.color }}
                    />
                    {gr.group.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="event-recurs"
            type="checkbox"
            checked={recurs}
            onChange={(e) => setRecurs(e.target.checked)}
            className="size-3.5 rounded border-fd-border"
          />
          <Label htmlFor="event-recurs" className="text-xs text-fd-muted-foreground">
            Repeats
          </Label>
        </div>
        {recurs && (
          <div className="flex items-center gap-2">
            <Select value={frequency} onValueChange={(v: 'weekly' | 'monthly') => setFrequency(v)}>
              <SelectTrigger className="h-8 w-28 border-fd-border bg-fd-background/60 text-xs text-fd-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-fd-border bg-fd-popover">
                <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-fd-muted-foreground">every</span>
            <Input
              type="number"
              min={1}
              max={30}
              value={intervalCount}
              onChange={(e) => setIntervalCount(Number(e.target.value))}
              className="h-8 w-16 border-fd-border bg-fd-background/60 text-xs text-fd-foreground"
            />
            <span className="text-xs text-fd-muted-foreground">{frequency === 'weekly' ? 'weeks' : 'months'}</span>
          </div>
        )}
        <Button
          className="w-full bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90"
          disabled={
            !contractDeployed || !title || !startTime || !endTime || !groupId
          }
        >
          {contractDeployed ? 'Create Event' : 'Contract Not Deployed'}
        </Button>
      </div>
    </div>
  );
}
