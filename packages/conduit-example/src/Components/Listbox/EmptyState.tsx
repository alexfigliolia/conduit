import { memo, useMemo } from "react";

import type { EmptyStateProps } from "./types";

const DEFAULT_EMPTY_STATE_RENDERER = () => "There are no items to show";

export const EmptyState = memo(
  ({ renderEmptyState = DEFAULT_EMPTY_STATE_RENDERER }: EmptyStateProps) => {
    const content = useMemo(() => renderEmptyState(), [renderEmptyState]);
    return <li className="empty-state">{content}</li>;
  },
);
