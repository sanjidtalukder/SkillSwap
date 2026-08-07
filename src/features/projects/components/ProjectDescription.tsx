import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlignLeft } from "lucide-react";

interface Section {
  title: string | null;
  content: string;
}

function parseSections(text: string): Section[] {
  if (!text || text.trim() === "") return [];

  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentTitle: string | null = "About the Project";
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Markdown Heading: # Title
    const mdMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (mdMatch) {
      if (currentContent.length > 0 || currentTitle !== "About the Project" || currentContent.join("").trim() !== "") {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = mdMatch[1].trim();
      currentContent = [];
      continue;
    }

    // Underline Heading: Title \n ---
    if (
      nextLine &&
      nextLine.trim().match(/^[-=]{3,}$/) &&
      line.trim().length > 0 &&
      !line.trim().match(/^[-*•\d]/) &&
      line.trim().length < 50 // reasonable length for a title
    ) {
      if (currentContent.length > 0 || currentTitle !== "About the Project" || currentContent.join("").trim() !== "") {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = line.trim();
      currentContent = [];
      i++; // Skip underline
      continue;
    }

    currentContent.push(line);
  }

  if (currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }

  // Filter out completely empty sections
  return sections.filter((s) => s.content.trim().length > 0);
}

function parseContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const commitList = () => {
    if (listItems.length > 0) {
      if (listType === "ul") {
        elements.push(<ul className="list-disc pl-6 my-4 space-y-2">{listItems}</ul>);
      } else {
        elements.push(<ol className="list-decimal pl-6 my-4 space-y-2">{listItems}</ol>);
      }
      listItems = [];
      listType = null;
    }
  };

  let paragraphLines: string[] = [];
  const commitParagraph = () => {
    if (paragraphLines.length > 0) {
      elements.push(
        <p className="whitespace-pre-wrap leading-[1.7] text-muted-foreground my-4 break-words">
          {paragraphLines.join("\n")}
        </p>
      );
      paragraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for Unordered List
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      commitParagraph();
      if (listType === "ol") commitList();
      listType = "ul";
      listItems.push(
        <li key={i} className="text-muted-foreground leading-relaxed">
          {ulMatch[1]}
        </li>
      );
      continue;
    }

    // Check for Ordered List
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      commitParagraph();
      if (listType === "ul") commitList();
      listType = "ol";
      listItems.push(
        <li key={i} className="text-muted-foreground leading-relaxed">
          {olMatch[2]}
        </li>
      );
      continue;
    }

    // Blank line
    if (trimmed === "") {
      commitList();
      commitParagraph();
      continue;
    }

    // Regular text line
    commitList();
    paragraphLines.push(line);
  }

  commitList();
  commitParagraph();

  return elements.map((el, i) => React.cloneElement(el as React.ReactElement, { key: i }));
}

interface ProjectDescriptionProps {
  description: string;
}

export function ProjectDescription({ description }: ProjectDescriptionProps) {
  const sections = parseSections(description);

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<AlignLeft className="h-6 w-6" />}
            title="No Description"
            description="The project owner has not provided a description yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-[75ch]">
      {sections.map((section, idx) => (
        <Card key={idx} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {section.title && (
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-4 pt-5 px-6">
              <CardTitle className="text-lg text-foreground/90 font-semibold tracking-tight">
                {section.title}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className="p-6">{parseContent(section.content)}</CardContent>
        </Card>
      ))}
    </div>
  );
}
