export type WorkbenchDropTarget = 'A' | 'B';

function isPointInsideRect(
  point: { x: number; y: number },
  rect: DOMRect,
): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function getWorkbenchDropTarget(
  point: { x: number; y: number },
): WorkbenchDropTarget | null {
  const slotA = document.getElementById('workbench-slot-a');
  const slotB = document.getElementById('workbench-slot-b');

  if (slotA && isPointInsideRect(point, slotA.getBoundingClientRect())) {
    return 'A';
  }

  if (slotB && isPointInsideRect(point, slotB.getBoundingClientRect())) {
    return 'B';
  }

  return null;
}
