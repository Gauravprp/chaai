export function parseTaskCommand(text, members = []) {
  if (!text || !text.includes('@task')) return { isTask: false };

  const result = {
    isTask: true,
    title: '',
    description: '',
    assignees: [],
    collaborators: [],
    error: null
  };

  // Extract sections using lookaheads
  const taskMatch = text.match(/@task\s+([\s\S]*?)(?=@description|@assignee|@collaborator|$)/i);
  if (taskMatch) {
    result.title = taskMatch[1].trim();
  }

  if (!result.title) {
    result.isTask = false;
    result.error = "Task title is required";
    return result;
  }

  const descMatch = text.match(/@description\s+([\s\S]*?)(?=@task|@assignee|@collaborator|$)/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  // Helper to extract mentioned users and map them to member objects
  const extractUsers = (regex) => {
    const match = text.match(regex);
    if (!match) return [];
    const content = match[1]; // Do not trim yet so we capture trailing spaces if needed
    
    // Split by '@' to get individual mentions
    const parts = content.split('@').filter(Boolean);
    const users = [];
    
    for (const part of parts) {
      const namePart = part.trim().toLowerCase();
      if (!namePart) continue;

      // Find best matching member (e.g., if user typed @John Doe, match "John Doe")
      // Sort members by name length descending to match full names first
      const sortedMembers = [...members].sort((a, b) => b.name.length - a.name.length);
      
      const member = sortedMembers.find(mem => {
        const memName = mem.name.toLowerCase();
        return namePart.startsWith(memName) || memName.startsWith(namePart.split(/\s+/)[0]);
      });

      if (member && !users.some(u => u.id === member.id)) {
        users.push(member);
      }
    }
    return users;
  };

  result.assignees = extractUsers(/@assignee\s+([\s\S]*?)(?=@task|@description|@collaborator|$)/i);
  result.collaborators = extractUsers(/@collaborator\s+([\s\S]*?)(?=@task|@description|@assignee|$)/i);

  return result;
}
