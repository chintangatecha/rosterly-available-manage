
import React, { useState } from 'react';
import { Calendar, Copy, Plus, Save } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WeekNavigation from './WeekNavigation';
import { RosterHeaderProps, RosterVersion } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RosterHeader: React.FC<RosterHeaderProps> = ({
  currentWeekStart,
  previousWeek,
  nextWeek,
  currentRosterVersion,
  rosterVersions = [],
  onRosterVersionChange,
  onCreateRosterVersion,
  onCopyRosterVersion
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionType, setNewVersionType] = useState<'operational' | 'finalized'>('operational');
  
  const isManager = true; // This should be derived from user role in a real implementation
  const handleCreateVersion = () => {
    if (onCreateRosterVersion) {
      onCreateRosterVersion(newVersionType);
      setShowCreateDialog(false);
      setNewVersionName('');
    }
  };
  
  const handleCopyVersion = () => {
    if (onCopyRosterVersion && currentRosterVersion) {
      onCopyRosterVersion(currentRosterVersion.id, newVersionType);
      setShowCopyDialog(false);
      setNewVersionName('');
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Weekly Roster</CardTitle>
          {currentRosterVersion && (
            <Badge variant={currentRosterVersion.type === 'operational' ? 'outline' : 'default'}>
              {currentRosterVersion.type === 'operational' ? 'Operational' : 'Finalized'}
            </Badge>
          )}
        </div>
        <WeekNavigation
          currentWeekStart={currentWeekStart}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex">
          <Tabs defaultValue={currentRosterVersion?.type || 'operational'} className="w-full">
            <TabsList>
              <TabsTrigger 
                value="operational"
                onClick={() => {
                  const operationalVersion = rosterVersions.find(v => v.type === 'operational');
                  if (operationalVersion) {
                    onRosterVersionChange(operationalVersion.id);
                  } else if (isManager) {
                    onCreateRosterVersion('operational');
                  }
                }}
              >
                Operational
              </TabsTrigger>
              <TabsTrigger 
                value="finalized"
                onClick={() => {
                  const finalizedVersion = rosterVersions.find(v => v.type === 'finalized');
                  if (finalizedVersion) {
                    onRosterVersionChange(finalizedVersion.id);
                  }
                }}
                disabled={!rosterVersions.some(v => v.type === 'finalized')}
              >
                Finalized
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isManager && (
          <div className="flex items-center gap-2">
            {currentRosterVersion?.type === 'operational' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyRosterVersion(currentRosterVersion.id, 'finalized')}
                className="flex items-center gap-1"
              >
                <Save size={14} />
                Save as Final
              </Button>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new roster</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {currentRosterVersion && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setShowCopyDialog(true)}
                    >
                      <Copy size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy roster</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        <CardDescription>
          Click + to add shifts for employees
        </CardDescription>
      </div>
      
      {/* Create New Roster Version Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Roster Version</DialogTitle>
            <DialogDescription>
              Create a new roster version for the current week.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-type">Version Type</Label>
              <Select value={newVersionType} onValueChange={(value: 'operational' | 'finalized') => setNewVersionType(value)}>
                <SelectTrigger id="version-type">
                  <SelectValue placeholder="Select version type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Operational rosters are visible to employees. Finalized rosters are only visible to managers.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateVersion}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Copy Roster Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Roster</DialogTitle>
            <DialogDescription>
              Create a copy of the current roster.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="copy-type">New Version Type</Label>
              <Select value={newVersionType} onValueChange={(value: 'operational' | 'finalized') => setNewVersionType(value)}>
                <SelectTrigger id="copy-type">
                  <SelectValue placeholder="Select version type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>Cancel</Button>
            <Button onClick={handleCopyVersion}>Copy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RosterHeader;
