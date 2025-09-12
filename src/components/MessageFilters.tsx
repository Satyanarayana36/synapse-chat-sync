import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface MessageFiltersProps {
  selectedPlatform: string;
  selectedCategory: string;
  searchQuery: string;
  onPlatformChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  messageStats: {
    total: number;
    urgent: number;
    salesLeads: number;
  };
}

export function MessageFilters({
  selectedPlatform,
  selectedCategory, 
  searchQuery,
  onPlatformChange,
  onCategoryChange,
  onSearchChange,
  messageStats
}: MessageFiltersProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-medium">Filters & Search</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedPlatform} onValueChange={onPlatformChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="slack">Slack</SelectItem>
            <SelectItem value="discord">Discord</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="support_request">Support Request</SelectItem>
            <SelectItem value="sales_lead">Sales Lead</SelectItem>
            <SelectItem value="general_query">General Query</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Total: {messageStats.total}</Badge>
          <Badge variant="destructive">Urgent: {messageStats.urgent}</Badge>
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Sales Leads: {messageStats.salesLeads}
          </Badge>
        </div>
      </div>
    </div>
  );
}