import re

with open('admin/pages/calendar.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Insert handleResizeStart function inside the Calendar component
resize_func = """  const handleResizeStart = (e: React.MouseEvent, aptId: number, currentDuration: number) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = (deltaY / 80) * 60;
      let newDuration = Math.round((currentDuration + deltaMinutes) / 15) * 15;
      if (newDuration < 15) newDuration = 15;

      setAppointments(prev => prev.map(a => 
        a.id === aptId ? { ...a, duration: newDuration } : a
      ));
    };

    const handleMouseUp = async (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      const deltaY = upEvent.clientY - startY;
      const deltaMinutes = (deltaY / 80) * 60;
      let newDuration = Math.round((currentDuration + deltaMinutes) / 15) * 15;
      if (newDuration < 15) newDuration = 15;

      setAppointments(prev => prev.map(a => 
        a.id === aptId ? { ...a, duration: newDuration } : a
      ));
      
      await handleUpdateAppointment(aptId, { duration: newDuration });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <AdminLayout title={t.calendar.title}>"""

text = text.replace("  return (\n    <AdminLayout title={t.calendar.title}>", resize_func)

# 2. Add resize handle inside day view
day_view_apt_regex = r"(\<span className=\"font-sans text-label-sm truncate\"\>\s*\{client \? `\$\{client\.firstName\} \$\{client\.lastName\}` : ''\}\s*\<\/span\>\s*)(\<\/div\>)"
day_view_handle = r"""\1  <div 
                              className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center group"
                              onMouseDown={(e) => handleResizeStart(e, Number(apt.id), Number(apt.duration))}
                            >
                              <div className="w-8 h-1 bg-black/20 rounded-full mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
\2"""

text = re.sub(day_view_apt_regex, day_view_handle, text)

# 3. Add resize handle inside week view
week_view_apt_regex = r"(\<span className=\"font-sans text-label-sm truncate text-\[11px\] opacity-80\"\>\s*\{groomer \? String\(groomer\.name\) : '—'\}\s*\<\/span\>\s*)(\<\/div\>)"
week_view_handle = r"""\1  <div 
                              className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center group"
                              onMouseDown={(e) => handleResizeStart(e, Number(apt.id), Number(apt.duration))}
                            >
                              <div className="w-6 h-1 bg-black/20 rounded-full mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
\2"""

text = re.sub(week_view_apt_regex, week_view_handle, text)

with open('admin/pages/calendar.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Calendar resizer injected safely.")
