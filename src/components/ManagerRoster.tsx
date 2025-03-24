
import React, { useState, useEffect } from 'react';
import { startOfWeek, subWeeks, addWeeks, addDays, format, parseISO, isEqual } from 'date-fns';
import { Calendar, Save, LogOut, UserPlus, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AnimatedTransition from './AnimatedTransition';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import our new components
import RosterHeader from './roster/RosterHeader';
import CombinedRosterTable from './roster/CombinedRosterTable';
import AddShiftDialog from './roster/AddShiftDialog';
import AddEmployeeDialog from './roster/AddEmployeeDialog';
import { useEmployeeData } from './roster/hooks/useEmployeeData';
import { useShiftManagement } from './roster/hooks/useShiftManagement';
import { useRosterVersions } from './roster/hooks/useRosterVersions';
import { useSections } from './roster/hooks/useSections';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

const ManagerRoster: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showSectionsSheet, setShowSectionsSheet] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { employees, employeeAvailability, loading: employeesLoading, fetchEmployees } = useEmployeeData();
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(employeeFilter.toLowerCase())
  );
  
  const { 
    rosterVersions,
    currentRosterVersion,
    loading: versionsLoading,
    createRosterVersion,
    copyRosterVersion,
    changeRosterVersion,
    addShift: addRosterShift,
    removeShift: removeRosterShift
  } = useRosterVersions(currentWeekStart);
  
  const {
    sections,
    loading: sectionsLoading,
    addSection,
    updateSection,
    deleteSection,
    updateEmployeeSection
  } = useSections();
  
  const { 
    showAddShiftDialog,
    setShowAddShiftDialog,
    selectedDay,
    selectedEmployee,
    shiftForm,
    openAddShiftDialog,
    handleShiftFormChange
  } = useShiftManagement();

  // Create an array of Date objects for the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  
  const loading = employeesLoading || versionsLoading || sectionsLoading;
  
  // This function will be called when an employee is updated
  const handleEmployeeUpdated = () => {
    fetchEmployees();
    toast.success('Employee information updated successfully');
  };
  
  // Handle creating a new roster version
  const handleCreateRosterVersion = (type: 'operational' | 'finalized') => {
    createRosterVersion(type);
  };
  
  // Handle copying the current roster version
  const handleCopyRosterVersion = (type: 'operational' | 'finalized') => {
    if (currentRosterVersion) {
      copyRosterVersion(currentRosterVersion.id, type);
    }
  };
  
  // Handle changing the current roster version
  const handleRosterVersionChange = (versionId: string) => {
    changeRosterVersion(versionId);
  };
  
  // Handle adding a new section
  const handleAddSection = async () => {
    if (newSectionName.trim()) {
      await addSection(newSectionName.trim());
      setNewSectionName('');
    }
  };
  
  // Handle updating an employee's section
  const handleUpdateEmployeeSection = async (employeeId: string, sectionId: string | null) => {
    const success = await updateEmployeeSection(employeeId, sectionId);
    if (success) {
      // Make sure to refresh the employee data
      await fetchEmployees();
      toast.success('Employee section updated successfully');
    }
  };
  
  const previousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleSaveRoster = async () => {
    if (!currentRosterVersion) {
      toast.error('No active roster version to save');
      return;
    }
    
    // Create a finalized version if the current one is operational
    if (currentRosterVersion.type === 'operational') {
      const result = await copyRosterVersion(currentRosterVersion.id, 'finalized');
      if (result) {
        toast.success('Created finalized roster version');
      }
    } else {
      toast.success('Roster is already finalized');
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Check if employee is available on a specific day
  const isEmployeeAvailable = (employeeId: string, day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return employeeAvailability.some(a => 
      a.user_id === employeeId && 
      a.date === formattedDate
    );
  };
  
  // Handle adding a shift
  const handleAddShift = async () => {
    if (!selectedDay || !selectedEmployee || !currentRosterVersion) {
      return;
    }
    
    await addRosterShift(
      selectedEmployee.id,
      selectedDay,
      shiftForm.startTime,
      shiftForm.endTime
    );
    
    setShowAddShiftDialog(false);
  };
  
  // Get shifts for a specific day and employee from the current roster version
  const getShiftsForDayAndEmployee = (day: Date, employeeId: string) => {
    if (!currentRosterVersion) return [];
    
    const formattedDate = format(day, 'yyyy-MM-dd');
    
    return currentRosterVersion.shifts.filter(shift => 
      shift.employeeId === employeeId && 
      format(shift.day, 'yyyy-MM-dd') === formattedDate
    );
  };
  
  // Remove a shift
  const handleRemoveShift = async (shiftId: string) => {
    await removeRosterShift(shiftId);
  };
  
  if (loading) {
    return (
      <AnimatedTransition className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AnimatedTransition>
    );
  }
  
  return (
    <AnimatedTransition className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Roster Management</h1>
        <p className="text-muted-foreground">Create and manage your team's schedule</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddEmployeeDialog(true)} 
              className="gap-2"
            >
              <UserPlus size={16} />
              Add Employee
            </Button>
            
            <Sheet open={showSectionsSheet} onOpenChange={setShowSectionsSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Layers size={16} />
                  Manage Sections
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Manage Sections</SheetTitle>
                  <SheetDescription>
                    Create and manage sections to organize your employees
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6">
                  <Tabs defaultValue="sections">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="employees">Employees</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="sections" className="space-y-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="New section name" 
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                        />
                        <Button onClick={handleAddSection}>Add</Button>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        {sections.map(section => (
                          <div key={section.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{section.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteSection(section.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="employees" className="space-y-4 mt-4">
                      {employees.map(employee => (
                        <div key={employee.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.jobRole || 'No role'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {employee.section && (
                              <Badge variant="outline">
                                {employee.section.name || 'Unknown'}
                              </Badge>
                            )}
                            <select 
                              className="border rounded p-1 text-sm"
                              value={employee.section ? employee.section.id : ''}
                              onChange={(e) => handleUpdateEmployeeSection(
                                employee.id, 
                                e.target.value || null
                              )}
                            >
                              <option value="">No section</option>
                              {sections.map(section => (
                                <option key={section.id} value={section.id}>
                                  {section.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <RosterHeader
            currentWeekStart={currentWeekStart}
            previousWeek={previousWeek}
            nextWeek={nextWeek}
            currentRosterVersion={currentRosterVersion}
            rosterVersions={rosterVersions}
            onRosterVersionChange={handleRosterVersionChange}
            onCreateRosterVersion={handleCreateRosterVersion}
            onCopyRosterVersion={handleCopyRosterVersion}
          />
        </CardHeader>
        
        <CardContent className="px-2">
          {currentRosterVersion ? (
            <>
              <div className="flex mb-4 justify-between items-center">
                <div className="text-sm font-medium">
                  {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} {employeeFilter && 'Matching Filter'}
                </div>
                <Input
                  className="max-w-xs"
                  placeholder="Search employees..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>
              
              {filteredEmployees.length > 0 ? (
                <CombinedRosterTable
                  weekDays={weekDays}
                  employees={filteredEmployees}
                  shifts={currentRosterVersion.shifts}
                  employeeAvailability={employeeAvailability}
                  getShiftsForDayAndEmployee={getShiftsForDayAndEmployee}
                  isEmployeeAvailable={isEmployeeAvailable}
                  openAddShiftDialog={openAddShiftDialog}
                  removeShift={handleRemoveShift}
                  isManager={true}
                  onEmployeeUpdated={handleEmployeeUpdated}
                />
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">
                    {employeeFilter ? 
                      "No employees match your search filter." : 
                      "No employees found. Add employees to create shifts."}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setShowAddEmployeeDialog(true)}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Add Employee
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No roster version available for this week.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => handleCreateRosterVersion('operational')}
              >
                Create Operational Roster
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveRoster} 
          className="gap-2"
          disabled={!currentRosterVersion || currentRosterVersion.type === 'finalized'}
        >
          <Save size={16} />
          {currentRosterVersion?.type === 'operational' ? 'Create Finalized Version' : 'Save Roster'}
        </Button>
      </div>
      
      {/* Add Shift Dialog */}
      <AddShiftDialog
        isOpen={showAddShiftDialog}
        onClose={() => setShowAddShiftDialog(false)}
        selectedDay={selectedDay}
        selectedEmployee={selectedEmployee}
        shiftForm={shiftForm}
        onChange={handleShiftFormChange}
        onSubmit={handleAddShift}
        isEmployeeAvailable={!!selectedDay && !!selectedEmployee && isEmployeeAvailable(selectedEmployee.id, selectedDay)}
      />
      
      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        isOpen={showAddEmployeeDialog}
        onClose={() => setShowAddEmployeeDialog(false)}
        onEmployeeAdded={fetchEmployees}
      />
    </AnimatedTransition>
  );
};

export default ManagerRoster;
