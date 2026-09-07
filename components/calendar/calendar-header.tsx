'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCalendarGroups } from '@/lib/hooks/use-calendar';
import { useWallet } from '@/lib/wallet/use-wallet';
import { GroupSelectSkeleton } from './calendar-skeleton';

interface CalendarHeaderProps {
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

export function CalendarHeader({
  selectedGroup,
  onGroupChange,
}: CalendarHeaderProps) {
  const { data: groupsData } = useCalendarGroups();
  const { address, isConnecting, connect, disconnect } = useWallet();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-fd-foreground">
          Community Calendar
        </h3>
        <p className="text-sm text-fd-muted-foreground">
          Working group meetings &amp; events
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedGroup} onValueChange={onGroupChange}>
          <SelectTrigger className="w-[160px] border-fd-border bg-fd-secondary/60 text-fd-foreground">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent className="border-fd-border bg-fd-popover">
            <SelectItem value="all">All Groups</SelectItem>
            {groupsData?.groups.map((gr) => (
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
        {address ? (
          <Button
            variant="outline"
            size="sm"
            className="border-fd-border text-fd-muted-foreground hover:text-fd-foreground"
            onClick={disconnect}
          >
            {truncateAddress(address)}
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>
    </div>
  );
}
