export const transformPathCoordinates = (
  pathData: string,
  deltaX: number = 0,
  deltaY: number = 0
) => {
  // Regular expression to match commands and their coordinates
  const pathCommands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g);

  if (!pathCommands) return pathData;

  const transformedCommands = pathCommands.map((cmd) => {
    const command = cmd[0]; // First character is the command (e.g., M, L, etc.)
    const numbers = cmd
      .slice(1)
      .trim()
      .split(/\s+|,/)
      .filter((p) => p !== "")
      .map(Number);
    if (command !== "Z") {
      for (let i = 0; i < numbers.length; i++) {
        numbers[i] = (numbers[i] || 0) + (i % 2 === 0 ? deltaX : deltaY);
      }
    }

    return command + numbers.join(" ");
  });

  return transformedCommands.join(" ");
};
