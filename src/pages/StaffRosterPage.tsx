import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Pencil, Trash2, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  { key: "teal",   bg: "bg-teal-100",   text: "text-teal-800",   border: "border-teal-300",   dot: "bg-teal-500"   },
  { key: "blue",   bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300",   dot: "bg-blue-500"   },
  { key: "violet", bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-300", dot: "bg-violet-500" },
  { key: "rose",   bg: "bg-rose-100",   text: "text-rose-800",   border: "border-rose-300",   dot: "bg-rose-500"   },
  { key: "amber",  bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-300",  dot: "bg-amber-500"  },
  { key: "emerald",bg: "bg-emerald-100",text: "text-emerald-800",border: "border-emerald-300",dot: "bg-emerald-500"},
  { key: "orange", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", dot: "bg-orange-500" },
  { key: "sky",    bg: "bg-sky-100",    text: "text-sky-800",    border: "border-sky-300",    dot: "bg-sky-500"    },
];

function colorFor(index: number) {
  return COLORS[index % COLORS.length];
}

interface Shift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  title: string | null;
  notes: string | null;
  color: string;
  first_name: string;
  last_name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  status: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ShiftPill({
  shift,
  colorStyle,
  onEdit,
  onDelete,
}: {
  shift: Shift;
  colorStyle: typeof COLORS[0];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: shift.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group relative rounded-md border px-2 py-1 text-xs cursor-grab active:cursor-grabbing select-none transition-opacity
        ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}
        ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
      <div className="font-semibold truncate">{shift.title || `${shift.first_name}`}</div>
      <div className="flex items-center gap-0.5 opacity-70 mt-0.5">
        <Clock className="h-2.5 w-2.5" />
        {shift.start_time}–{shift.end_time}
      </div>
      <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="h-4 w-4 rounded flex items-center justify-center bg-white/80 hover:bg-white transition-colors"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="h-4 w-4 rounded flex items-center justify-center bg-white/80 hover:bg-white transition-colors text-red-500"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

function DroppableCell({
  employeeId,
  date,
  children,
  onClick,
}: {
  employeeId: string;
  date: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${employeeId}__${date}` });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`min-h-[72px] p-1 space-y-1 border-r border-b border-gray-100 transition-colors cursor-pointer group
        ${isOver ? "bg-teal-50" : "hover:bg-gray-50/60"}`}
    >
      {children}
      <div className="hidden group-hover:flex items-center justify-center py-1 text-gray-300 hover:text-teal-400 transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

interface ShiftForm {
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  title: string;
  notes: string;
}

const EMPTY_FORM: ShiftForm = {
  employee_id: "",
  shift_date: "",
  start_time: "08:00",
  end_time: "17:00",
  title: "",
  notes: "",
};

export default function StaffRosterPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [modal, setModal] = useState<{ mode: "add" | "edit"; shift?: Shift; prefill?: Partial<ShiftForm> } | null>(null);
  const [form, setForm] = useState<ShiftForm>(EMPTY_FORM);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  const weekKey = format(weekStart, "yyyy-MM-dd");
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees-active"],
    queryFn: async () => {
      const r = await fetch("/api/payroll/employees", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load employees");
      const data = await r.json();
      return data.filter((e: Employee) => e.status === "active");
    },
  });

  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ["shifts", weekKey],
    queryFn: async () => {
      const r = await fetch(`/api/shifts?weekStart=${weekKey}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load shifts");
      return r.json();
    },
  });

  const createShift = useMutation({
    mutationFn: async (data: ShiftForm) => {
      const r = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shifts"] }); setModal(null); toast({ title: "Shift added" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateShift = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShiftForm> }) => {
      const r = await fetch(`/api/shifts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shifts"] }); setModal(null); toast({ title: "Shift updated" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/shifts/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error(await r.text());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shifts"] }); toast({ title: "Shift deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openAdd(employeeId: string, date: string) {
    setForm({ ...EMPTY_FORM, employee_id: employeeId, shift_date: date });
    setModal({ mode: "add" });
  }

  function openEdit(shift: Shift) {
    setForm({
      employee_id: shift.employee_id,
      shift_date: shift.shift_date.slice(0, 10),
      start_time: shift.start_time,
      end_time: shift.end_time,
      title: shift.title || "",
      notes: shift.notes || "",
    });
    setModal({ mode: "edit", shift });
  }

  function handleSubmit() {
    if (!form.employee_id || !form.shift_date || !form.start_time || !form.end_time) return;
    const empIndex = employees.findIndex(e => e.id === form.employee_id);
    const color = COLORS[empIndex % COLORS.length].key;
    if (modal?.mode === "edit" && modal.shift) {
      updateShift.mutate({ id: modal.shift.id, data: { ...form, color } });
    } else {
      createShift.mutate({ ...form, color } as any);
    }
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const shift = shifts.find(s => s.id === event.active.id);
    setActiveShift(shift || null);
  }, [shifts]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveShift(null);
    if (!event.over) return;
    const [newEmployeeId, newDate] = (event.over.id as string).split("__");
    const shift = shifts.find(s => s.id === event.active.id);
    if (!shift) return;
    if (shift.employee_id === newEmployeeId && shift.shift_date.slice(0, 10) === newDate) return;
    updateShift.mutate({
      id: shift.id,
      data: {
        employee_id: newEmployeeId,
        shift_date: newDate,
        start_time: shift.start_time,
        end_time: shift.end_time,
        title: shift.title || "",
        notes: shift.notes || "",
        color: shift.color,
      },
    });
  }, [shifts, updateShift]);

  const shiftsMap = shifts.reduce<Record<string, Shift[]>>((acc, s) => {
    const key = `${s.employee_id}__${s.shift_date.slice(0, 10)}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const totalHours = (emp: Employee) => {
    const empShifts = shifts.filter(s => s.employee_id === emp.id);
    return empShifts.reduce((sum, s) => {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      return sum + Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);
  };

  const isToday = (d: Date) => format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Staff Roster</h1>
            <p className="text-sm text-muted-foreground">Drag shifts to reschedule • Click a cell to add</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(w => subWeeks(w, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[160px] text-center text-foreground">
            {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(w => addWeeks(w, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {employees.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-16">
          <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center">
            <Users className="h-7 w-7 text-teal-400" />
          </div>
          <p className="font-semibold text-foreground">No active employees yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">Add employees in the Employees section first, then come back to build your roster.</p>
        </div>
      )}

      {/* Grid */}
      {employees.length > 0 && (
        <div className="flex-1 overflow-auto">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <table className="w-full border-collapse text-sm" style={{ minWidth: 800 }}>
              <thead>
                <tr className="bg-muted/40">
                  <th className="w-40 text-left px-4 py-3 border-r border-b border-gray-100 font-semibold text-muted-foreground sticky left-0 bg-muted/40 z-10">
                    Employee
                  </th>
                  {days.map((d, i) => (
                    <th
                      key={i}
                      className={`px-2 py-3 border-r border-b border-gray-100 font-semibold text-center
                        ${isToday(d) ? "text-teal-600" : "text-muted-foreground"}`}
                    >
                      <div className="text-xs">{DAYS[i]}</div>
                      <div className={`text-base font-bold ${isToday(d) ? "text-teal-600" : "text-foreground"}`}>
                        {format(d, "d")}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 border-b border-gray-100 text-center text-xs font-semibold text-muted-foreground w-16">
                    hrs
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, empIdx) => {
                  const c = colorFor(empIdx);
                  return (
                    <tr key={emp.id}>
                      {/* Employee name cell */}
                      <td className="px-4 py-2 border-r border-b border-gray-100 sticky left-0 bg-background z-10 align-top">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${c.dot} shrink-0`} />
                          <div>
                            <div className="font-medium text-foreground text-xs leading-tight">
                              {emp.first_name} {emp.last_name}
                            </div>
                            {emp.position && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">{emp.position}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Day cells */}
                      {days.map((d, i) => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const cellKey = `${emp.id}__${dateStr}`;
                        const cellShifts = shiftsMap[cellKey] || [];
                        return (
                          <td key={i} className="p-0 align-top">
                            <DroppableCell
                              employeeId={emp.id}
                              date={dateStr}
                              onClick={() => openAdd(emp.id, dateStr)}
                            >
                              {cellShifts.map(shift => (
                                <ShiftPill
                                  key={shift.id}
                                  shift={shift}
                                  colorStyle={c}
                                  onEdit={() => openEdit(shift)}
                                  onDelete={() => { if (confirm("Delete this shift?")) deleteShift.mutate(shift.id); }}
                                />
                              ))}
                            </DroppableCell>
                          </td>
                        );
                      })}
                      {/* Weekly hours */}
                      <td className="px-3 border-b border-gray-100 text-center align-middle">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {totalHours(emp).toFixed(1)}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Drag overlay */}
            <DragOverlay>
              {activeShift && (
                <div className="rounded-md border px-2 py-1 text-xs bg-white shadow-lg opacity-90 pointer-events-none w-28">
                  <div className="font-semibold">{activeShift.title || activeShift.first_name}</div>
                  <div className="text-muted-foreground">{activeShift.start_time}–{activeShift.end_time}</div>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Loading shifts…
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-foreground">{modal.mode === "add" ? "Add Shift" : "Edit Shift"}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <Label className="mb-1.5 block">Employee</Label>
                <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Date</Label>
                <Input type="date" value={form.shift_date} onChange={e => setForm(f => ({ ...f, shift_date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 block">End Time</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Role / Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input placeholder="e.g. Cashier, Driver, Supervisor" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea rows={2} placeholder="Any additional info…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSubmit}
                disabled={createShift.isPending || updateShift.isPending}>
                {modal.mode === "add" ? "Add Shift" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
