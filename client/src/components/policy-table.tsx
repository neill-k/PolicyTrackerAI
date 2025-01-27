import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Policy } from "@db/schema";
import { format } from "date-fns";

interface PolicyTableProps {
  policies: Policy[];
}

export function PolicyTable({ policies }: PolicyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Implementation Date</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => (
          <TableRow key={policy.id}>
            <TableCell className="font-medium">{policy.title}</TableCell>
            <TableCell>
              <Badge>{policy.category}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                {policy.status}
              </Badge>
            </TableCell>
            <TableCell>
              {policy.implementationDate
                ? format(new Date(policy.implementationDate), "PP")
                : "N/A"}
            </TableCell>
            <TableCell>
              {format(new Date(policy.lastUpdated), "PP")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
