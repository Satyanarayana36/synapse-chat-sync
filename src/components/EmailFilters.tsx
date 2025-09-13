import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw } from "lucide-react";

interface EmailFiltersProps {
  selectedCategory: string;
  selectedPriority: string;
  searchQuery: string;
  showUnreadOnly: boolean;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onUnreadToggle: () => void;
  onRefresh: () => void;
  emailStats: {
    total: number;
    unread: number;
    highPriority: number;
    interested: number;
  };
}

export function EmailFilters({
  selectedCategory,
  selectedPriority,
  searchQuery,
  showUnreadOnly,
  onCategoryChange,
  onPriorityChange,
  onSearchChange,
  onUnreadToggle,
  onRefresh,
  emailStats
}: EmailFiltersProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium">Email Filters & Search</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
            <SelectItem value="sales_lead">Sales Lead</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="out_of_office">Out of Office</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          onClick={onUnreadToggle}
          className="justify-center"
        >
          {showUnreadOnly ? "Show All" : "Unread Only"}
        </Button>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="outline">Total: {emailStats.total}</Badge>
        <Badge variant="destructive">Unread: {emailStats.unread}</Badge>
        <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">
          High Priority: {emailStats.highPriority}
        </Badge>
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          Interested: {emailStats.interested}
        </Badge>
      </div>
    </div>
  );
}