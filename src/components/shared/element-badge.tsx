import React from "react";
import { Badge } from "@/components/ui/badge";
import { ELEMENT_COLORS } from "@/lib/constants";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { cn } from "@/lib/utils";

interface ElementBadgeProps {
  element: string;
  showIcon?: boolean;
  className?: string;
}

export const ElementBadge = React.memo(function ElementBadge({ element, showIcon = true, className }: ElementBadgeProps) {
  const colors = ELEMENT_COLORS[element];
  const Icon = ELEMENT_ICONS[element];
  if (!colors) return <Badge variant="outline" className={className}>{element}</Badge>;
  return (
    <Badge variant="outline" className={cn(colors.text, colors.bg, colors.border, "gap-1", className)}>
      {showIcon && Icon && <Icon size={12} />}
      {element}
    </Badge>
  );
});
