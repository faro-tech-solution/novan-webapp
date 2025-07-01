import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  headers: string[]
  children: React.ReactNode
}

const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, headers, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className="text-right">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {children}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return null;
            
            const cells = React.Children.toArray(child.props.children);
            return (
              <div className="bg-white rounded-lg border p-4 space-y-2">
                {cells.map((cell, index) => {
                  if (!React.isValidElement(cell)) return null;
                  return (
                    <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                      <span className="text-sm font-medium text-gray-500">{headers[index]}</span>
                      <div className="text-right">{cell.props.children}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    )
  }
)
ResponsiveTable.displayName = "ResponsiveTable"

export { ResponsiveTable } 