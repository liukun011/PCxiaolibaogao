// Sidebar Item Component
export const SidebarItem = ({ icon: Icon, label, active = false, badge = 0, onClick }: { icon: any, label: string, active?: boolean, badge?: number, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </div>
);


